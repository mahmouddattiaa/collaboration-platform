const express = require('express');
const router = express.Router();
const Room = require('../models/CollaborationRoom');
const auth = require('../middleware/auth');
const { createRoom, joinRoom, getRoomById, getUserRooms, getRoomMessages, updateRoom, deleteRoom, removeMember } = require('../controllers/roomController');

router.post('/create', auth, createRoom);
router.post('/join', auth, joinRoom);
router.get('/', auth, getUserRooms);        // NEW: Get user's rooms
router.get('/:roomId', auth, getRoomById);
router.get('/:roomId/messages', auth, getRoomMessages); // NEW: Get room messages
router.put('/:roomId', auth, updateRoom);
router.delete('/:roomId', auth, deleteRoom);
router.delete('/:roomId/members/:userId', auth, removeMember);

module.exports = router;