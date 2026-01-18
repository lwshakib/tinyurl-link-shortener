# TinyURL API Server

The core backend service for the TinyURL application. It handles HTTP requests, manages the JSON database, interfaces with Redis for caching, and communicates with the gRPC URL Generation Service.

## 🔧 Setup

```bash
bun install
bun dev
```

## 🔌 API Endpoints

*   `POST /api/shorten`: Create a new short URL.
*   `GET /:shortCode`: Redirect to the original URL.
*   `GET /api/urls`: List all shortened URLs.
*   `DELETE /api/urls/:shortCode`: Delete a URL.

## 💾 Caching Strategy (Redis)

We implement a **Least Frequently Used (LFU)** eviction policy:
*   **Limit**: Tracks usage for active items.
*   **Eviction**: If the cache limit (default: 10) is reached, the least frequently accessed item is removed.
*   **Duration**: Keys expire after 24 hours.

### 🐛 Debugging

To view the cache in real-time, you can use **RedisInsight** or the CLI:

```bash
docker exec -it tinyurl-redis redis-cli zrange cache:frequency 0 -1 WITHSCORES
```
