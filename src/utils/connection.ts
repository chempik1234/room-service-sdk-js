/**
 * Connection management for RoomService
 */

import * as grpc from '@grpc/grpc-js';
import * as fs from 'fs';
import * as path from 'path';
import { parseHost, getApiKey, type RoomServiceConfig } from './metadata';

/**
 * Create gRPC client credentials
 */
export function createCredentials(secure: boolean = false): grpc.ChannelCredentials {
  if (secure) {
    // For secure connections, you might want to load SSL certificates
    // For now, use default secure credentials
    return grpc.ChannelCredentials.createSsl();
  }
  return grpc.ChannelCredentials.createInsecure();
}

/**
 * Load the RoomService proto file and create a client
 */
export function createGrpcClient(config: RoomServiceConfig): any {
  const { host, port } = parseHost(config.host);
  const credentials = createCredentials(config.secure);
  const apiKey = getApiKey(config);

  // Load proto definition from the RoomService project
  const protoPath = path.resolve(__dirname, '../../../RoomService/api/room_service/room_service.proto');

  // Check if proto file exists
  if (!fs.existsSync(protoPath)) {
    // Fallback: try to load from relative path
    const alternativePath = path.resolve(__dirname, '../../api/room_service/room_service.proto');
    if (fs.existsSync(alternativePath)) {
      return loadProto(alternativePath, host, port, credentials, apiKey);
    }
    throw new Error(
      `Proto file not found at ${protoPath}. ` +
      `Make sure RoomService is checked out at ../RoomService or run ` +
      `'npm run build-proto' to generate protobuf definitions.`
    );
  }

  return loadProto(protoPath, host, port, credentials, apiKey);
}

/**
 * Load proto and create gRPC client
 */
function loadProto(
  protoPath: string,
  host: string,
  port: number,
  credentials: grpc.ChannelCredentials,
  apiKey: string
): any {
  const protoDefinition = grpc.load(protoPath, undefined, {}) as any;

  if (!protoDefinition.api || !protoDefinition.api.RoomService) {
    throw new Error(`Failed to load RoomService from ${protoPath}`);
  }

  const RoomServiceClient = protoDefinition.api.RoomService;
  const address = `${host}:${port}`;

  return new RoomServiceClient(address, credentials, {
    'grpc.max_receive_message_length': -1, // Unlimited message size
    'grpc.max_send_message_length': -1,
  });
}

/**
 * Create a call with metadata
 */
export function createCallWithMetadata(
  client: any,
  method: string,
  request: any,
  apiKey: string,
  callback: (error: any, response: any) => void
) {
  const metadata = new grpc.Metadata();
  if (apiKey) {
    metadata.set('x-api-key', apiKey);
  }

  client[method](request, metadata, callback);
}
