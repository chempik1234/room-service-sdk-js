/**
 * Multi-Tenant Authentication Example
 *
 * This example demonstrates how to use the RoomService SDK
 * with multi-tenant proxy authentication and enhanced hostname handling.
 */

import { RoomServiceClient, RoomServiceError } from 'room-service-js';

async function multiTenantExample() {
  console.log('=== RoomService Multi-Tenant Authentication Demo ===\n');

  // Example 1: Using proxy with various hostname formats
  console.log('Example 1: Smart Hostname Handling');
  console.log('-'.repeat(40));

  const hostnameFormats = [
    'roomservice-proxy.up.railway.app',
    'https://roomservice-proxy.up.railway.app',
    'http://roomservice-proxy.up.railway.app',
    'grpc://roomservice-proxy.up.railway.app',
    'roomservice-proxy.up.railway.app:50051',
    'https://roomservice-proxy.up.railway.app:50051',
  ];

  hostnameFormats.forEach((host) => {
    console.log(`✅ "${host}" - Supported format`);
  });

  console.log('\nAll hostname formats work automatically! 🎉\n');

  // Example 2: Creating client with multi-tenant authentication
  console.log('Example 2: Multi-Tenant Client Setup');
  console.log('-'.repeat(40));

  const client = new RoomServiceClient({
    // You can use any hostname format - SDK handles it automatically
    host: process.env.ROOM_SERVICE_HOST || 'https://roomservice-proxy.up.railway.app',

    // Your tenant's API key from control panel (format: rs_live_tenantid_uuid)
    apiKey: process.env.ROOM_SERVICE_API_KEY || 'rs_live_yourtenantid_uuid',

    // Connection options
    secure: false,        // Use TLS (default: false)
    timeout: 10000        // Request timeout in ms
  });

  console.log('✅ Client created successfully');
  console.log('   Host:', process.env.ROOM_SERVICE_HOST || 'https://roomservice-proxy.up.railway.app');
  console.log('   API Key:', process.env.ROOM_SERVICE_API_KEY?.substring(0, 20) + '...' || 'rs_live_yourtenantid_...');

  // Example 3: Enhanced error handling
  console.log('\nExample 3: Enhanced Error Handling');
  console.log('-'.repeat(40));

  try {
    // Try to create a room
    const roomId = await client.createRoom({
      game_type: 'multiplayer-demo',
      max_users: '10'
    });
    console.log('✅ Room created:', roomId);

    // Example 4: Using the room
    console.log('\nExample 4: Room Operations');
    console.log('-'.repeat(40));

    const userId = 'user-' + Date.now();

    // Join room
    await client.joinRoom(roomId, {
      userId,
      userName: 'Demo User',
      metadata: {
        avatar: '🎮',
        country: 'US'
      }
    });
    console.log('✅ Joined room as:', userId);

    // Set some data
    await client.setData(roomId, userId, 'status', 'active');
    await client.setData(roomId, userId, 'players', ['Player 1', 'Player 2']);
    await client.setData(roomId, userId, 'config', {
      maxPlayers: 10,
      private: false,
      gameMode: 'casual'
    });
    console.log('✅ Data set successfully');

    // Get room snapshot
    const snapshot = await client.getRoomSnapshot(roomId, userId);
    console.log('✅ Room snapshot retrieved');
    console.log('   Users:', snapshot.users.map(u => u.name).join(', '));
    console.log('   Data keys:', Object.keys(snapshot.data).join(', '));

    // Example 5: Demonstrate error handling
    console.log('\nExample 5: Error Handling Demonstration');
    console.log('-'.repeat(40));

    // Try to access a non-existent room
    try {
      await client.getRoomSnapshot('non-existent-room', userId);
    } catch (error) {
      if (error instanceof RoomServiceError) {
        console.log('✅ Error caught and handled properly');
        console.log('   Error code:', error.code);
        console.log('   Error message:', error.message);

        // Use error type checking
        if (error.isNotFoundError()) {
          console.log('   ✅ Correctly identified as NotFound error');
        }

        // Get user-friendly message
        console.log('   User-friendly:', error.getUserMessage());
      }
    }

    // Clean up
    console.log('\nExample 6: Cleanup');
    console.log('-'.repeat(40));

    await client.leaveRoom(roomId, userId);
    console.log('✅ Left room');

    await client.close();
    console.log('✅ Connection closed');

  } catch (error) {
    // Enhanced error handling with type safety
    if (error instanceof RoomServiceError) {
      console.log('❌ RoomService Error:');
      console.log('   Code:', error.code);
      console.log('   Message:', error.message);

      // Check specific error types
      if (error.isAuthenticationError()) {
        console.log('   💡 Solution: Check your API key in the control panel');
      } else if (error.isPermissionError()) {
        console.log('   💡 Solution: Your tenant may be suspended');
      } else if (error.isServerError()) {
        console.log('   💡 Solution: The service is temporarily unavailable - try again later');
      } else if (error.isNotFoundError()) {
        console.log('   💡 Solution: Verify the room ID');
      }

      // User-friendly message
      console.log('   User-friendly:', error.getUserMessage());

    } else {
      console.log('❌ Unexpected error:', error.message);
    }

    await client.close();
  }
}

// Run the example
console.log('Starting multi-tenant authentication example...\n');
console.log('Make sure to set these environment variables:');
console.log('  ROOM_SERVICE_HOST=your-proxy-host');
console.log('  ROOM_SERVICE_API_KEY=rs_live_yourtenantid_uuid');
console.log('');

multiTenantExample().catch(console.error);