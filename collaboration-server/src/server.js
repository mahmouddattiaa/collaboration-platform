// imports used in the server.js file
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "..", ".env") });
const express = require("express"); //for api
const http = require("http"); //
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors"); // allow front and back communication
const compression = require("compression"); // NEW: Compress responses
const helmet = require("helmet"); // NEW: Security headers
const rateLimit = require("express-rate-limit"); // NEW: Rate limiting
const roomRoutes = require("./routes/roomRoutes");
const authRoutes = require("./routes/authRoutes");
const socketAuth = require("./middleware/socketAuth");
const { Server } = require("socket.io");

require("./models/User"); // Ensure User model is loaded

const app = express();
const server = http.createServer(app);

// OPTIMIZATION 1: Configure Socket.io with memory limits
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173", "null"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
  // Limit max HTTP buffer size (prevents memory bloat)
  maxHttpBufferSize: 1e6, // 1MB
  // Ping timeout - disconnect inactive clients faster
  pingTimeout: 60000, // 60 seconds
  pingInterval: 25000, // 25 seconds
  // Enable compression for socket messages
  perMessageDeflate: {
    threshold: 1024, // Compress messages > 1KB
  },
});

// OPTIMIZATION 2: Security - Add Helmet for security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable for development
    crossOriginEmbedderPolicy: false,
  })
);

// OPTIMIZATION 3: Compression - Reduce response size by ~70%
app.use(
  compression({
    // Only compress responses > 1KB
    threshold: 1024,
    // Compression level (0-9, 6 is balanced)
    level: 6,
  })
);

// OPTIMIZATION 4: Rate Limiting - Prevent DoS attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
});

// Apply rate limiting to all API routes
app.use("/api/", limiter);

// More strict rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // Only 20 auth attempts per 15 minutes
  message: "Too many login attempts, please try again later.",
});

//middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173", "null"], // Allow frontend, vite dev, and file://
    credentials: true,
  })
);

// OPTIMIZATION 5: Limit request body size (prevents memory attacks)
app.use(express.json({ limit: "10mb" })); // Max 10MB JSON
app.use(express.urlencoded({ extended: true, limit: "10mb" })); //parses url encoded bodies

//data base and cloud storage connection
// Diagnostic log to verify env is loaded
console.log("MONGODB_URL:", process.env.MONGODB_URL);

// Fail fast if missing
if (!process.env.MONGODB_URL) {
  console.error(
    "MONGODB_URL is not set. Create collaboration-server/.env and define MONGODB_URL."
  );
  process.exit(1);
}

// OPTIMIZATION 6: MongoDB Connection Pooling
mongoose
  .connect(process.env.MONGODB_URL, {
    // Connection pool size - reuse connections
    maxPoolSize: 10, // Max 10 concurrent connections
    minPoolSize: 2, // Keep 2 connections always open
    // Timeouts
    serverSelectionTimeoutMS: 5000, // Timeout after 5s
    socketTimeoutMS: 45000, // Close sockets after 45s idle
    // Better error handling
    family: 4, // Use IPv4, skip IPv6 (faster)
  })
  .then(() => {
    console.log("✅ Connected to MongoDB with connection pooling");
    console.log(`📊 Pool size: 10 connections max, 2 min`);
  })
  .catch((err) => {
    console.error("❌ MongoDB error:", err);
    process.exit(1);
  });

// OPTIMIZATION 7: Monitor MongoDB connection events
mongoose.connection.on("connected", () => {
  console.log("📡 Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("📴 Mongoose disconnected from MongoDB");
});

// Graceful shutdown - close DB connections
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("🛑 MongoDB connection closed through app termination");
  process.exit(0);
});

