const express = require('express');
const router = express.Router();
const Room = require('../models/CollaborationRoom');
const auth = require('../middleware/auth');
const { createRoom, joinRoom, getRoomById, getUserRooms, getRoomMessages } = require('../controllers/roomController');

router.post('/create', auth, createRoom);
router.post('/join', auth, joinRoom);
router.get('/', auth, getUserRooms);        // NEW: Get user's rooms
router.get('/:roomId', auth, getRoomById);
router.get('/:roomId/messages', auth, getRoomMessages); // NEW: Get room messages

module.exports = router;