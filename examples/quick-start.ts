/**
 * Quick Start Example
 *
 * This example shows the basic usage of the RoomService SDK.
 */

import { RoomServiceClient } from 'room-service-js';

async function quickStart() {
  // 1. Create a client
  const client = new RoomServiceClient({
    host: 'localhost:50050',
    apiKey: process.env.ROOM_SERVICE_API_KEY || '123'
  });

  console.log('Connected to RoomService');

  try {
    // 2. Create a room
    console.log('\n--- Creating Room ---');
    const roomId = await client.createRoom({
      game_type: 'demo',
      max_users: '5'
    });
    console.log('Room created:', roomId);

    // 3. Join the room
    console.log('\n--- Joining Room ---');
    const userId = 'user-' + Date.now();
    await client.joinRoom(roomId, {
      userId,
      userName: 'Alice',
      metadata: {
        avatar: 'cat.png',
        country: 'US'
      }
    });
    console.log('Joined as:', userId);

    // 4. Set some data
    console.log('\n--- Setting Data ---');
    await client.setData(roomId, userId, 'status', 'active');
    await client.setData(roomId, userId, 'count', 42);
    await client.setData(roomId, userId, 'tags', ['demo', 'example']);
    await client.setData(roomId, userId, 'config', {
      maxPlayers: 10,
      private: false
    });
    console.log('Data set successfully');

    // 5. Get room snapshot
    console.log('\n--- Room Snapshot ---');
    const snapshot = await client.getRoomSnapshot(roomId, userId);
    console.log('Users:', snapshot.users.map(u => u.name));
    console.log('Data:', snapshot.data);
    console.log('Options:', snapshot.roomOptions);

    // 6. List all rooms
    console.log('\n--- All Rooms ---');
    const rooms = await client.listRooms();
    console.log('Total rooms:', rooms.length);
    rooms.forEach(room => {
      console.log(`- ${room.roomId}: ${JSON.stringify(room.roomOptions)}`);
    });

    // 7. Data operations
    console.log('\n--- Data Operations ---');

    // APPEND to list
    await client.appendToList(roomId, userId, 'chat', 'Hello!');
    await client.appendToList(roomId, userId, 'chat', 'How are you?');
    console.log('Appended to chat list');

    // Read updated data
    const updated = await client.getRoomSnapshot(roomId, userId);
    console.log('Chat messages:', updated.data.chat);

    // DELETE data
    await client.deleteData(roomId, userId, 'tags');
    console.log('Deleted tags');

    // 8. Clean up
    console.log('\n--- Cleanup ---');
    await client.leaveRoom(roomId, userId);
    console.log('Left room');
    await client.close();
    console.log('Connection closed');

  } catch (error) {
    console.error('Error:', error.message);
    await client.close();
  }
}

// Run the example
quickStart().catch(console.error);
