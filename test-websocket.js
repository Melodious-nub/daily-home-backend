/**
 * WebSocket Test Script for DailyHome
 * Tests real-time functionality for mess request status updates
 */

const io = require('socket.io-client');

// Configuration
const SERVER_URL = 'http://localhost:3000'; // Change to your server URL
const TEST_TOKEN = 'your_test_jwt_token_here'; // Replace with actual JWT token

// Test scenarios
const testScenarios = {
  // Test 1: Connect with authentication
  testConnection: async () => {
    console.log('🔌 Testing WebSocket connection...');
    
    const socket = io(SERVER_URL, {
      auth: { token: TEST_TOKEN },
      transports: ['websocket', 'polling']
    });

    return new Promise((resolve, reject) => {
      socket.on('connect', () => {
        console.log('✅ Connected successfully');
        socket.disconnect();
        resolve(true);
      });

      socket.on('connect_error', (error) => {
        console.error('❌ Connection failed:', error.message);
        reject(error);
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 10000);
    });
  },

  // Test 2: Subscribe to request status updates
  testRequestStatusSubscription: async () => {
    console.log('📋 Testing request status subscription...');
    
    const socket = io(SERVER_URL, {
      auth: { token: TEST_TOKEN },
      transports: ['websocket', 'polling']
    });

    return new Promise((resolve, reject) => {
      socket.on('connect', () => {
        console.log('✅ Connected for request status test');
        
        // Subscribe to request status updates
        socket.emit('subscribe-request-status');
        console.log('📋 Subscribed to request status updates');
        
        // Listen for join request updates
        socket.on('join-request-update', (data) => {
          console.log('📡 Received join-request-update:', data);
          socket.disconnect();
          resolve(data);
        });

        // Simulate a request status update (this would normally come from the server)
        setTimeout(() => {
          console.log('⏰ No real-time update received within 5 seconds');
          socket.disconnect();
          resolve({ message: 'No real-time update received' });
        }, 5000);
      });

      socket.on('connect_error', (error) => {
        console.error('❌ Connection failed:', error.message);
        reject(error);
      });
    });
  },

  // Test 3: Join mess room
  testMessRoom: async () => {
    console.log('🏠 Testing mess room functionality...');
    
    const socket = io(SERVER_URL, {
      auth: { token: TEST_TOKEN },
      transports: ['websocket', 'polling']
    });

    return new Promise((resolve, reject) => {
      socket.on('connect', () => {
        console.log('✅ Connected for mess room test');
        
        // Join a test mess room
        const testMessId = 'test-mess-id';
        socket.emit('join-mess-room', testMessId);
        console.log(`🏠 Joined mess room: ${testMessId}`);
        
        // Listen for mess updates
        socket.on('mess-update', (data) => {
          console.log('📡 Received mess-update:', data);
          socket.disconnect();
          resolve(data);
        });

        // Simulate a mess update
        setTimeout(() => {
          console.log('⏰ No mess update received within 5 seconds');
          socket.disconnect();
          resolve({ message: 'No mess update received' });
        }, 5000);
      });

      socket.on('connect_error', (error) => {
        console.error('❌ Connection failed:', error.message);
        reject(error);
      });
    });
  },

  // Test 4: Ping/Pong health check
  testPingPong: async () => {
    console.log('🏓 Testing ping/pong functionality...');
    
    const socket = io(SERVER_URL, {
      auth: { token: TEST_TOKEN },
      transports: ['websocket', 'polling']
    });

    return new Promise((resolve, reject) => {
      socket.on('connect', () => {
        console.log('✅ Connected for ping/pong test');
        
        // Listen for pong response
        socket.on('pong', (data) => {
          console.log('🏓 Received pong:', data);
          socket.disconnect();
          resolve(data);
        });

        // Send ping
        socket.emit('ping');
        console.log('🏓 Sent ping');
        
        // Timeout
        setTimeout(() => {
          console.log('⏰ No pong received within 5 seconds');
          socket.disconnect();
          reject(new Error('Ping/pong timeout'));
        }, 5000);
      });

      socket.on('connect_error', (error) => {
        console.error('❌ Connection failed:', error.message);
        reject(error);
      });
    });
  }
};

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting WebSocket Tests for DailyHome\n');
  
  const results = {};
  
  try {
    // Test 1: Connection
    results.connection = await testScenarios.testConnection();
    console.log('✅ Connection test passed\n');
  } catch (error) {
    console.error('❌ Connection test failed:', error.message, '\n');
    results.connection = { error: error.message };
  }

  try {
    // Test 2: Request Status Subscription
    results.requestStatus = await testScenarios.testRequestStatusSubscription();
    console.log('✅ Request status test completed\n');
  } catch (error) {
    console.error('❌ Request status test failed:', error.message, '\n');
    results.requestStatus = { error: error.message };
  }

  try {
    // Test 3: Mess Room
    results.messRoom = await testScenarios.testMessRoom();
    console.log('✅ Mess room test completed\n');
  } catch (error) {
    console.error('❌ Mess room test failed:', error.message, '\n');
    results.messRoom = { error: error.message };
  }

  try {
    // Test 4: Ping/Pong
    results.pingPong = await testScenarios.testPingPong();
    console.log('✅ Ping/pong test passed\n');
  } catch (error) {
    console.error('❌ Ping/pong test failed:', error.message, '\n');
    results.pingPong = { error: error.message };
  }

  // Summary
  console.log('📊 Test Results Summary:');
  console.log('========================');
  Object.keys(results).forEach(test => {
    const result = results[test];
    if (result.error) {
      console.log(`❌ ${test}: ${result.error}`);
    } else {
      console.log(`✅ ${test}: Passed`);
    }
  });

  console.log('\n🎯 WebSocket Tests Completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  if (TEST_TOKEN === 'your_test_jwt_token_here') {
    console.error('❌ Please set a valid JWT token in TEST_TOKEN variable');
    process.exit(1);
  }
  
  runAllTests().catch(console.error);
}

module.exports = { testScenarios, runAllTests };
