const Activity = require('../models/Activity');

/**
 * Logs an activity to the database and broadcasts it to the room.
 * @param {Object} io - Socket.io instance
 * @param {string} roomId - ID of the room
 * @param {string} userId - ID of the user performing the action
 * @param {string} action - Action type (e.g., 'JOINED_ROOM')
 * @param {string} details - Human readable details
 * @param {Object} [metadata] - Additional data
 */
const logActivity = async (io, roomId, userId, action, details, metadata = {}) => {
  try {
    const activity = new Activity({
      roomId,
      userId,
      action,
      details,
      metadata
    });

    await activity.save();

    // Populate user details for the frontend
    await activity.populate('userId', 'name email profilePicture');

    if (io) {
      io.to(roomId.toString()).emit('new-activity', activity);
    }

    return activity;
  } catch (error) {
    console.error('❌ Failed to log activity:', error);
    // Don't throw, we don't want to fail the main request just because logging failed
  }
};

module.exports = logActivity;