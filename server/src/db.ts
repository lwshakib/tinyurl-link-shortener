import fs from 'node:fs/promises';
import path from 'node:path';

const DB_PATH = path.join(process.cwd(), 'db.json');

export interface UrlData {
  originalUrl: string;
  shortCode: string;
  createdAt: string;
  clicks: number;
}

export interface Database {
  urls: Record<string, UrlData>;
}

export async function getDb(): Promise<Database> {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty database
    const initialDb: Database = { urls: {} };
    await fs.writeFile(DB_PATH, JSON.stringify(initialDb, null, 2));
    return initialDb;
  }
}

export async function saveDb(db: Database): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
}
