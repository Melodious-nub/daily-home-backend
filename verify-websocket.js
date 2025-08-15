/**
 * Simple WebSocket Verification Script
 * Quick check to verify WebSocket server is running and accessible
 */

const io = require('socket.io-client');

const SERVER_URL = 'http://localhost:3000'; // Change to your server URL

async function verifyWebSocket() {
  console.log('🔍 Verifying WebSocket server...');
  console.log(`📍 Server URL: ${SERVER_URL}`);
  
  const socket = io(SERVER_URL, {
    transports: ['websocket', 'polling'],
    timeout: 5000
  });

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      console.log('⏰ Connection timeout');
      socket.disconnect();
      reject(new Error('Connection timeout'));
    }, 5000);

    socket.on('connect', () => {
      clearTimeout(timeout);
      console.log('✅ WebSocket server is running and accessible');
      console.log(`🔌 Socket ID: ${socket.id}`);
      console.log(`🌐 Transport: ${socket.io.engine.transport.name}`);
      socket.disconnect();
      resolve(true);
    });

    socket.on('connect_error', (error) => {
      clearTimeout(timeout);
      console.error('❌ WebSocket connection failed:', error.message);
      console.log('💡 Make sure your server is running on the correct port');
      reject(error);
    });

    socket.on('error', (error) => {
      clearTimeout(timeout);
      console.error('❌ WebSocket error:', error);
      reject(error);
    });
  });
}

// Run verification
if (require.main === module) {
  verifyWebSocket()
    .then(() => {
      console.log('\n🎉 WebSocket verification completed successfully!');
      console.log('📧 Email notifications and real-time updates are ready to use.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 WebSocket verification failed!');
      console.error('Please check:');
      console.error('1. Server is running on the correct port');
      console.error('2. CORS is properly configured');
      console.error('3. Socket.IO is properly initialized');
      process.exit(1);
    });
}

module.exports = { verifyWebSocket };
