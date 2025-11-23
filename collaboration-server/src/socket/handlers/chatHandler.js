const Message = require("../../models/Message");

module.exports = (io, socket) => {
  // Track which rooms the user is in
  socket.currentRooms = new Set();

  // Helper to broadcast active users in a room
  const broadcastRoomUsers = async (roomId) => {
    try {
      const sockets = await io.in(roomId).fetchSockets();
      // Use a Map to ensure unique users (in case user has multiple tabs open)
      const uniqueUsers = new Map();
      
      sockets.forEach(s => {
        if (s.user) {
          uniqueUsers.set(s.user._id.toString(), {
            _id: s.user._id,
            name: s.user.name,
            email: s.user.email,
            profilePicture: s.user.profilePicture || s.user.avatar // Handle both for now
          });
        }
      });

      io.to(roomId).emit("room-users-update", Array.from(uniqueUsers.values()));
    } catch (error) {
      console.error(`Error broadcasting room users for room ${roomId}:`, error);
    }
  };

  socket.on("join-room", async (roomId) => {
    console.log(
      `🔔 Received join-room event from ${socket.user.name} for room ${roomId}`
    );

    // Leave previous rooms when joining a new one
    const previousRooms = Array.from(socket.currentRooms);
    for (const oldRoomId of previousRooms) {
      socket.leave(oldRoomId);
      console.log(
        `👋 User ${socket.user.name} left previous room ${oldRoomId}`
      );
      socket.to(oldRoomId).emit("user-left-notification", {
        title: "User Left",
        message: `${socket.user.name} has left the room.`,
      });
      // Update users list for the old room
      await broadcastRoomUsers(oldRoomId);
    }
    socket.currentRooms.clear();

    // Join the new room
    socket.join(roomId);
    socket.currentRooms.add(roomId);
    console.log(
      `✅ User ${socket.user.name} successfully joined room ${roomId}`
    );
    console.log(
      `📊 Active rooms for ${socket.user.name}:`,
      Array.from(socket.currentRooms)
    );

    // Notify other users in the room
    socket.to(roomId).emit("user-joined-notification", {
      title: "New User Joined",
      message: `${socket.user.name} has joined the room.`,
    });

    // Send confirmation back to the user who joined
    socket.emit("room-joined-confirmation", {
      roomId,
      message: `Successfully joined room ${roomId}`,
    });

    // Broadcast updated user list to the room
    await broadcastRoomUsers(roomId);
  });

  socket.on("leave-room", async (roomId) => {
    socket.leave(roomId);
    socket.currentRooms.delete(roomId);
    console.log(`👋 User ${socket.user.name} left room ${roomId}`);

    socket.to(roomId).emit("user-left-notification", {
      title: "User Left",
      message: `${socket.user.name} has left the room.`,
    });
    
    // Update users list for the room
    await broadcastRoomUsers(roomId);
  });

  socket.on("send-message", async (data) => {
    try {
      const { roomId, message } = data;
      console.log(`💬 Message from ${socket.user.name} in room ${roomId}`);

      const newMessage = await Message.create({
        roomId,
        sender: socket.user._id,
        content: message,
        readBy: [{ user: socket.user._id, readAt: new Date() }] // Sender has read it
      });

      // Populate sender details and readBy users for the frontend
      await newMessage.populate([
        { path: 'sender', select: 'name email _id' },
        { path: 'readBy.user', select: 'name email avatar' }
      ]);

      io.to(roomId).emit("receive-message", {
        _id: newMessage._id,
        user: socket.user,
        message: newMessage.content,
        timestamp: newMessage.createdAt,
        readBy: newMessage.readBy
      });
    } catch (error) {
      console.error("Error saving message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  socket.on("mark-messages-read", async (data) => {
    try {
      const { roomId, messageIds } = data;
      if (!roomId || !messageIds || !Array.isArray(messageIds) || messageIds.length === 0) return;

      const userId = socket.user._id;
      const readAt = new Date();

      // Update messages in DB
      // Only update messages in this room where user is NOT already in readBy
      await Message.updateMany(
        {
          _id: { $in: messageIds },
          roomId: roomId,
          'readBy.user': { $ne: userId }
        },
        {
          $addToSet: {
            readBy: { user: userId, readAt: readAt }
          }
        }
      );

      // Broadcast to room (including sender, to update their UI)
      io.to(roomId).emit("messages-read-update", {
        roomId,
        userId,
        messageIds,
        readAt
      });
      
    } catch (error) {
      console.error("Error marking messages read:", error);
    }
  });

  socket.on("typing-start", (roomId) => {
    socket.to(roomId).emit("user-typing", {
      userId: socket.user._id,
      userName: socket.user.name,
    });
  });

  socket.on("typing-stop", (roomId) => {
    socket.to(roomId).emit("user-stopped-typing", {
      userId: socket.user._id,
    });
  });

  // When user disconnects, notify all their rooms
  socket.on("disconnect", async () => {
    const rooms = Array.from(socket.currentRooms);
    for (const roomId of rooms) {
      socket.to(roomId).emit("user-left-notification", {
        title: "User Disconnected",
        message: `${socket.user.name} has disconnected.`,
      });
      // Wait a brief moment for socket to be fully removed from io internal lists? 
      // Actually 'disconnect' fires after disconnection logic, but let's just call broadcast.
      // io.fetchSockets() should not return this socket anymore.
      await broadcastRoomUsers(roomId);
    }
  });
};
