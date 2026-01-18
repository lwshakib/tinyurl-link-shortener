import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

// Load proto
// In Docker, we will mount proto folder to /app/proto or similar, so relative path might need adjustment
// Local path: ../../../proto/shortcode.proto
const PROTO_PATH = path.join(process.cwd(), '../proto/shortcode.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const shortcodeProto = grpc.loadPackageDefinition(packageDefinition).shortcode as any;

// If running in Docker, hostname is the service name. If local, localhost.
const SERVICE_URL = process.env.URL_GEN_SERVICE_URL || 'localhost:50051';

export class ShortCodeService {
  private client: any;

  constructor() {
    this.client = new shortcodeProto.ShortCodeService(
      SERVICE_URL,
      grpc.credentials.createInsecure()
    );
  }

  public getCode(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.client.GetShortCode({}, (error: any, response: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(response.code);
        }
      });
    });
  }
}

export const shortCodeService = new ShortCodeService();