// Health check endpoint for monitoring services
app.get("/health", (req, res) => {
  res.json({
    ok: true,
    time: new Date().toISOString(),
    memory: process.memoryUsage(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Collaboration Server is running",
    timestamp: new Date().toISOString(),
  });
});

//routes
app.use("/api/auth", authLimiter, authRoutes); // Add auth rate limiter
app.use("/api/rooms", roomRoutes);
app.use((err, req, res, next) => {
  console.error("unhandelled error", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});
// Socket.io authentication middleware
io.use(socketAuth);

// OPTIMIZATION 8: Track connected users for monitoring
const connectedUsers = new Map(); // userId -> socket.id

// establish socket.io connection
io.on("connection", (socket) => {
  console.log(
    "✅ Authenticated user connected:",
    socket.user.name,
    "ID:",
    socket.id
  );

  // Track user connection
  connectedUsers.set(socket.user._id.toString(), socket.id);

  // OPTIMIZATION 9: Clean disconnect handler
  socket.on("disconnect", (reason) => {
    console.log("❌ User disconnected:", socket.id, "Reason:", reason);

    // Remove from tracking
    connectedUsers.delete(socket.user._id.toString());

    // Clean up all rooms this socket was in
    const rooms = Array.from(socket.rooms);
    rooms.forEach((room) => {
      if (room !== socket.id) {
        // Skip the socket's own room
        socket.to(room).emit("user-left", {
          userId: socket.user._id,
          userName: socket.user.name,
          message: `${socket.user.name} left the room`,
        });
      }
    });
  });

  socket.on("join-room", (roomID) => {
    socket.join(roomID);
    console.log(`👥 User ${socket.user.name} joined room ${roomID}`);

    socket.to(roomID).emit("user-joined", {
      userId: socket.user._id,
      userName: socket.user.name,
      message: `${socket.user.name} joined the chat`,
    });
  });

  socket.on("leave-room", (roomId) => {
    socket.leave(roomId);
    console.log(`👋 User ${socket.user.name} left room ${roomId}`);

    // Notify other users in the room
    socket.to(roomId).emit("user-left", {
      userId: socket.user._id,
      userName: socket.user.name,
      message: `${socket.user.name} left the room`,
    });
  });

  socket.on("send-message", (data) => {
    const { roomID, message, timestamp } = data;

    // OPTIMIZATION 10: Validate data to prevent crashes
    if (!roomID || !message) {
      socket.emit("error", { message: "Invalid message data" });
      return;
    }

    // Limit message length (prevent memory attacks)
    if (message.length > 5000) {
      socket.emit("error", {
        message: "Message too long (max 5000 characters)",
      });
      return;
    }

    const messageData = {
      userId: socket.user._id,
      userName: socket.user.name,
      message: message,
      timestamp: timestamp || new Date().toISOString(),
    };

    io.to(roomID).emit("receive-message", messageData);
  });

  // OPTIMIZATION 11: Error handling for socket events
  socket.on("error", (error) => {
    console.error("❌ Socket error:", error);
  });

  // Add connection health check
  socket.on("ping", () => {
    socket.emit("pong", { timestamp: Date.now() });
  });
});

//start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log("");
  console.log("🚀 ================================");
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `💾 Memory usage: ${Math.round(
      process.memoryUsage().heapUsed / 1024 / 1024
    )}MB`
  );
  console.log(`👥 Connected users: ${connectedUsers.size}`);
  console.log("🚀 ================================");
  console.log("");
});

// OPTIMIZATION 12: Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("⚠️  SIGTERM received, shutting down gracefully...");

  // Close server
  server.close(async () => {
    console.log("🛑 HTTP server closed");

    // Close database
    await mongoose.connection.close();
    console.log("🛑 MongoDB connection closed");

    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error("❌ Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
});

// OPTIMIZATION 13: Memory monitoring (optional - for debugging)
if (process.env.NODE_ENV === "development") {
  setInterval(() => {
    const memUsage = process.memoryUsage();
    console.log(
      `📊 Memory: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB | Users: ${
        connectedUsers.size
      }`
    );
  }, 60000); // Log every minute
}
