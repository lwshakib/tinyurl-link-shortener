# 🚀 Quick Start Guide

## Prerequisites Check

Before running the application, ensure you have:

1. ✅ **Bun** installed - [Download here](https://bun.sh/)
2. ✅ **Docker Desktop** installed - [Download here](https://www.docker.com/products/docker-desktop/)
3. ✅ **Git** (optional) - For version control

## Option 1: Using Docker Compose (Recommended)

This is the easiest way to run the entire application with all services.

### Steps:

1. **Open a terminal in the project root directory**

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Wait for services to start** (about 30 seconds)

4. **Access the application**
   - 🌐 Frontend: http://localhost:3000
   - 🔧 Backend API: http://localhost:3001
   - 📊 Redis: localhost:6379

5. **View logs** (optional)
   ```bash
   docker-compose logs -f
   ```

6. **Stop all services**
   ```bash
   docker-compose down
   ```

## Option 2: Local Development

If you want to run services individually for development:

### Step 1: Start Redis

```bash
docker run -d --name tinyurl-redis -p 6379:6379 redis:7-alpine
```

### Step 2: Start the Backend Server

```bash
cd server
bun install
bun run dev
```

The server will start on http://localhost:3001

### Step 3: Start the Frontend (in a new terminal)

```bash
cd web
bun install
bun run dev
```

The web app will start on http://localhost:3000

## Testing the Application

1. **Open your browser** to http://localhost:3000

2. **Enter a long URL** in the input field
   - Example: `https://www.example.com/very/long/url/that/needs/shortening`

3. **Optional: Add a custom alias**
   - Example: `my-link`

4. **Click "Shorten URL"**

5. **Copy and use your shortened URL!**

## Troubleshooting

### Docker not found
- Install Docker Desktop from https://www.docker.com/products/docker-desktop/
- Make sure Docker Desktop is running

### Port already in use
- Stop any services using ports 3000, 3001, or 6379
- Or modify the ports in `docker-compose.yml`

### Redis connection error
- Make sure Redis is running
- Check the `REDIS_URL` in `server/.env`

### Frontend can't connect to backend
- Make sure the backend is running on port 3001
- Check `NEXT_PUBLIC_API_URL` in `web/.env.local`

## Next Steps

- 📖 Read the full [README.md](README.md) for detailed documentation
- 🔧 Customize the configuration in `.env` files
- 🎨 Modify the UI in `web/app/page.tsx`
- 🚀 Deploy to production using Docker

## Support

If you encounter any issues:
1. Check the logs: `docker-compose logs -f`
2. Restart services: `docker-compose restart`
3. Clean restart: `docker-compose down -v && docker-compose up -d`

---

Happy URL shortening! 🎉
