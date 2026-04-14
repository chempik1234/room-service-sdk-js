/**
 * Test script to verify enhanced hostname parsing
 */

const { parseHost } = require('./dist/utils/metadata');

console.log('Testing enhanced hostname parsing...\n');

const testCases = [
  { input: 'localhost:50050', expected: { host: 'localhost', port: 50050 } },
  { input: 'roomservice-proxy.up.railway.app', expected: { host: 'roomservice-proxy.up.railway.app', port: 50050 } },
  { input: 'https://roomservice-proxy.up.railway.app', expected: { host: 'roomservice-proxy.up.railway.app', port: 50050 } },
  { input: 'http://roomservice-proxy.up.railway.app', expected: { host: 'roomservice-proxy.up.railway.app', port: 50050 } },
  { input: 'grpc://roomservice-proxy.up.railway.app', expected: { host: 'roomservice-proxy.up.railway.app', port: 50050 } },
  { input: 'roomservice-proxy.up.railway.app:50051', expected: { host: 'roomservice-proxy.up.railway.app', port: 50051 } },
  { input: 'https://roomservice-proxy.up.railway.app:50051', expected: { host: 'roomservice-proxy.up.railway.app', port: 50051 } },
];

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  try {
    const result = parseHost(testCase.input);
    const success = result.host === testCase.expected.host && result.port === testCase.expected.port;

    if (success) {
      console.log(`✅ Test ${index + 1} PASSED: "${testCase.input}"`);
      console.log(`   → ${JSON.stringify(result)}`);
      passed++;
    } else {
      console.log(`❌ Test ${index + 1} FAILED: "${testCase.input}"`);
      console.log(`   Expected: ${JSON.stringify(testCase.expected)}`);
      console.log(`   Got: ${JSON.stringify(result)}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ Test ${index + 1} ERROR: "${testCase.input}"`);
    console.log(`   Error: ${error.message}`);
    failed++;
  }
});

console.log(`\n${'='.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`${'='.repeat(50)}`);

if (failed > 0) {
  process.exit(1);
}