/**
 * Test script to verify enhanced error handling
 */

const { RoomServiceError, wrapGrpcError, isGrpcError } = require('./dist/utils/errors');

console.log('Testing enhanced error handling...\n');

// Test 1: RoomServiceError creation with user-friendly messages
console.log('Test 1: RoomServiceError user-friendly messages');
const errorCodes = [
  { code: 16, message: 'Invalid API key', expected: 'Authentication failed - check your API key' },
  { code: 7, message: 'Permission denied', expected: 'Permission denied - your tenant may be suspended' },
  { code: 5, message: 'Room not found', expected: 'Room not found - verify the room ID' },
  { code: 13, message: 'Internal server error', expected: 'Server error - the service is temporarily unavailable' },
  { code: 14, message: 'Service unavailable', expected: 'Service unavailable - please try again in a moment' },
  { code: 3, message: 'Invalid argument', expected: 'Invalid request format - check your command data' },
  { code: 8, message: 'Rate limited', expected: 'Rate limit exceeded - please try again later' },
];

let passed = 0;
let failed = 0;

errorCodes.forEach((test) => {
  const error = new RoomServiceError(test.message, test.code);
  const userMessage = error.getUserMessage();
  if (userMessage === test.expected) {
    console.log(`✅ Code ${test.code}: "${userMessage}"`);
    passed++;
  } else {
    console.log(`❌ Code ${test.code}: Expected "${test.expected}", got "${userMessage}"`);
    failed++;
  }
});

// Test 2: Error type checking methods
console.log('\nTest 2: Error type checking methods');
const authError = new RoomServiceError('Invalid token', 16);
const permError = new RoomServiceError('Access denied', 7);
const notFoundError = new RoomServiceError('Room missing', 5);
const serverError = new RoomServiceError('Server crashed', 13);

if (authError.isAuthenticationError()) {
  console.log('✅ Authentication error detection works');
  passed++;
} else {
  console.log('❌ Authentication error detection failed');
  failed++;
}

if (permError.isPermissionError()) {
  console.log('✅ Permission error detection works');
  passed++;
} else {
  console.log('❌ Permission error detection failed');
  failed++;
}

if (notFoundError.isNotFoundError()) {
  console.log('✅ Not found error detection works');
  passed++;
} else {
  console.log('❌ Not found error detection failed');
  failed++;
}

if (serverError.isServerError()) {
  console.log('✅ Server error detection works');
  passed++;
} else {
  console.log('❌ Server error detection failed');
  failed++;
}

// Test 3: wrapGrpcError with proper type safety
console.log('\nTest 3: wrapGrpcError type safety');
const grpcError = {
  code: 13,
  message: 'Internal server error',
  details: 'Database connection failed'
};

const wrappedError = wrapGrpcError(grpcError);
if (wrappedError instanceof RoomServiceError) {
  console.log('✅ gRPC error wrapping produces RoomServiceError');
  passed++;
} else {
  console.log('❌ gRPC error wrapping failed');
  failed++;
}

// Test 4: isGrpcError type guard
console.log('\nTest 4: isGrpcError type guard');
const validGrpcError = { code: 16, message: 'Test error' };
const invalidError = { message: 'Test error' };
const nonObject = null;

if (isGrpcError(validGrpcError)) {
  console.log('✅ Valid gRPC error detected');
  passed++;
} else {
  console.log('❌ Valid gRPC error not detected');
  failed++;
}

if (!isGrpcError(invalidError)) {
  console.log('✅ Invalid error correctly rejected');
  passed++;
} else {
  console.log('❌ Invalid error incorrectly accepted');
  failed++;
}

if (!isGrpcError(nonObject)) {
  console.log('✅ Non-object correctly rejected');
  passed++;
} else {
  console.log('❌ Non-object incorrectly accepted');
  failed++;
}

// Test 5: Error details preservation
console.log('\nTest 5: Error details preservation');
const detailedError = new RoomServiceError(
  'Main error message',
  13,
  'Detailed error message',
  { key: 'value' }
);

if (detailedError.message === 'Main error message' &&
    detailedError.code === 13 &&
    detailedError.details === 'Detailed error message' &&
    detailedError.metadata?.key === 'value') {
  console.log('✅ Error details preserved correctly');
  passed++;
} else {
  console.log('❌ Error details not preserved');
  failed++;
}

console.log(`\n${'='.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`${'='.repeat(50)}`);

if (failed > 0) {
  process.exit(1);
}