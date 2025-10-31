@echo off
REM ============================================
REM Vercel Frontend Deployment Script
REM ============================================

echo.
echo ========================================
echo   Vercel Frontend Deployment
echo ========================================
echo.

REM Check if Vercel CLI is installed
where vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Vercel CLI not found. Installing...
    call npm install -g vercel
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install Vercel CLI
        pause
        exit /b 1
    )
    echo [OK] Vercel CLI installed successfully
)

echo [OK] Vercel CLI found
echo.

REM Navigate to frontend directory
cd /d "%~dp0collaboration-frontend"
if %errorlevel% neq 0 (
    echo [ERROR] Could not find collaboration-frontend directory
    pause
    exit /b 1
)

echo [INFO] Current directory: %cd%
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo [!] Dependencies not installed. Installing...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed
)

echo.
echo ========================================
echo   Pre-Deployment Checklist
echo ========================================
echo.
echo Please confirm:
echo   [1] Backend is deployed and running
echo   [2] Backend URL is updated in src/config/api.ts
echo   [3] All changes are committed to git
echo   [4] CORS is configured with Vercel domain
echo.
set /p CONFIRM="Continue with deployment? (y/n): "
if /i not "%CONFIRM%"=="y" (
    echo [INFO] Deployment cancelled
    pause
    exit /b 0
)

echo.
echo ========================================
echo   Building Frontend
echo ========================================
echo.

REM Build the project
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed! Please fix errors and try again.
    pause
    exit /b 1
)

echo [OK] Build completed successfully
echo.

echo ========================================
echo   Deploying to Vercel
echo ========================================
echo.

REM Deploy to Vercel
call vercel --prod
if %errorlevel% neq 0 (
    echo [ERROR] Deployment failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo [SUCCESS] Your frontend is now live on Vercel!
echo.
echo Next steps:
echo   1. Visit your Vercel dashboard to get the URL
echo   2. Test all features on the live site
echo   3. Update CORS if needed with the new URL
echo   4. Configure custom domain (optional)
echo.
echo Vercel Dashboard: https://vercel.com/dashboard
echo.

REM Go back to root directory
cd /d "%~dp0"

pause
