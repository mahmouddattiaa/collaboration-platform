const jwt = require('jsonwebtoken');
const User = require('../models/User');

const socketAuth = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if(!token){
            return next(new Error('Access denied , no token provided '));
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded._id);
        if (!user){
            return next(new Error('Access denied. User not found.'));
        }
        socket.user = user;
        next();
    } catch (error) {
        next(new Error('Access denied. Invalid token.'));
    }
};

module.exports = socketAuth;