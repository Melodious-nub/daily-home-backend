/**
 * Socket.IO Event Emitter Utility
 * Provides centralized functions to emit real-time events
 */

const emitJoinRequestUpdate = (userId, status, messData = null) => {
  try {
    if (!global.io) {
      console.warn('Socket.IO not initialized');
      return;
    }

    const eventData = {
      status,
      message: getStatusMessage(status),
      timestamp: new Date().toISOString(),
      mess: messData
    };

    // Emit to specific user's request status room
    global.io.to(`request-status:${userId}`).emit('join-request-update', eventData);
    
    // Also emit to user's personal room
    global.io.to(`user:${userId}`).emit('join-request-update', eventData);

    console.log(`📡 Emitted join-request-update to user ${userId}:`, eventData);
  } catch (error) {
    console.error('Error emitting join request update:', error);
  }
};

const emitMessUpdate = (messId, eventType, data) => {
  try {
    if (!global.io) {
      console.warn('Socket.IO not initialized');
      return;
    }

    const eventData = {
      type: eventType,
      data,
      timestamp: new Date().toISOString()
    };

    // Emit to mess room
    global.io.to(`mess:${messId}`).emit('mess-update', eventData);

    console.log(`📡 Emitted mess-update to mess ${messId}:`, eventData);
  } catch (error) {
    console.error('Error emitting mess update:', error);
  }
};

const emitUserNotification = (userId, notificationType, data) => {
  try {
    if (!global.io) {
      console.warn('Socket.IO not initialized');
      return;
    }

    const eventData = {
      type: notificationType,
      data,
      timestamp: new Date().toISOString()
    };

    // Emit to user's personal room
    global.io.to(`user:${userId}`).emit('notification', eventData);

    console.log(`📡 Emitted notification to user ${userId}:`, eventData);
  } catch (error) {
    console.error('Error emitting user notification:', error);
  }
};

const getStatusMessage = (status) => {
  switch (status) {
    case 'accepted':
      return 'Your join request has been accepted!';
    case 'rejected':
      return 'Your join request was rejected.';
    case 'pending':
      return 'Your join request is pending approval.';
    default:
      return 'Request status updated.';
  }
};

// Connection status utilities
const getConnectedUsers = () => {
  if (!global.io) return [];
  
  const connectedUsers = [];
  global.io.sockets.sockets.forEach((socket) => {
    if (socket.userId) {
      connectedUsers.push({
        userId: socket.userId,
        userName: socket.user?.fullName,
        connectedAt: socket.handshake.time
      });
    }
  });
  
  return connectedUsers;
};

const isUserConnected = (userId) => {
  if (!global.io) return false;
  
  let connected = false;
  global.io.sockets.sockets.forEach((socket) => {
    if (socket.userId === userId) {
      connected = true;
    }
  });
  
  return connected;
};

module.exports = {
  emitJoinRequestUpdate,
  emitMessUpdate,
  emitUserNotification,
  getConnectedUsers,
  isUserConnected
};
