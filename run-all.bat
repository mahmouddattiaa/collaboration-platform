@echo off
REM Launch both frontend and backend in separate cmd windows.
REM Usage: double-click or run from cmd.

nSET ROOT_DIR=%~dp0

necho Launching Collaboration Frontend and Backend...

nREM Frontend
start "Collaboration Frontend" cmd /k "cd /d "%ROOT_DIR%collaboration-frontend" && echo Running: npm run dev && npm run dev"

nREM Backend
start "Collaboration Backend" cmd /k "cd /d "%ROOT_DIR%collaboration-server" && echo Running: npm run dev && npm run dev"

necho Launched both services.
exit /b 0
