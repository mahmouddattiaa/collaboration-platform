const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        maxlength:300,
    },
    dashboardName: {
        type: String,
        required: true,
        maxlength:50
    },
    invitedPeople: {
        type: [String],
        default:[]
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    roomCode: {
        type: String,
        unique: true,
        uppercase: true,
        length: 6
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('Room', roomSchema);