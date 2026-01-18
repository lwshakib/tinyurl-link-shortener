import express, { type Request, type Response } from 'express';
import cors from 'cors';
import path from 'node:path';
import Redis from 'ioredis';
import { getDb, saveDb, type UrlData } from './db.js';
import { shortCodeService } from './services/ShortCodeService.js';

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = path.join(process.cwd(), 'db.json');
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Middleware
app.use(cors());
app.use(express.json());

// Utility function to validate URL
function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

// Routes

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Shorten URL (Simplified: no customAlias)
app.post('/api/shorten', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    // Validate URL
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    if (!isValidUrl(url)) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    const db = await getDb();
    const shortCode = await shortCodeService.getCode();

    // Store in JSON DB
    const urlData: UrlData = {
      originalUrl: url,
      shortCode,
      createdAt: new Date().toISOString(),
      clicks: 0,
    };

    db.urls[shortCode] = urlData;
    await saveDb(db);

    // Cache in Redis using LFU policy
    await addToCache(shortCode, url);

    res.json({
      success: true,
      shortCode,
      shortUrl: `${req.protocol}://${req.get('host')}/${shortCode}`,
      originalUrl: url,
    });
  } catch (error) {
    console.error('Error shortening URL:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const CACHE_LIMIT = 10;
const CACHE_TRACKER_KEY = 'cache:frequency';
const CACHE_TTL = 86400; // 24 hours

// Helper to add to cache with LFU eviction
async function addToCache(shortCode: string, url: string) {
  // Check if we need to evict
  const count = await redis.zcard(CACHE_TRACKER_KEY);
  
  // Only evict if we are at limit AND the key we are adding is not already in the set
  // (though usually this function is called when key is missing)
  const isPresent = await redis.zscore(CACHE_TRACKER_KEY, shortCode);
  
  if (count >= CACHE_LIMIT && !isPresent) {
    // Remove the item with the lowest score (least frequently used)
    // zpopmin returns [member, score]
    const result = await redis.zpopmin(CACHE_TRACKER_KEY);
    if (result && result.length > 0) {
      const victim = result[0] as string;
      await redis.del(victim);
      console.log(`[CACHE] Limit reached. Evicted ${victim} (Least Frequently Used)`);
    }
  }

  // Add/Update cache
  await redis.set(shortCode, url, 'EX', CACHE_TTL);
  
  // If it's a new add, set score to 1. If it exists, zadd with NX ensures we don't reset if we didn't want to,
  // but here we probably want to initialize or reset to 1 if it was missing from cache memory but we are re-adding it.
  // Actually, standard LFU: if it's new to cache, freq is 1.
  await redis.zadd(CACHE_TRACKER_KEY, 1, shortCode);
}

// Redirect to original URL
app.get('/:shortCode', async (req: Request, res: Response) => {
  try {
    const { shortCode } = req.params as { shortCode: string };

    // Check Redis cache first
    const cachedUrl = await redis.get(shortCode);

    if (cachedUrl) {
      console.log(`[CACHE] Hit for ${shortCode}`);
      // Increment frequency score
      await redis.zincrby(CACHE_TRACKER_KEY, 1, shortCode);

      // Setup async update of clicks (fire and forget for response speed)
      (async () => {
        try {
          const db = await getDb();
          if (db.urls[shortCode]) {
            db.urls[shortCode].clicks += 1;
            await saveDb(db);
          }
        } catch (err) {
          console.error('Error updating clicks for cached URL:', err);
        }
      })();
      
      return res.redirect(cachedUrl);
    }

    const db = await getDb();
    console.log(`[CACHE] Miss for ${shortCode} (fetching from DB)`);
    
    const urlData = db.urls[shortCode];
    if (!urlData) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    // Cache the found URL using LFU policy
    await addToCache(shortCode, urlData.originalUrl);

    // Increment click count
    urlData.clicks += 1;
    await saveDb(db);

    // Redirect to original URL
    res.redirect(urlData.originalUrl);
  } catch (error) {
    console.error('Error redirecting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all URLs
app.get('/api/urls', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const urls = Object.values(db.urls).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    res.json({
      success: true,
      urls,
    });
  } catch (error) {
    console.error('Error fetching URLs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete URL
app.delete('/api/urls/:shortCode', async (req: Request, res: Response) => {
  try {
    const { shortCode } = req.params as { shortCode: string };
    const db = await getDb();
    
    if (!db.urls[shortCode]) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    delete db.urls[shortCode];
    await saveDb(db);

    // Remove from Redis cache and tracker
    await redis.del(shortCode);
    await redis.zrem(CACHE_TRACKER_KEY, shortCode);

    res.json({
      success: true,
      message: 'URL deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting URL:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});