const Room = require("../models/CollaborationRoom");
const { BadRequestError, NotFoundError } = require("../utils/errors");

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
      // User is already a member, just return the room
      return res.status(200).json({
        success: true,
        message: "Already a member of this room",
        room: room,
      });
    }

    // Add user as a new member
    await room.addMember(req.user._id, "participant");

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
