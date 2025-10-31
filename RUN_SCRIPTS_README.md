# Run Script Batch Files (Windows)

This repository includes simple Windows batch files to quickly start the frontend and backend development servers in separate terminal windows.

Files:

- `run-frontend.bat` - Launches the frontend dev server in a new cmd window (runs `npm run dev` in `collaboration-frontend`).
- `run-backend.bat` - Launches the backend dev server in a new cmd window (runs `npm run dev` in `collaboration-server`).
- `run-all.bat` - Launches both frontend and backend in their own cmd windows.

Usage:

1. Open File Explorer and navigate to the project root (`Collaboration Room project`).
2. Double-click the desired `.bat` file (e.g., `run-all.bat`) or run it from a cmd terminal.

Notes:

- These scripts assume you have Node.js and npm installed and available in your `PATH`.
- The scripts use the `dev` scripts defined in `package.json`:
  - Frontend: `collaboration-frontend` has `dev` script that runs `vite`.
  - Backend: `collaboration-server` has `dev` script that runs `nodemon src/server.js`.
- If it's the first time running, install dependencies first:

```cmd
cd collaboration-frontend
npm install

cd ..\collaboration-server
npm install
```

- If you prefer to run everything in a single terminal, you can open two tabs manually and run the appropriate `npm run dev` commands (one per folder).

Troubleshooting:

- If a command fails, open the launched terminal to see the error output; the window remains open for debugging.
- On Windows PowerShell, you can also run the `.bat` files, or convert them to PowerShell scripts if you prefer.

---

If you'd like Mac/Linux shell scripts or cross-platform helpers (e.g., using `concurrently` or `npm-run-all`), I can add those as well.
