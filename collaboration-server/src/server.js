const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "..", ".env") });
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const roomRoutes = require("./routes/roomRoutes");
const authRoutes = require("./routes/authRoutes");
const geminiRoutes = require("./routes/geminiRoutes");
const projectRoutes = require("./routes/projectRoutes");
const socketAuth = require("./middleware/socketAuth");
const errorHandler = require("./middleware/errorHandler");
const initializeSocket = require("./socket");

require("./models/User");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://collaboration-frontend-seven.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// Make io accessible in controllers
app.set("io", io);

app.use(
  helmet({
    contentSecurityPolicy: false, // Disable for development
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  compression({
    // Only compress responses > 1KB
    threshold: 1024,
    // Compression level (0-9, 6 is balanced)
    level: 6,
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per windowMs (increased for development)
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
});

// Apply rate limiting to all API routes
app.use("/api/", limiter);

//middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://collaboration-frontend-seven.vercel.app", // Stable production URL - never changes!
      ];

      // Allow all Vercel preview deployments (for testing)
      if (origin.includes("vercel.app") || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
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
app.use("/api/auth", authRoutes);
app.use("/api/gemini", geminiRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/projects", projectRoutes);

// Centralized error handler
app.use(errorHandler);

// Socket.io authentication middleware
io.use(socketAuth);

// establish socket.io connection
initializeSocket(io);

//start server
const PORT = process.env.PORT || 5000;

// VERCEL DEPLOYMENT: Export app for serverless, only start server locally
if (process.env.VERCEL !== "1") {
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
    console.log("🚀 ================================");
    console.log("");
  });
}

// Export for Vercel serverless functions
module.exports = app;
