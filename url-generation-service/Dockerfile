FROM oven/bun:1

WORKDIR /app

COPY package.json ./
COPY bun.lock* ./

RUN bun install

COPY . .

# We need access to proto and db from parent/sibling logic if not mounted
# But in Docker standard practice, we copy explicitly or mount
# Here we assume volumes will map the shared resources

CMD ["bun", "run", "src/index.ts"]
