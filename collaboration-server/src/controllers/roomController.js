const Room = require('../models/CollaborationRoom');
const mongoose = require('mongoose');

// Helper function to generate unique room code
const generateRoomCode = async () => {
    let code;
    let isUnique = false;
    
    while (!isUnique) {
        code = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        const existingRoom = await Room.findOne({ roomCode: code });
        if (!existingRoom) {
            isUnique = true;
        }
    }
    
    return code;
};

exports.createRoom = async (req, res) => {
    try {
        const { name, description, dashboardName, invitedPeople } = req.body;

        if (!name || !dashboardName) {
            return res.status(400).json({
                success: false,
                message: 'Room name and dashboard name are required'
            });
        }

        const roomCode = await generateRoomCode();

        const newRoom = new Room({
            name,
            description,
            dashboardName,
            invitedPeople,
            createdBy: req.user._id,
            roomCode: roomCode
        });

        await newRoom.save();
        
        res.status(201).json({
            success: true,
            message: 'Room created successfully',
            room: newRoom
        });
    } catch (error) {
        console.error('Create room error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating room',
            error: error.message
        });
    }
};

exports.joinRoom = async(req,res) => {
    try {
        const {roomCode} = req.body;
        if(!roomCode){
            return res.status(400).json({
                success: false,
                message: 'room code is required'
            })
        }

        const room = await Room.findOne({ roomCode: roomCode });

        if(!room){
            return res.status(404).json({
                success: false,
                message: 'Room doesnt exist'
            })
        }

        room.invitedPeople.push(req.user.email);

        await room.save();

        res.status(200).json({
            success: true,
            message: 'successfully joined the room ',
            room: room 
        });
    } catch (error) {
        console.error('Join room error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        })
    }
};

exports.getRoomById = async (req, res) => {
    try {
        const { roomId } = req.params;
        
        if (!roomId) {
            return res.status(400).json({
                success: false,
                message: 'Room ID is required'
            });
        }

        const room = await Room.findById(roomId);
        
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        res.status(200).json({
            success: true,
            room: room
        });
    } catch (error) {
        console.error('Get room by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};


exports.getUserRooms = async (req, res) => {
    try {
        const userId = req.user._id;
        const userEmail = req.user.email;
        
        const rooms = await Room.find({
            $or: [
                { createdBy: userId },                    
                { invitedPeople: { $in: [userEmail] } }   
            ]
        }).sort({ createdAt: -1 }); 
        
        res.status(200).json({
            success: true,
            data: rooms
        });
    } catch (error) {
        console.error('Get user rooms error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user rooms',
            error: error.message
        });
    }
};