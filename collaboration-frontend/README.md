# Collaboration Room Frontend

This is a standalone frontend for the collaboration room feature, extracted from the main Focuss application to allow for focused development.

## Features

- Real-time collaboration using Socket.io
- Chat messaging
- Whiteboard
- Task management
- File sharing
- Project tracking

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Dependencies

- Backend API server (running on port 5001)
- Collaboration server (running on port 4001)

## Project Structure

- `/src/components` - UI components
  - `/common` - Shared components
  - `/modals` - Modal dialogs
  - `/tabs` - Tab content components
  - `/ui` - Base UI components
  - `/workspace` - Workspace-related components
- `/src/contexts` - React context providers
- `/src/hooks` - Custom React hooks
- `/src/pages` - Page components
- `/src/services` - API services
- `/src/utils` - Utility functions
- `/src/config` - Configuration files

## Development Notes

This project is designed to work with the existing collaboration server and backend API. It shares the same API endpoints and socket events. 