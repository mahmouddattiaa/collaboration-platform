@echo off
REM Run the backend dev server in a new cmd window (Windows)
REM Opens a new terminal, navigates to the server folder, and runs `npm run dev` (nodemon).

SET ROOT_DIR=%~dp0
SET SERVER_DIR=%ROOT_DIR%collaboration-server

necho Starting backend (dev) in %SERVER_DIR%
start "Collaboration Backend" cmd /k "cd /d "%SERVER_DIR%" && echo Running: npm run dev && npm run dev"
exit /b 0
