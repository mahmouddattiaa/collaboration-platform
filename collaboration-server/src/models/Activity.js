const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CollaborationRoom',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['JOINED_ROOM', 'LEFT_ROOM', 'CREATED_PROJECT', 'COMPLETED_TASK', 'CREATED_ROOM', 'UPDATED_ROOM', 'REMOVED_MEMBER']
  },
  details: {
    type: String,
    default: ''
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Activity', activitySchema);