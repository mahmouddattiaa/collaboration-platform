@echo off
REM Run the frontend dev server in a new cmd window (Windows)
REM Opens a new terminal, navigates to the frontend folder, installs (if needed) and runs `npm run dev`.

SET ROOT_DIR=%~dp0
SET FRONTEND_DIR=%ROOT_DIR%collaboration-frontend

necho Starting frontend (dev) in %FRONTEND_DIR%
start "Collaboration Frontend" cmd /k "cd /d "%FRONTEND_DIR%" && echo Running: npm run dev && npm run dev"
exit /b 0
