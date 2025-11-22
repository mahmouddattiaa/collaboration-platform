const jwt = require("jsonwebtoken");
const User = require("../models/User");

const socketAuth = async (socket, next) => {
  try {
    console.log("🔐 Socket authentication attempt from:", socket.id);
    const token = socket.handshake.auth.token;

    if (!token) {
      console.error("❌ No token provided");
      return next(new Error("Access denied, no token provided"));
    }

    console.log("🔍 Token received, verifying...");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token decoded for user ID:", decoded._id);

    const user = await User.findById(decoded._id);
    if (!user) {
      console.error("❌ User not found in database:", decoded._id);
      return next(new Error("Access denied. User not found."));
    }

    console.log("✅ User authenticated:", user.name, "(", user.email, ")");
    socket.user = user;
    next();
  } catch (error) {
    console.error("❌ Socket authentication error:", error.message);
    next(new Error("Access denied. Invalid token."));
  }
};

module.exports = socketAuth;
