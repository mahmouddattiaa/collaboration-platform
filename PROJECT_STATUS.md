# Collaboration Platform - Project Status & Documentation

**Last Updated:** November 22, 2025  
**Repository:** mahmouddattiaa/collaboration-platform  
**Current Branch:** testingBranch  
**Status:** Active Development

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Features Implemented](#features-implemented)
5. [Features In Progress](#features-in-progress)
6. [Known Issues](#known-issues)
7. [Recent Changes](#recent-changes)
8. [To-Do List](#to-do-list)
9. [Configuration](#configuration)
10. [API Documentation](#api-documentation)
11. [Database Schema](#database-schema)
12. [WebSocket Events](#websocket-events)

---

## 🚀 DEPLOYMENT & VERSION CONTROL (CRITICAL)

**⚠️ IMPORTANT FOR AI AGENTS:**
The Frontend and Backend are **ALREADY DEPLOYED** on Vercel.
- **Frontend:** `collaboration-frontend`
- **Backend:** `collaboration-backend` (or similar)

**Action Required when "Deploying":**
1. **NEVER** attempt to create new Vercel projects.
2. **ALWAYS** use `vercel --prod --yes` to update the **existing** deployments.
3. Pushing to `master`/`main` also triggers automatic deployments if Git is linked.
4. Failure to follow this leads to multiple stale instances and configuration drift.

---

## 🎯 Project Overview

A real-time collaboration platform that allows users to create rooms, join existing rooms using 6-digit codes, and communicate in real-time using WebSocket technology. The platform provides authentication, project management, and AI-powered features through Google Gemini integration.

**Key Capabilities:**

- User authentication with JWT
- Create and manage collaboration rooms
- Join rooms using 6-digit numeric codes
- Real-time messaging via Socket.io
- User isolation (each user sees only their rooms)
- Room-based WebSocket connections
- AI integration with Google Gemini

---

## 🛠 Tech Stack

### Frontend

- **Framework:** React 18.3.1
- **Build Tool:** Vite 6.0.1
- **Language:** TypeScript 5.2+
- **Styling:** Tailwind CSS 3.4.17
- **UI Components:** Shadcn UI (Radix UI primitives)
- **State Management:** React Context API
- **Real-time:** Socket.io-client 4.8.1
- **HTTP Client:** Axios 1.7.9
- **Routing:** React Router DOM 7.1.1
- **Notifications:** Sonner (toast notifications)

### Backend

- **Runtime:** Node.js
- **Framework:** Express 5.1.0
- **Language:** JavaScript (Node.js) + TypeScript (some utils)
- **Database:** MongoDB (Mongoose 7.8.7)
- **Authentication:** JWT (jsonwebtoken 9.0.2) + bcryptjs 2.4.3
- **Real-time:** Socket.io 4.8.1
- **Security:** express-rate-limit, cors, helmet
- **AI Integration:** @google/generative-ai 0.21.0

### Database

- **Type:** MongoDB Atlas
- **Connection:** mongodb+srv://mahmouddattiaa7:kepler111@collaborationroom.n5pgzj9.mongodb.net/
- **ODM:** Mongoose

### Development Tools

- **Version Control:** Git
- **Package Manager:** npm
- **Testing:** Jest 30.2.0 (configured, not actively used)
- **Linting:** ESLint
- **Deployment:** Vercel (configured)

---

## 📁 Project Structure

```
collaboration-platform/
├── collaboration-frontend/          # React frontend
│   ├── src/
│   │   ├── components/             # React components
│   │   │   ├── auth/              # Login, Register, ProtectedRoute
│   │   │   ├── common/            # Shared components (Header, Footer)
│   │   │   ├── dashboard/         # Dashboard, RoomCard, CreateRoom
│   │   │   ├── room/              # JoinRoom, ChatBox, ChatMessage
│   │   │   ├── ui/                # Shadcn UI primitives
│   │   │   └── workspace/         # Workspace-related components
│   │   ├── contexts/              # React contexts
│   │   │   ├── AuthContext.tsx    # Authentication state
│   │   │   └── CollaborationContext.tsx  # WebSocket & room state
│   │   ├── hooks/                 # Custom hooks
│   │   │   ├── useAuth.ts         # Auth hook
│   │   │   ├── useChat.ts         # Chat functionality
│   │   │   ├── useProjects.ts     # Project management
│   │   │   └── useRoom.ts         # Room operations
│   │   ├── pages/                 # Page components
│   │   │   └── CollaborationRoom.tsx  # Main room interface
│   │   ├── services/              # API services
│   │   │   ├── apiClient.ts       # Axios instance
│   │   │   ├── authService.ts     # Auth API calls
│   │   │   ├── geminiService.ts   # AI integration
│   │   │   ├── projectService.ts  # Project CRUD
│   │   │   └── roomService.ts     # Room CRUD
│   │   ├── types/                 # TypeScript types
│   │   └── config/                # Configuration files
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── vercel.json
│
├── collaboration-server/           # Express backend
│   ├── src/
│   │   ├── controllers/           # Request handlers
│   │   │   ├── authController.js  # Login, register, profile
│   │   │   ├── roomController.js  # Room CRUD, join, leave
│   │   │   ├── projectController.js
│   │   │   └── geminiController.js
│   │   ├── models/                # MongoDB models
│   │   │   ├── User.js            # User schema
│   │   │   ├── CollaborationRoom.js  # Room schema
│   │   │   ├── Project.js
│   │   │   └── Room.js
│   │   ├── routes/                # Express routes
│   │   │   ├── authRoutes.js      # /api/auth/*
│   │   │   ├── roomRoutes.js      # /api/rooms/*
│   │   │   ├── projectRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── middleware/            # Custom middleware
│   │   │   ├── auth.js            # JWT verification for HTTP
│   │   │   └── socketAuth.js      # JWT verification for Socket.io
│   │   ├── socket/                # Socket.io handlers
│   │   │   ├── index.js           # Socket initialization
│   │   │   └── handlers/
│   │   │       └── chatHandler.js # Chat & room events
│   │   ├── scripts/               # Utility scripts
│   │   │   └── migrateRoomCodes.js  # DB migration script
│   │   ├── config/
│   │   │   └── db.ts              # MongoDB connection
│   │   └── server.js              # Main server file
│   ├── package.json
│   ├── vercel.json
│   └── uploads/                   # File uploads directory
│
├── package.json                   # Root package.json
├── run-all.bat                    # Start both frontend & backend
├── run-backend.bat                # Start backend only
├── run-frontend.bat               # Start frontend only
└── [Various documentation files]
```

---

## ✅ Features Implemented

### 1. Authentication System

- ✅ User registration with email/password
- ✅ Login with JWT token generation
- ✅ Password hashing with bcryptjs
- ✅ Token storage in localStorage (key: 'authToken')
- ✅ Protected routes on frontend
- ✅ JWT middleware for HTTP requests
- ✅ JWT middleware for Socket.io connections
- ✅ User profile retrieval
- ✅ Rate limiting on auth routes (50 attempts/15min)

### 2. Room Management

- ✅ Create collaboration rooms
- ✅ 6-digit numeric room codes (100000-999999)
- ✅ Join rooms via 6-digit code
- ✅ Room member tracking (host/participant roles)
- ✅ User isolation (users only see rooms they're members of)
- ✅ Room code uniqueness validation
- ✅ Database migration for existing rooms
- ✅ Room display showing name + 6-digit code
- ✅ Leave room functionality

### 3. Real-Time Communication

- ✅ Socket.io WebSocket connection
- ✅ Authentication for Socket.io
- ✅ Room-based messaging
- ✅ Join/leave room events
- ✅ User join/leave notifications
- ✅ Message broadcasting to room members only
- ✅ Room isolation (each room has separate socket namespace)
- ✅ Auto-leave previous room when joining new one
- ✅ Disconnect handling
- ✅ Connection status tracking
- ✅ Room join confirmation events
- ✅ Message Persistence (MongoDB storage)
- ✅ Chat History loading on join
- ✅ Typing Indicators
- ✅ Online User List (Real-time)

### 4. Frontend Features
- ✅ Responsive design with Tailwind CSS
- ✅ Dashboard showing user's rooms
- ✅ Room creation modal
- ✅ Room joining modal (6-digit code input)
- ✅ Collaboration room interface
- ✅ Real-time chat interface with history
- ✅ "User is typing..." indicator
- ✅ Active user avatars in chat header
- ✅ Toast notifications (Sonner)
- ✅ Loading states
- ✅ Error handling
- ✅ Protected routing

### 5. Backend Features
- ✅ RESTful API design
- ✅ Rate limiting (500 requests/15min general, 50 auth)
- ✅ CORS configuration
- ✅ Error handling middleware
- ✅ MongoDB connection with Mongoose
- ✅ Environment variable configuration
- ✅ Structured logging
- ✅ Socket.io server integration
- ✅ Message model & storage
- ✅ Typing event broadcasting
- ✅ Active room user tracking

---

## 🚧 Features In Progress

### 1. Enhanced Real-Time Features
- ⏳ Message read receipts
- ⏳ File sharing in chat

### 2. UI/UX Improvements
- ⏳ Room member list display (Full list)
- ⏳ User avatar support (Upload)
- ⏳ Dark mode support
- ⏳ Mobile responsiveness improvements
- ⏳ Accessibility improvements

---

## ⚠️ Known Issues

### Fixed Issues:
1. ✅ **Rate limiting 429 errors** - Fixed by applying rate limiter to auth routes
2. ✅ **Authentication not working** - Fixed wrong import in CollaborationContext
3. ✅ **Token storage mismatch** - Fixed to use 'authToken' key consistently
4. ✅ **Room codes showing MongoDB IDs** - Fixed by creating migration script
5. ✅ **Users seeing all rooms** - Backend already filtered correctly by userId
6. ✅ **Infinite join/leave loop** - Fixed by removing function dependencies from useEffect
7. ✅ **Socket not connecting to room** - Fixed by adding connection checks and confirmations
8. ✅ **Message history lost on refresh** - Fixed by implementing MongoDB message persistence

### Active Issues:
- None currently blocking development

### Potential Future Issues:
- No pagination for messages (will need with large message volume)
- No file upload size limits enforced
- No cleanup for inactive rooms in database

---

## 📝 Recent Changes

### November 22, 2025 (Session 6)
1. **Implemented Real-time Project Management**
   - Added socket events for `project-created`, `project-updated`, `project-deleted`
   - Projects now sync instantly across all room members without refresh
   - integrated `ProjectManager` with `CollaborationContext` socket
   - Refined project scoping to ensure updates are strictly per-room

2. **Implemented File Sharing (Google Cloud Storage)**
   - Integrated `@google-cloud/storage` for secure file persistence
   - Added file upload endpoint (`POST /api/rooms/:roomId/files`) using `multer` (memory storage)
   - Files are streamed directly to GCS bucket
   - Chat UI supports image previews and generic file download links
   - Real-time broadcasting of file attachments

3. **Implemented Message Read Receipts**
   - Added WhatsApp-style read receipts (Gray/Blue ticks)
   - 1 Gray Tick: Sent
   - 2 Gray Ticks: Read by some users
   - 2 Blue Ticks: Read by ALL users in the room
   - Implemented `useInView` to track message visibility
   - Added tooltip showing exact list of users who read the message
   - Updated backend to track read status per user per message

3. **Implemented Room Settings**
   - Added "Settings" modal for room hosts
   - Implemented Room Rename and Room Delete functionality
   - Added backend routes (`PUT/DELETE`) with host verification
   - Implemented real-time updates via socket events:
     - `room-updated`: Updates room name/description for all members instantly
     - `room-deleted`: Redirects all members to dashboard and shows alert
   - Created Shadcn UI `Dialog`, `Label`, and `Tooltip` components

3. **Implemented Remove Member**
   - Added "Members" tab to Room Settings
   - Hosts can remove participants
   - Real-time removal updates (removed user is redirected)

### November 22, 2025 (Session 5)
1. **Implemented Room Member List UI**
   - Updated `PresenceAvatarGroup` component to handle real-time user data
   - Integrated `onlineUsers` from `CollaborationContext` with room members
   - Displays online/offline status indicators
   - Shows tooltips with user names and status
   - Fallback support for when room member data is loading

2. **Implemented Activity Timeout**
   - Backend tracks socket activity timestamp
   - Automatically disconnects users after 5 minutes of inactivity
   - Frontend displays persistent warning toast with "Refresh" action upon timeout
   - Added `inactivity-disconnect` socket event

3. **Verified Multi-User Functionality**
   - Successfully ran multi-user simulation script (`test-multi-user.js`)
   - Verified real-time messaging between 2 distinct users
   - Confirmed typing indicators work across sockets
   - Confirmed online user count updates correctly (1 -> 2 users)
   - Validated room isolation and joining flow

### November 22, 2025 (Session 4)
1. **Implemented Online User Status**
   - Added `room-users-update` socket event
   - Backend tracks and broadcasts connected users per room
   - Frontend displays active user avatars in chat header
   - Handles multiple tabs/windows for same user correctly

### November 22, 2025 (Session 3)
1. **Implemented Typing Indicators**
   - Added `typing-start` and `typing-stop` socket events
   - Updated `CollaborationContext` to track typing users
   - Added visual indicator in `Chat.tsx` (e.g., "John is typing...")
   - Added throttling to prevent event spam

### November 22, 2025 (Session 2)
1. **Implemented Message Persistence**
   - Created `Message` model in MongoDB
   - Updated `chatHandler` to save messages before broadcasting
   - Added `GET /api/rooms/:roomId/messages` endpoint
   - Updated `CollaborationContext` to fetch history on join
   - Messages now survive page refreshes

### November 22, 2025 (Session 1)

1. **Added socket connection checks**

   - Verify socket is connected before emitting events
   - Added detailed logging for join/leave operations
   - Frontend now checks `socket.connected` status

2. **Implemented room join confirmation**

   - Backend sends `room-joined-confirmation` event
   - Frontend displays toast notification on successful join
   - Added `📊 Active rooms` logging on backend

3. **Enhanced debugging**
   - Added extensive console logs throughout socket flow
   - Backend logs: join/leave events, active rooms, user actions
   - Frontend logs: emit events, confirmations, state updates

### November 21, 2025

1. **Fixed infinite join/leave loop**

   - Removed `joinRoom`/`leaveRoom` from useEffect dependencies
   - Added eslint-disable comment for intentional pattern
   - Loop was caused by functions recreating on every render

2. **Implemented room isolation**

   - Backend filters rooms by `members.userId`
   - Users only see rooms they created or joined
   - WebSocket properly isolated per room

3. **Created migration script**

   - `migrateRoomCodes.js` to update existing rooms
   - Successfully migrated 2 rooms with new codes
   - Codes: 206898, 751042

4. **Implemented 6-digit room codes**

   - Changed from alphanumeric to numeric codes
   - Range: 100000-999999
   - Added uniqueness validation
   - Updated UI to accept only numeric input

5. **Fixed authentication system**

   - Fixed CollaborationContext to use correct auth hook
   - Fixed token lookup to use 'authToken' key
   - Fixed response parsing in authService

6. **Fixed rate limiting**
   - Applied rate limiter to auth routes
   - Increased limits for development
   - Fixed JSON response format

---

## 📋 To-Do List

### High Priority

1. **Room Features** (Moved from Medium Priority)
   - [x] Display room member list
   - [x] Show online/offline status
   - [x] Add room settings (rename, delete)
   - [ ] Add ability to remove members (host only)
   - [ ] Room search functionality

2. **Chat Features**

   - [x] Typing indicators
   - [x] Message read receipts
   - [x] File sharing
   - [ ] Image preview
   - [ ] Emoji support
   - [ ] Message editing/deletion

5. **Project Management Integration**
   - [x] Link projects to rooms
   - [x] Task management
   - [x] Brain dump feature
   - [x] Project tracking

### Low Priority

6. **UI/UX Polish**

   - [ ] Remove debug console.logs
   - [ ] Add loading skeletons
   - [ ] Improve error messages
   - [ ] Add animations
   - [ ] Dark mode

7. **Production Readiness**

   - [ ] Add comprehensive error handling
   - [ ] Implement proper logging system
   - [ ] Add monitoring/analytics
   - [ ] Performance optimization
   - [ ] Security audit
   - [ ] Add unit tests
   - [ ] Add integration tests

8. **Deployment**
   - [ ] Deploy backend to Vercel
   - [ ] Deploy frontend to Vercel
   - [ ] Configure environment variables
   - [ ] Set up production database
   - [ ] Configure CORS for production
   - [ ] Add rate limiting for production

---

## ⚙️ Configuration

### Environment Variables

#### Backend (.env)

```env
PORT=4001
MONGODB_URI=mongodb+srv://mahmouddattiaa7:kepler111@collaborationroom.n5pgzj9.mongodb.net/
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key
```

#### Frontend (.env)

```env
VITE_API_URL=http://localhost:4001
VITE_SOCKET_URL=http://localhost:4001
```

### Ports

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:4001
- **MongoDB:** MongoDB Atlas (cloud)

### Rate Limits

- **General API:** 500 requests per 15 minutes
- **Auth Routes:** 50 requests per 15 minutes

### Token Storage

- **Key:** `authToken`
- **Location:** localStorage
- **Format:** JWT string (Bearer token)

---

## 🔌 API Documentation

### Base URL

```
http://localhost:4001/api
```

### Authentication Endpoints

#### POST /auth/register

Register a new user.

```json
Request:
{
  "name": "string",
  "email": "string",
  "password": "string"
}

Response:
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "_id": "string",
    "name": "string",
    "email": "string"
  }
}
```

#### POST /auth/login

Login existing user.

```json
Request:
{
  "email": "string",
  "password": "string"
}

Response:
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "_id": "string",
    "name": "string",
    "email": "string"
  }
}
```

#### GET /auth/profile

Get current user profile (requires auth).

```json
Headers:
{
  "Authorization": "Bearer jwt_token_here"
}

Response:
{
  "success": true,
  "user": {
    "_id": "string",
    "name": "string",
    "email": "string",
    "createdAt": "date"
  }
}
```

### Room Endpoints

#### GET /rooms

Get all rooms for authenticated user.

```json
Headers:
{
  "Authorization": "Bearer jwt_token_here"
}

Response:
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "name": "string",
      "roomCode": "123456",
      "createdBy": "userId",
      "members": [
        {
          "userId": "string",
          "role": "host|participant",
          "joinedAt": "date"
        }
      ],
      "createdAt": "date"
    }
  ]
}
```

#### POST /rooms

Create a new room.

```json
Headers:
{
  "Authorization": "Bearer jwt_token_here"
}

Request:
{
  "name": "string",
  "description": "string" (optional)
}

Response:
{
  "success": true,
  "data": {
    "_id": "string",
    "name": "string",
    "roomCode": "123456",
    "createdBy": "userId",
    "members": [...],
    "createdAt": "date"
  }
}
```

#### POST /rooms/join

Join a room using 6-digit code.

```json
Headers:
{
  "Authorization": "Bearer jwt_token_here"
}

Request:
{
  "roomCode": "123456"
}

Response:
{
  "success": true,
  "message": "Successfully joined room",
  "data": {
    "_id": "string",
    "name": "string",
    "roomCode": "123456",
    "members": [...]
  }
}
```

#### GET /rooms/:id

Get specific room details.

```json
Headers:
{
  "Authorization": "Bearer jwt_token_here"
}

Response:
{
  "success": true,
  "data": {
    "_id": "string",
    "name": "string",
    "roomCode": "123456",
    "members": [...],
    "createdAt": "date"
  }
}
```

#### GET /rooms/:roomId/messages

Get chat history for a room.

```json
Headers:
{
  "Authorization": "Bearer jwt_token_here"
}

Query Params:
- limit: number (default 50)
- before: date (for pagination)

Response:
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "roomId": "string",
      "sender": {
        "_id": "string",
        "name": "string",
        "email": "string"
      },
      "content": "string",
      "createdAt": "date"
    }
  ]
}
```

---

## 🗄️ Database Schema

### User Model

```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique, lowercase),
  password: String (required, hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### CollaborationRoom Model

```javascript
{
  _id: ObjectId,
  name: String (required),
  roomCode: String (required, unique, 6 chars, numeric),
  description: String,
  createdBy: ObjectId (ref: User),
  members: [
    {
      userId: ObjectId (ref: User),
      role: String (enum: ['host', 'participant']),
      joinedAt: Date,
      addedBy: ObjectId (ref: User)
    }
  ],
  settings: {
    maxMembers: Number (default: 50),
    isPrivate: Boolean (default: false)
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Message Model

```javascript
{
  _id: ObjectId,
  roomId: ObjectId (ref: CollaborationRoom),
  sender: ObjectId (ref: User),
  content: String,
  attachments: Array,
  readBy: Array,
  createdAt: Date,
  updatedAt: Date
}
```

### Project Model

```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  createdBy: ObjectId (ref: User),
  members: [ObjectId],
  tasks: Array,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔌 WebSocket Events

### Client → Server Events

#### `join-room`

Join a collaboration room.

```javascript
socket.emit("join-room", roomId);
```

#### `leave-room`

Leave a collaboration room.

```javascript
socket.emit("leave-room", roomId);
```

#### `send-message`

Send a message to a room.

```javascript
socket.emit("send-message", {
  roomId: "string",
  message: "string",
});
```

### Server → Client Events

#### `room-joined-confirmation`

Confirmation that user successfully joined room.

```javascript
socket.on("room-joined-confirmation", (data) => {
  // data: { roomId: 'string', message: 'string' }
});
```

#### `receive-message`

Receive a message from the room.

```javascript
socket.on("receive-message", (message) => {
  // message: { user: {...}, message: 'string', timestamp: Date }
});
```

#### `user-joined-notification`

Notification when another user joins the room.

```javascript
socket.on("user-joined-notification", (notification) => {
  // notification: { title: 'string', message: 'string' }
});
```

#### `user-left-notification`

Notification when a user leaves the room.

```javascript
socket.on("user-left-notification", (notification) => {
  // notification: { title: 'string', message: 'string' }
});
```

#### `error`

Error from server.

```javascript
socket.on("error", (error) => {
  // error: { message: 'string' }
});
```

### Connection Events

#### `connect`

Socket connected successfully.

```javascript
socket.on("connect", () => {
  console.log("Connected:", socket.id);
});
```

#### `disconnect`

Socket disconnected.

```javascript
socket.on("disconnect", (reason) => {
  console.log("Disconnected:", reason);
});
```

#### `connect_error`

Connection error.

```javascript
socket.on("connect_error", (error) => {
  console.error("Connection error:", error);
});
```

---

## 🚀 Running the Project

### Prerequisites

- Node.js installed
- MongoDB Atlas account
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/mahmouddattiaa/collaboration-platform.git
cd collaboration-platform

# Install backend dependencies
cd collaboration-server
npm install

# Install frontend dependencies
cd ../collaboration-frontend
npm install
```

### Development

```bash
# Option 1: Run both (from root)
./run-all.bat

# Option 2: Run separately
./run-backend.bat  # Terminal 1
./run-frontend.bat # Terminal 2
```

### Testing

1. Open http://localhost:5173
2. Register a new user
3. Create a room (note the 6-digit code)
4. Open incognito/another browser
5. Register different user
6. Join room using the 6-digit code
7. Test real-time messaging

---

## 📊 Project Metrics

- **Total Files:** ~100+
- **Lines of Code:** ~5,000+
- **Components:** ~20+
- **API Endpoints:** ~15+
- **WebSocket Events:** 8
- **Database Models:** 4
- **Active Features:** 5 major systems
- **Development Time:** ~2 weeks
- **Current Version:** Beta

---

## 🔐 Security Considerations

### Implemented

- ✅ Password hashing (bcryptjs)
- ✅ JWT authentication
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Input validation
- ✅ MongoDB injection prevention (Mongoose)

### To Implement

- ⏳ XSS protection
- ⏳ CSRF protection
- ⏳ Helmet security headers
- ⏳ Input sanitization
- ⏳ File upload validation
- ⏳ Environment variable encryption

---

## 📞 Support & Maintenance

### For AI Models Reading This:

This document should give you complete context about:

- What the project does
- How it's structured
- What's been completed
- What's in progress
- What needs to be done next
- How everything connects

When a user asks for help:

1. Check "Recent Changes" for latest context
2. Check "Known Issues" for current problems
3. Check "To-Do List" for planned work
4. Refer to schemas/APIs for technical details
5. Update this file after making changes

### Updating This Document:

Always update these sections after changes:

- **Last Updated** date at top
- **Recent Changes** section with new entry
- **Features Implemented** when completing features
- **Known Issues** when finding/fixing bugs
- **To-Do List** when planning new work

---

**End of Document**
