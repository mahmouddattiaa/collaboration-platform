const chatHandler = require('./handlers/chatHandler');

const INACTIVITY_LIMIT = 5 * 60 * 1000; // 5 minutes in milliseconds
const CHECK_INTERVAL = 60 * 1000; // Check every minute

const initializeSocket = (io) => {
  const connectedUsers = new Map();

  // Helper to update activity timestamp
  const updateActivity = (socket) => {
    socket.lastActivity = Date.now();
  };

  io.on('connection', (socket) => {
    console.log(
      '✅ Authenticated user connected:',
      socket.user.name,
      'ID:',
      socket.id
    );

    // Initialize activity tracker
    socket.lastActivity = Date.now();
    connectedUsers.set(socket.user._id.toString(), socket.id);

    // Track activity on any incoming event
    socket.onAny(() => {
      updateActivity(socket);
    });

    chatHandler(io, socket);

    socket.on('disconnect', (reason) => {
      console.log('❌ User disconnected:', socket.id, 'Reason:', reason);
      connectedUsers.delete(socket.user._id.toString());
    });
  });

  // Periodic check for inactive users
  setInterval(() => {
    const now = Date.now();
    io.sockets.sockets.forEach((socket) => {
      if (now - socket.lastActivity > INACTIVITY_LIMIT) {
        console.log(`💤 Disconnecting inactive user: ${socket.id} (${socket.user?.name})`);
        socket.emit('inactivity-disconnect', { message: 'You have been disconnected due to inactivity.' });
        socket.disconnect(true);
      }
    });
  }, CHECK_INTERVAL);
};

module.exports = initializeSocket;
