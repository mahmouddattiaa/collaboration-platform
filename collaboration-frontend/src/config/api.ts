// API Base URLs - Fixed to match your server
export const API_BASE_URL = 'http://localhost:4001';
export const COLLAB_BASE_URL = 'http://localhost:4001';
export const SOCKET_URL = 'http://localhost:4001';

// Main API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  ME: '/api/auth/me',

  // User
  UPDATE_NAME: '/api/update/name',
  UPDATE_BIO: '/api/update/bio',
  UPDATE_PFP: '/api/update/pfp',
  UPDATE_PRIVACY: '/api/update/privacy',

  // Stats
  GET_STATS: '/api/stats/get',
  ADD_TASK: '/api/stats/addTask',
  GET_TASKS: '/api/stats/getTasks',
  UPDATE_TASK: '/api/stats/updateTask',
  REMOVE_TASK: '/api/stats/removeTask',

  // Library
  LIBRARY: '/api/library',
  LIBRARY_FOLDER: '/api/library/folder',
  LIBRARY_PATH: '/api/library/path',
  UPLOAD_FILE: '/up/upload',
  GET_FILE: '/up/file',
  DELETE_FILE: '/api/library/file',
  DELETE_FOLDER: '/api/library/folder',

  // AI
  GEMINI_GENERATE: '/api/gemini/generate',
  GEMINI_CHAT: '/api/gemini/chat',

  // Subjects
  CREATE_SUBJECT: '/api/subjects/create',
  GET_SUBJECTS: '/api/subjects',
  UPDATE_SUBJECT: '/api/subjects',
  DELETE_SUBJECT: '/api/subjects',
};

// Collaboration API Endpoints
export const COLLAB_ENDPOINTS = {
  // Rooms
  CREATE_ROOM: '/collab/room',
  GET_ROOMS: '/collab/rooms',
  GET_ROOM: '/collab/room',
  UPDATE_ROOM: '/collab/room',
  DELETE_ROOM: '/collab/room',
  JOIN_ROOM: '/collab/room/join',
  LEAVE_ROOM: '/collab/room/leave',

  // Room Features
  SEND_MESSAGE: '/collab/room/message',
  UPDATE_WHITEBOARD: '/collab/room/whiteboard',
  ADD_TASK: '/collab/room/task',
  UPDATE_TASK: '/collab/room/task',
  DELETE_TASK: '/collab/room/task',
  UPLOAD_FILE: '/collab/room/file',
  DELETE_FILE: '/collab/room/file',

  // Room Settings
  UPDATE_SETTINGS: '/collab/room/settings',
  UPDATE_PERMISSIONS: '/collab/room/permissions',
  TOGGLE_RECORDING: '/collab/room/recording',
};

// Socket Events
export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',

  // Room
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',

  // Messages
  NEW_MESSAGE: 'new_message',
  MESSAGE_RECEIVED: 'message_received',
  TYPING_START: 'typing_start',
  TYPING_END: 'typing_end',

  // Whiteboard
  WHITEBOARD_UPDATE: 'whiteboard_update',
  WHITEBOARD_SYNC: 'whiteboard_sync',

  // Tasks
  TASK_CREATED: 'task_created',
  TASK_UPDATED: 'task_updated',
  TASK_DELETED: 'task_deleted',

  // Files
  FILE_UPLOADED: 'file_uploaded',
  FILE_DELETED: 'file_deleted',

  // Presence
  CURSOR_MOVE: 'cursor_move',
  PRESENCE_UPDATE: 'presence_update',
}; 