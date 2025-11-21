module.exports = (io, socket) => {
  // Track which rooms the user is in
  socket.currentRooms = new Set();

  socket.on('join-room', (roomId) => {
    // Leave previous rooms when joining a new one
    socket.currentRooms.forEach(oldRoomId => {
      socket.leave(oldRoomId);
      socket.to(oldRoomId).emit('user-left-notification', {
        title: 'User Left',
        message: `${socket.user.name} has left the room.`,
      });
    });
    socket.currentRooms.clear();

    // Join the new room
    socket.join(roomId);
    socket.currentRooms.add(roomId);
    console.log(`✅ User ${socket.user.name} joined room ${roomId}`);
    
    socket.to(roomId).emit('user-joined-notification', {
      title: 'New User Joined',
      message: `${socket.user.name} has joined the room.`,
    });
  });

  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    socket.currentRooms.delete(roomId);
    console.log(`👋 User ${socket.user.name} left room ${roomId}`);
    
    socket.to(roomId).emit('user-left-notification', {
      title: 'User Left',
      message: `${socket.user.name} has left the room.`,
    });
  });

  socket.on('send-message', (data) => {
    const { roomId, message } = data;
    console.log(`💬 Message from ${socket.user.name} in room ${roomId}`);
    
    io.to(roomId).emit('receive-message', {
      user: socket.user,
      message,
      timestamp: new Date(),
    });
  });

  // When user disconnects, notify all their rooms
  socket.on('disconnect', () => {
    socket.currentRooms.forEach(roomId => {
      socket.to(roomId).emit('user-left-notification', {
        title: 'User Disconnected',
        message: `${socket.user.name} has disconnected.`,
      });
    });
  });
};
