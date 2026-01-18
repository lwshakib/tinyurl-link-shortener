import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import fs from 'node:fs/promises';
import { nanoid } from 'nanoid';

const PROTO_PATH = path.join(process.cwd(), '../proto/shortcode.proto');
const DB_PATH = path.join(process.cwd(), '../server/db.json');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const shortcodeProto = grpc.loadPackageDefinition(packageDefinition).shortcode as any;

const POOL_SIZE = 10;
const pool: string[] = [];
let isRefilling = false;

// DB Helper (Read-only for uniqueness check)
async function getDbUrls(): Promise<Record<string, any>> {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const json = JSON.parse(data);
    return json.urls || {};
  } catch (error) {
    return {};
  }
}

async function generateUniqueCode(): Promise<string> {
  const dbUrls = await getDbUrls();
  let isUnique = false;
  let code = '';

  while (!isUnique) {
    code = nanoid(7);
    // Check DB and current pool
    if (!dbUrls[code] && !pool.includes(code)) {
      isUnique = true;
    }
  }
  return code;
}

async function refillPool() {
  if (isRefilling) return;
  isRefilling = true;

  try {
    while (pool.length < POOL_SIZE) {
      const code = await generateUniqueCode();
      pool.push(code);
      console.log(`[GENERATOR] Generated: ${code}. Pool size: ${pool.length}`);
    }
  } catch (error) {
    console.error('Error refilling pool:', error);
  } finally {
    isRefilling = false;
  }
}

// Initial fill
refillPool();

function getShortCode(call: any, callback: any) {
  if (pool.length === 0) {
    // If pool empty, force generate one
    generateUniqueCode().then(code => {
      callback(null, { code });
      refillPool();
    });
    return;
  }

  const code = pool.shift();
  console.log(`[GENERATOR] Served: ${code}. Remaining: ${pool.length}`);
  callback(null, { code });

  // Trigger refill
  refillPool();
}

function main() {
  const server = new grpc.Server();
  server.addService(shortcodeProto.ShortCodeService.service, { GetShortCode: getShortCode });
  
  const address = '0.0.0.0:50051';
  server.bindAsync(address, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`gRPC Server running at ${address}`);
  });
}

main();
