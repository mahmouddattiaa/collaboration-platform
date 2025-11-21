const chatHandler = require('./handlers/chatHandler');

const initializeSocket = (io) => {
  const connectedUsers = new Map();

  io.on('connection', (socket) => {
    console.log(
      '✅ Authenticated user connected:',
      socket.user.name,
      'ID:',
      socket.id
    );

    connectedUsers.set(socket.user._id.toString(), socket.id);

    chatHandler(io, socket);

    socket.on('disconnect', (reason) => {
      console.log('❌ User disconnected:', socket.id, 'Reason:', reason);
      connectedUsers.delete(socket.user._id.toString());
    });
  });
};

module.exports = initializeSocket;
