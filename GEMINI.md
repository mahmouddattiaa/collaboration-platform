# Project Context: Collaboration Platform (MERN)

## 1. Project Architecture

- **Structure:** Monorepo.
  - **Frontend:** `./collaboration-frontend` (React + Vite + TypeScript + Tailwind).
  - **Backend:** `./collaboration-server` (Node.js + Express + MongoDB).
- **Authentication:** Custom JWT implementation (`authController.js`).
- **Real-time:** Socket.io (implied by `socketAuth.js`).

## 2. Critical Terminal Rules (Read carefully)

- **NEVER run servers directly:** Do not run `npm run dev`, `npm start`, or `nodemon` inside this CLI. They will freeze the interface.
- **Package Installation:**
  - If I ask to install a **frontend** package: Assume `cd collaboration-frontend && npm install [package]`.
  - If I ask to install a **backend** package: Assume `cd collaboration-server && npm install [package]`.
- **File Paths:** Always verify if a file belongs to `collaboration-frontend/` or `collaboration-server/` before creating it. Do not create files in the root unless explicitly asked.

## 3. Coding Standards

### Frontend (`collaboration-frontend`)

- **Stack:** TypeScript (`.tsx`), TailwindCSS, Shadcn UI (implied by `components/ui`).
- **State:** Uses Context API (`AuthContext`, `CollaborationContext`).
- **Routing:** React Router.
- **Style:** Prefer functional components with hooks. Use strict typing for Props.

### Backend (`collaboration-server`)

- **Stack:** JavaScript/TypeScript Mix (Note: `src/controllers` are `.js` but `src/config` is `.ts`). _Clarify if we are migrating to TS._
- **Database:** Mongoose ODM.
- **API Style:** RESTful routes separated by resource (`userRoutes`, `roomRoutes`).
- **Env Vars:** Access via `process.env`.

## 4. Common Pitfalls for this Project

- **Port Conflicts:** Frontend runs on Vite default (usually 5173), Backend runs on its own port (likely 5000 or 3000). Ensure CORS is configured in `server.js` to allow the frontend origin.
- **Auth Header:** JWT tokens must be passed in the `Authorization` header (Bearer token) for protected routes.
- **TypeScript Errors:** The frontend is strict TS. Do not suggest `any` types; define interfaces in `src/types/`.
