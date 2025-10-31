# Collaboration Platform

A full-stack real-time collaboration platform with frontend and backend integrated into a single repository.

## 🏗️ Project Structure

```
collaboration-platform/
├── collaboration-frontend/   # React + TypeScript frontend
├── collaboration-server/     # Node.js + Express backend
├── deploy.bat                # Deployment script
├── run-all.bat               # Run both frontend and backend
├── run-frontend.bat          # Run frontend only
├── run-backend.bat           # Run backend only
└── Documentation files       # Various guides and checklists
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (for backend database)

### Installation

1. **Clone the repository**
```bash
git clone <your-repository-url>
cd collaboration-platform
```

2. **Install dependencies**

For both frontend and backend:
```bash
cd collaboration-frontend
npm install
cd ../collaboration-server
npm install
cd ..
```

3. **Environment Setup**

Copy the `.env.example` files and configure your environment variables:

**Frontend** (`collaboration-frontend/.env`):
```bash
cd collaboration-frontend
copy .env.example .env
# Edit .env with your configuration
```

**Backend** (`collaboration-server/.env`):
```bash
cd collaboration-server
copy .env.example .env
# Edit .env with your MongoDB URI and other settings
```

### Running the Application

**Option 1: Run both frontend and backend together**
```bash
run-all.bat
```

**Option 2: Run separately**

Frontend only:
```bash
run-frontend.bat
```

Backend only:
```bash
run-backend.bat
```

**Option 3: Manual start**

Terminal 1 (Backend):
```bash
cd collaboration-server
npm start
```

Terminal 2 (Frontend):
```bash
cd collaboration-frontend
npm run dev
```

## 📚 Documentation

- [START_HERE.md](./START_HERE.md) - Getting started guide
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Deployment instructions
- [ENV_VARIABLES_GUIDE.md](./ENV_VARIABLES_GUIDE.md) - Environment variables reference
- [Frontend README](./collaboration-frontend/README.md) - Frontend specific documentation
- [Server Checklist](./collaboration-server/SERVER_CHECKLIST.md) - Backend setup checklist

## 🛠️ Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Socket.io Client

### Backend
- Node.js
- Express
- MongoDB
- Socket.io
- JWT Authentication

## 📦 Features

- Real-time collaboration
- User authentication
- Room management
- Project management
- Task management
- Whiteboard functionality
- File sharing
- Chat system
- AI Assistant integration

## 🔧 Development

### Frontend Development
```bash
cd collaboration-frontend
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build
```

### Backend Development
```bash
cd collaboration-server
npm start          # Start server
npm run dev        # Start with nodemon (if configured)
```

## 📋 Available Scripts

Check the following files for detailed script information:
- [RUN_SCRIPTS_README.md](./RUN_SCRIPTS_README.md)
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

Your Name - [@mahmouddattiaa](https://github.com/mahmouddattiaa)

## 🙏 Acknowledgments

- Thanks to all contributors
- Inspired by modern collaboration tools
- Built with ❤️ using modern web technologies
