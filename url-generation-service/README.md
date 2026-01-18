# URL Generation Service (gRPC)

A specialized microservice responsible for generating unique, non-colliding short codes.

## ⚙️ How It Works

*   **Pre-generation**: Maintains an in-memory pool of 10 validated unique codes.
*   **Database Check**: Verifies against `db.json` to ensure no duplicates exist.
*   **Protocol**: Exposes functionality via **gRPC**.

## 🚀 Run

```bash
bun install
bun run src/index.ts
```

Runs on port `50051`.
