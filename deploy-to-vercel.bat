@echo off
REM ====================================================
REM Vercel Deployment Assistant
REM ====================================================

echo.
echo ================================================
echo   Vercel Deployment Assistant
echo ================================================
echo.
echo This script will help you deploy to Vercel.
echo.
echo ================================================
echo   Information Needed
echo ================================================
echo.
echo Before we start, please have ready:
echo.
echo 1. MongoDB Connection String
echo    Example: mongodb+srv://username:password@cluster.mongodb.net/collaboration
echo    Get it from: https://cloud.mongodb.com
echo.
echo 2. JWT Secret (random string, 32+ characters)
echo    You can generate one at: https://randomkeygen.com
echo.
echo 3. GitHub account connected to Vercel (optional but recommended)
echo.
echo ================================================

set /p READY="Do you have MongoDB and JWT Secret ready? (y/n): "
if /i not "%READY%"=="y" (
    echo.
    echo Please set up MongoDB first:
    echo 1. Go to https://cloud.mongodb.com
    echo 2. Create FREE cluster
    echo 3. Database Access - Add user
    echo 4. Network Access - Add 0.0.0.0/0
    echo 5. Get connection string from Connect button
    echo.
    echo Generate JWT Secret:
    echo Visit https://randomkeygen.com and copy "CodeIgniter Encryption Keys"
    echo.
    pause
    exit /b 0
)

echo.
echo ================================================
echo   Step 1: Deploy Backend
echo ================================================
echo.

cd collaboration-server
if %errorlevel% neq 0 (
    echo [ERROR] Could not find collaboration-server directory
    pause
    exit /b 1
)

echo [INFO] Deploying backend to Vercel...
echo.
echo When prompted:
echo   - Project name: collaboration-backend
echo   - Link to existing project: No
echo   - Override settings: No
echo.

call vercel
if %errorlevel% neq 0 (
    echo [ERROR] Vercel deployment failed
    pause
    exit /b 1
)

echo.
echo ================================================
echo   Step 2: Add Environment Variables
echo ================================================
echo.
echo Now we'll add environment variables to your backend.
echo.

echo [INFO] Adding MONGODB_URL...
echo Paste your MongoDB connection string when prompted.
call vercel env add MONGODB_URL production
if %errorlevel% neq 0 (
    echo [WARNING] Failed to add MONGODB_URL
)

echo.
echo [INFO] Adding JWT_SECRET...
echo Paste your JWT secret (32+ characters) when prompted.
call vercel env add JWT_SECRET production
if %errorlevel% neq 0 (
    echo [WARNING] Failed to add JWT_SECRET
)

echo.
echo [INFO] Adding NODE_ENV...
echo.
echo production | vercel env add NODE_ENV production

echo.
echo [INFO] Adding VERCEL flag...
echo.
echo 1 | vercel env add VERCEL production

echo.
echo ================================================
echo   Step 3: Deploy Backend to Production
echo ================================================
echo.

call vercel --prod
if %errorlevel% neq 0 (
    echo [ERROR] Production deployment failed
    pause
    exit /b 1
)

echo.
echo ================================================
echo   IMPORTANT: Save Your Backend URL!
echo ================================================
echo.
echo Your backend is now live!
echo Copy the production URL shown above.
echo It should look like: https://collaboration-backend-xxx.vercel.app
echo.
set /p BACKEND_URL="Paste your backend URL here: "

echo.
echo [INFO] Testing backend health...
curl %BACKEND_URL%/health
echo.

cd ..

echo.
echo ================================================
echo   Step 4: Update Frontend Configuration
echo ================================================
echo.
echo [INFO] Updating frontend API configuration...
echo.

REM Create a temporary file with the updated config
powershell -Command "(Get-Content collaboration-frontend\src\config\api.ts) -replace 'http://localhost:3001', '%BACKEND_URL%' | Set-Content collaboration-frontend\src\config\api.ts"

echo [OK] Frontend configuration updated with backend URL
echo.

echo [INFO] Committing changes...
git add .
git commit -m "Update API URLs for Vercel production"
if %errorlevel% neq 0 (
    echo [WARNING] No changes to commit or git error
)

echo.
echo ================================================
echo   Step 5: Deploy Frontend
echo ================================================
echo.

cd collaboration-frontend
if %errorlevel% neq 0 (
    echo [ERROR] Could not find collaboration-frontend directory
    pause
    exit /b 1
)

echo [INFO] Deploying frontend to Vercel...
echo.
echo When prompted:
echo   - Project name: collaboration-frontend
echo   - Link to existing project: No
echo   - Override settings: No
echo.

call vercel --prod
if %errorlevel% neq 0 (
    echo [ERROR] Frontend deployment failed
    pause
    exit /b 1
)

echo.
echo ================================================
echo   IMPORTANT: Save Your Frontend URL!
echo ================================================
echo.
set /p FRONTEND_URL="Paste your frontend URL here: "

cd ..

echo.
echo ================================================
echo   Step 6: Update CORS Configuration
echo ================================================
echo.
echo [INFO] Updating CORS to allow frontend access...
echo.

REM Add frontend URL to CORS (this is a simplified version)
echo [INFO] Please manually update collaboration-server/src/server.js
echo Add this line to the CORS origin array:
echo   "%FRONTEND_URL%",
echo.

set /p CORS_UPDATED="Press Enter when you've updated CORS..."

echo.
echo [INFO] Redeploying backend with updated CORS...
cd collaboration-server
call vercel --prod
cd ..

echo.
echo ================================================
echo   DEPLOYMENT COMPLETE!
echo ================================================
echo.
echo Your application is now live:
echo.
echo   Frontend: %FRONTEND_URL%
echo   Backend:  %BACKEND_URL%
echo.
echo ================================================
echo   Test Your Deployment
echo ================================================
echo.
echo Visit: %FRONTEND_URL%
echo.
echo Working features:
echo   - User registration/login
echo   - Room management
echo   - API endpoints
echo.
echo Not working (expected):
echo   - Real-time chat (WebSockets disabled)
echo   - Live presence
echo.
echo ================================================
echo   Vercel Dashboard
echo ================================================
echo.
echo Manage your deployments at:
echo https://vercel.com/dashboard
echo.
echo View logs, analytics, and configure domains!
echo.
echo ================================================

pause
