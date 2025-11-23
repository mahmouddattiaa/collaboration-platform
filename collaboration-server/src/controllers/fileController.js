const Message = require('../models/Message');
const { uploadToGCS } = require('../utils/fileStorage');
const { BadRequestError } = require('../utils/errors');

exports.uploadFile = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const file = req.file;

    if (!file) {
      throw new BadRequestError('No file uploaded');
    }

    // Upload to GCS
    const result = await uploadToGCS(file);

    // Create message with attachment
    const message = await Message.create({
      roomId,
      sender: req.user._id,
      content: `Shared a file: ${file.originalname}`,
      attachments: [{
        url: result.url,
        type: file.mimetype.startsWith('image/') ? 'image' : 'file',
        name: file.originalname
      }],
      readBy: [{ user: req.user._id, readAt: new Date() }]
    });

    await message.populate('sender', 'name email _id');

    // Broadcast via socket
    const io = req.app.get('io');
    if (io) {
      io.to(roomId).emit('receive-message', {
        _id: message._id,
        user: message.sender, // populated sender
        message: message.content,
        timestamp: message.createdAt,
        attachments: message.attachments,
        readBy: message.readBy
      });
    }

    res.status(201).json({
      success: true,
      data: message
    });

  } catch (error) {
    next(error);
  }
};
