@echo off
echo 🌐 Testing Ahadu Learning from Multiple Devices
echo ================================================

echo.
echo 📝 Step 1: Start ngrok tunnel...
start "Ngrok Tunnel" cmd /k "cd /d %~dp0api && ngrok http 5000"

echo.
echo ⏳ Waiting 10 seconds for ngrok to start...
timeout /t 10

echo.
echo 📝 Step 2: Get ngrok URL...
echo Please copy the ngrok URL from the tunnel window
echo.
echo 📝 Step 3: Update .env with ngrok URL...
echo Add this line to api\.env:
echo BACKEND_URL=https://YOUR_NGROK_URL

echo.
echo 📝 Step 4: Start backend server...
start "Backend Server" cmd /k "cd /d %~dp0api && npm run dev"

echo.
echo 📝 Step 5: Start frontend server...
start "Frontend Server" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo ✅ All servers started!
echo 📱 Now access from other device using: http://localhost:5173
echo 🔧 Test admin dashboard and payments
echo.
pause
