/**
 * Real-Time Streaming with Multi-Tenant Authentication
 *
 * This example demonstrates how to use RoomService streaming
 * with multi-tenant proxy authentication for real-time applications.
 */

import { RoomServiceClient, RoomServiceError } from 'room-service-js';

async function streamingDemo() {
  console.log('=== RoomService Real-Time Streaming Demo ===\n');

  // Create client with multi-tenant authentication
  const client = new RoomServiceClient({
    host: process.env.ROOM_SERVICE_HOST || 'https://roomservice-proxy.up.railway.app',
    apiKey: process.env.ROOM_SERVICE_API_KEY || 'rs_live_yourtenantid_uuid'
  });

  console.log('✅ Client created with multi-tenant authentication\n');

  try {
    // Open a bidirectional stream
    console.log('Opening real-time stream...');
    const stream = await client.openStream();
    console.log('✅ Stream opened successfully\n');

    // Set up event handlers
    console.log('Setting up event handlers...');

    // Listen to all events
    stream.on('event', (event) => {
      console.log(`📩 Event: ${event.type}`);
    });

    // Listen for specific events
    stream.on('RoomCreated', (event) => {
      console.log(`🏠 Room created: ${event.roomId}`);
    });

    stream.on('JoinedRoom', (event) => {
      console.log(`👤 User joined: ${event.user?.name || 'Unknown'}`);
    });

    stream.on('LeftRoom', (event) => {
      console.log(`👋 User left: ${event.userId}`);
    });

    stream.on('DataEdited', (event) => {
      console.log(`📝 Data changed: ${event.dataId} = ${JSON.stringify(event.value)}`);
    });

    stream.on('OwnerChanged', (event) => {
      console.log(`🔑 Owner changed: ${event.previousOwnerId} → ${event.newOwnerId}`);
    });

    stream.on('FullRoomSnapshot', (event) => {
      console.log(`📸 Full snapshot received for room: ${event.roomId}`);
      console.log(`   Users: ${event.fullRoom?.users?.map(u => u.name).join(', ') || 'None'}`);
      console.log(`   Data keys: ${Object.keys(event.fullRoom?.data || {}).join(', ') || 'None'}`);
    });

    // Error handling
    stream.on('error', (error) => {
      if (error instanceof RoomServiceError) {
        console.log(`❌ Stream error: ${error.getUserMessage()}`);

        // Enhanced error handling
        if (error.isServerError()) {
          console.log('💡 Server error - will attempt reconnection');
        } else if (error.isAuthenticationError()) {
          console.log('💡 Authentication failed - check your API key');
        }
      } else {
        console.log('❌ Unknown stream error:', error.message);
      }
    });

    console.log('✅ Event handlers registered\n');

    // Create a room via stream
    console.log('Creating room via stream...';
    await stream.createRoom({
      game_type: 'streaming-demo',
      max_users: '5',
      status: 'waiting'
    });
    console.log('✅ Room creation command sent\n');

    // Wait a bit for the room creation event
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Join the room via stream
    const userId = 'streamer-' + Date.now();
    const roomId = 'demo-room-' + Date.now(); // In real usage, get from RoomCreated event

    console.log(`Joining room ${roomId} as ${userId}...`);
    await stream.joinRoom(roomId, {
      userId,
      userName: 'Streaming User',
      metadata: {
        avatar: '🎮',
        country: 'US'
      }
    });
    console.log('✅ Join command sent\n');

    // Set some data via stream
    console.log('Setting game data via stream...');
    await stream.setData(roomId, userId, 'status', 'active');
    await stream.setData(roomId, userId, 'gameState', {
      currentPlayer: userId,
      board: ['', '', '', '', '', '', '', '', ''],
      moves: []
    });
    await stream.setData(roomId, userId, 'players', [userId]);
    console.log('✅ Data commands sent\n');

    // Listen for events for a few seconds
    console.log('Listening for events (5 seconds)...');
    console.log('Press Ctrl+C to stop early\n');

    await new Promise(resolve => setTimeout(resolve, 5000));

    // Clean up
    console.log('\nClosing stream...');
    await stream.close();
    console.log('✅ Stream closed');

    await client.close();
    console.log('✅ Connection closed');

  } catch (error) {
    // Enhanced error handling
    if (error instanceof RoomServiceError) {
      console.log('❌ RoomService Error:');
      console.log('   Code:', error.code);
      console.log('   Message:', error.getUserMessage());

      // Specific error handling
      if (error.isAuthenticationError()) {
        console.log('   💡 Check your API key format: rs_live_tenantid_uuid');
      } else if (error.isServerError()) {
        console.log('   💡 The RoomService instance may be down - try again later');
      } else if (error.isNotFoundError()) {
        console.log('   💡 Make sure the room exists');
      }

    } else {
      console.log('❌ Unexpected error:', error.message);
    }

    await client.close();
  }
}

// Run the demo
console.log('Starting real-time streaming demo...\n');
console.log('Requirements:');
console.log('  ROOM_SERVICE_HOST - Your proxy host (e.g., https://roomservice-proxy.up.railway.app)');
console.log('  ROOM_SERVICE_API_KEY - Your tenant API key (e.g., rs_live_yourtenantid_uuid)');
console.log('');

streamingDemo().catch(console.error);