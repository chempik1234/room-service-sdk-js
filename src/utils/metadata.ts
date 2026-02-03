/**
 * Metadata utilities for RoomService gRPC calls
 */

import * as grpc from '@grpc/grpc-js';

export interface RoomServiceConfig {
  host: string;
  apiKey: string;
  secure: boolean;
  timeout: number;
  retryAttempts?: number;
}

/**
 * Create gRPC metadata with API key
 */
export function createMetadata(apiKey?: string): grpc.Metadata {
  const metadata = new grpc.Metadata();

  if (apiKey) {
    metadata.set('x-api-key', apiKey);
  }

  return metadata;
}

/**
 * Get API key from config or environment variable
 */
export function getApiKey(config: RoomServiceConfig): string {
  // Priority: config apiKey > environment variable > default
  return (
    config.apiKey ||
    process.env.ROOM_SERVICE_API_KEY ||
    '123'
  );
}

/**
 * Parse host string into host and port
 */
export function parseHost(host: string): { host: string; port: number } {
  const [hostname, portStr] = host.split(':');
  const port = portStr ? parseInt(portStr, 10) : 50050;
  return { host: hostname, port };
}
