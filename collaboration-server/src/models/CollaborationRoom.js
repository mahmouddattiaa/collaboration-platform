const mongoose = require('mongoose');

// Define the schema for room members
const memberSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        enum: ['host', 'moderator', 'participant'],
        default: 'participant'
    },
    joinedAt: {
        type: Date,
        default: Date.now
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

// Main room schema
const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Room name is required'],
        trim: true,
        maxlength: [100, 'Room name cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    dashboardName: {
        type: String,
        required: true,
        maxlength:50
    },
    roomCode: {
        type: String,
        unique: true,
        uppercase: true,
        length: 6
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
    isPrivate: {
        type: Boolean,
        default: false
    },
    accessCode: {
        type: String,
        sparse: true // Only create index for non-null values
    },
    members: [memberSchema], // Array of member objects
    settings: {
        allowChat: {
            type: Boolean,
            default: true
        },
        allowScreenShare: {
            type: Boolean,
            default: true
        },
        allowFileSharing: {
            type: Boolean,
            default: true
        },
        maxMembers: {
            type: Number,
            default: 50,
            min: 2,
            max: 100
        },
        recordingEnabled: {
            type: Boolean,
            default: false
        }
    },
    features: {
        taskManagement: {
            type: Boolean,
            default: true
        },
        fileSharing: {
            type: Boolean,
            default: true
        },
        videoConference: {
            type: Boolean,
            default: false
        }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

// Add methods to the schema
roomSchema.methods.addMember = function(userId, role = 'participant', addedBy = null) {
    const existingMember = this.members.find(member =>
        member.userId.toString() === userId.toString()
    );

    if (existingMember) {
        throw new Error('User is already a member of this room');
    }

    this.members.push({
        userId,
        role,
        addedBy
    });

    return this.save();
};

roomSchema.methods.removeMember = function(userId) {
    this.members = this.members.filter(member =>
        member.userId.toString() !== userId.toString()
    );

    return this.save();
};

roomSchema.methods.updateMemberRole = function(userId, newRole) {
    const member = this.members.find(member =>
        member.userId.toString() === userId.toString()
    );

    if (!member) {
        throw new Error('User is not a member of this room');
    }

    member.role = newRole;
    return this.save();
};

// Create and export the model
module.exports = mongoose.model('CollaborationRoom', roomSchema);
