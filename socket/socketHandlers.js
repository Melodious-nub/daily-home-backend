const socketHandlers = (io, socket) => {
  console.log(`📡 Socket handlers initialized for user: ${socket.userId}`);

  // Join mess room for real-time updates
  socket.on('join-mess-room', (messId) => {
    socket.join(`mess:${messId}`);
    console.log(`👥 User ${socket.userId} joined mess room: ${messId}`);
  });

  // Leave mess room
  socket.on('leave-mess-room', (messId) => {
    socket.leave(`mess:${messId}`);
    console.log(`👥 User ${socket.userId} left mess room: ${messId}`);
  });

  // Subscribe to join request status updates
  socket.on('subscribe-request-status', () => {
    socket.join(`request-status:${socket.userId}`);
    console.log(`📋 User ${socket.userId} subscribed to request status updates`);
  });

  // Unsubscribe from join request status updates
  socket.on('unsubscribe-request-status', () => {
    socket.leave(`request-status:${socket.userId}`);
    console.log(`📋 User ${socket.userId} unsubscribed from request status updates`);
  });

  // Handle ping/pong for connection health
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: Date.now() });
  });

  // Handle user typing indicators (for future chat features)
  socket.on('typing-start', (data) => {
    socket.to(`mess:${data.messId}`).emit('user-typing', {
      userId: socket.userId,
      userName: socket.user.fullName,
      isTyping: true
    });
  });

  socket.on('typing-stop', (data) => {
    socket.to(`mess:${data.messId}`).emit('user-typing', {
      userId: socket.userId,
      userName: socket.user.fullName,
      isTyping: false
    });
  });

  // Handle custom events
  socket.on('custom-event', (data) => {
    console.log(`📡 Custom event from ${socket.userId}:`, data);
    // Handle custom events as needed
  });
};

module.exports = socketHandlers;
