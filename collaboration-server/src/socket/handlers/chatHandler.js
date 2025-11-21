module.exports = (io, socket) => {
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.user.name} joined room ${roomId}`);
    socket.to(roomId).emit('user-joined-notification', {
      title: 'New User Joined',
      message: `${socket.user.name} has joined the room.`,
    });
  });

  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    console.log(`User ${socket.user.name} left room ${roomId}`);
    socket.to(roomId).emit('user-left-notification', {
      title: 'User Left',
      message: `${socket.user.name} has left the room.`,
    });
  });

  socket.on('send-message', (data) => {
    const { roomId, message } = data;
    io.to(roomId).emit('receive-message', {
      user: socket.user,
      message,
      timestamp: new Date(),
    });
  });
};
