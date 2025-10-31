@echo off
echo ========================================
echo   🚀 Collaboration Platform Deployment
echo ========================================
echo.
echo This script will help you deploy your website for FREE!
echo.
echo Prerequisites:
echo   1. GitHub account (free)
echo   2. MongoDB Atlas account (free)
echo   3. Render account (free)
echo.
echo ========================================
echo.

:menu
echo What would you like to do?
echo.
echo 1. Initialize Git and push to GitHub
echo 2. View deployment guide
echo 3. Test local build (frontend)
echo 4. Test local build (backend)
echo 5. Exit
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto github
if "%choice%"=="2" goto guide
if "%choice%"=="3" goto test_frontend
if "%choice%"=="4" goto test_backend
if "%choice%"=="5" goto end
echo Invalid choice. Please try again.
goto menu

:github
echo.
echo ========================================
echo   📤 Pushing to GitHub
echo ========================================
echo.
set /p github_url="Enter your GitHub repository URL: "
echo.
echo Initializing Git...
git init
echo.
echo Adding all files...
git add .
echo.
echo Creating commit...
git commit -m "Initial commit - Ready for deployment"
echo.
echo Adding remote...
git remote add origin %github_url%
echo.
echo Pushing to GitHub...
git branch -M master
git push -u origin master
echo.
echo ✅ Code pushed to GitHub successfully!
echo.
echo Next steps:
echo   1. Go to https://render.com
echo   2. Create a Web Service for backend (collaboration-server)
echo   3. Create a Static Site for frontend (collaboration-frontend)
echo   4. See DEPLOYMENT_GUIDE.md for detailed instructions
echo.
pause
goto menu

:guide
echo.
echo Opening deployment guide...
start DEPLOYMENT_GUIDE.md
goto menu

:test_frontend
echo.
echo ========================================
echo   🧪 Testing Frontend Build
echo ========================================
echo.
cd collaboration-frontend
echo Installing dependencies...
call npm install
echo.
echo Building frontend...
call npm run build
echo.
if %ERRORLEVEL% EQU 0 (
    echo ✅ Frontend build successful!
    echo Build files are in: collaboration-frontend\dist\
) else (
    echo ❌ Frontend build failed. Check errors above.
)
cd ..
echo.
pause
goto menu

:test_backend
echo.
echo ========================================
echo   🧪 Testing Backend
echo ========================================
echo.
cd collaboration-server
echo Installing dependencies...
call npm install
echo.
echo Starting backend (press Ctrl+C to stop)...
call npm start
cd ..
pause
goto menu

:end
echo.
echo ========================================
echo   👋 Goodbye!
echo ========================================
echo.
echo Need help? Check DEPLOYMENT_GUIDE.md
echo.
pause
exit
