const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const Room = require('../models/CollaborationRoom');

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

async function migrateRoomCodes() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('✅ Connected to MongoDB');

        // Find all rooms without a roomCode or with old format roomCode
        const roomsToUpdate = await Room.find({
            $or: [
                { roomCode: { $exists: false } },
                { roomCode: null },
                { roomCode: '' },
                { roomCode: { $regex: /[A-Za-z]/ } } // Has letters (old format)
            ]
        });

        console.log(`📊 Found ${roomsToUpdate.length} rooms to update`);

        let updated = 0;
        for (const room of roomsToUpdate) {
            const newCode = await generateRoomCode();
            room.roomCode = newCode;
            await room.save();
            console.log(`✅ Updated room "${room.name}" with code: ${newCode}`);
            updated++;
        }

        console.log(`\n🎉 Migration complete! Updated ${updated} rooms.`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run migration
migrateRoomCodes();
