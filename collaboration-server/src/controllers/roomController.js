const Room = require("../models/CollaborationRoom");
const { BadRequestError, NotFoundError } = require("../utils/errors");
const logActivity = require('../utils/activityLogger');
const Activity = require('../models/Activity');

// Helper function to generate unique 6-digit room code
const generateRoomCode = async () => {
  let code;
  let isUnique = false;

  while (!isUnique) {
    // Generate 6-digit code (100000 to 999999)
    code = Math.floor(100000 + Math.random() * 900000).toString();

    const existingRoom = await Room.findOne({ roomCode: code });
    if (!existingRoom) {
      isUnique = true;
    }
  }

  return code;
};

exports.createRoom = async (req, res, next) => {
  try {
    const { name, description, dashboardName, invitedPeople } = req.body;

    if (!name || !dashboardName) {
      throw new BadRequestError("Room name and dashboard name are required");
    }

    const roomCode = await generateRoomCode();

    const newRoom = new Room({
      name,
      description,
      dashboardName,
      invitedPeople,
      createdBy: req.user._id,
      roomCode: roomCode,
      members: [{ userId: req.user._id, role: "host" }], // Add creator as host
    });

    await newRoom.save();

    await logActivity(
      req.app.get("io"),
      newRoom._id,
      req.user._id,
      'CREATED_ROOM',
      `Room "${name}" created`
    );

    res.status(201).json({
      success: true,
      message: "Room created successfully",
      room: newRoom,
    });
  } catch (error) {
    next(error);
  }
};

exports.joinRoom = async (req, res, next) => {
  try {
    const { roomCode } = req.body;
    if (!roomCode) {
      throw new BadRequestError("Room code is required");
    }

    const room = await Room.findOne({ roomCode: roomCode });

    if (!room) {
      throw new NotFoundError("Room not found");
    }

    // Check if user is already a member
    const isAlreadyMember = room.members.some(
      (member) => member.userId.toString() === req.user._id.toString()
    );

    if (isAlreadyMember) {
      return res.status(200).json({
        success: true,
        message: "Already a member of this room",
        room: room,
      });
    }

    // Add user as a new member
    await room.addMember(req.user._id, "participant");

    await logActivity(
      req.app.get("io"),
      room._id,
      req.user._id,
      'JOINED_ROOM',
      'User joined the room'
    );

    res.status(200).json({
      success: true,
      message: "Successfully joined the room",
      room: room,
    });
  } catch (error) {
    next(error);
  }
};

exports.getRoomById = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    if (!roomId) {
      throw new BadRequestError("Room ID is required");
    }

    const room = await Room.findById(roomId).populate(
      "members.userId",
      "name email avatar"
    );

    if (!room) {
      throw new NotFoundError("Room not found");
    }

    res.status(200).json({
      success: true,
      room: room,
    });
  } catch (error) {
    next(error);
  }
};

const Message = require("../models/Message");

exports.getRoomMessages = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { limit = 50, before } = req.query;

    const query = { roomId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('sender', 'name email _id')
      .populate('readBy.user', 'name email avatar');

    res.status(200).json({
      success: true,
      data: messages.reverse() // Return in chronological order
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserRooms = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const rooms = await Room.find({ "members.userId": userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: rooms,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { name, description } = req.body;
    const userId = req.user._id;

    const room = await Room.findById(roomId);
    if (!room) throw new NotFoundError("Room not found");

    if (room.createdBy.toString() !== userId.toString()) {
      throw new Error("Only the room creator can update settings");
    }

    if (name) room.name = name;
    if (description) room.description = description;

    await room.save();

    const io = req.app.get("io");
    if (io) {
      io.to(roomId).emit("room-updated", {
        _id: room._id,
        name: room.name,
        description: room.description
      });
    }

    await logActivity(
      io,
      roomId,
      userId,
      'UPDATED_ROOM',
      'Room settings updated'
    );

    res.status(200).json({
      success: true,
      message: "Room updated successfully",
      room
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;

    const room = await Room.findById(roomId);
    if (!room) throw new NotFoundError("Room not found");

    if (room.createdBy.toString() !== userId.toString()) {
      throw new Error("Only the room creator can delete the room");
    }

    await Room.findByIdAndDelete(roomId);

    const io = req.app.get("io");
    if (io) {
      io.to(roomId).emit("room-deleted", { roomId });
    }

    // Cannot log activity for deleted room easily as room is gone, skipping

    res.status(200).json({
      success: true,
      message: "Room deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

exports.removeMember = async (req, res, next) => {
  try {
    const { roomId, userId } = req.params;
    const requesterId = req.user._id;

    const room = await Room.findById(roomId);
    if (!room) throw new NotFoundError("Room not found");

    const isHost = room.createdBy.toString() === requesterId.toString();
    if (!isHost) {
      throw new Error("Only the room host can remove members");
    }

    if (userId === requesterId.toString()) {
      throw new Error("Host cannot be removed. Delete the room instead.");
    }

    await room.removeMember(userId);

    const io = req.app.get("io");
    if (io) {
      io.to(roomId).emit("member-removed", { userId });
    }

    await logActivity(
      io,
      roomId,
      requesterId,
      'REMOVED_MEMBER',
      'A member was removed from the room'
    );

    res.status(200).json({
      success: true,
      message: "Member removed successfully"
    });
  } catch (error) {
    next(error);
  }
};

exports.getRoomActivities = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const activities = await Activity.find({ roomId })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('userId', 'name email profilePicture');
      
    res.status(200).json({ success: true, data: activities });
  } catch (error) { next(error); }
};
