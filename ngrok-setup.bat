@echo off
echo 🚀 ngrok Setup for Ahadu Learning
echo ====================================

echo.
echo 📝 Step 1: Configure ngrok with authtoken...
ngrok config add-authtoken 37xymLmx7YT9hYLbeJxz0KvaPls_6F82dYsYXJ3wMLxBPd6BP

echo.
echo 📝 Step 2: Start ngrok with authentication...
start "Ngrok Tunnel" cmd /k "cd /d %~dp0api && ngrok http 5000 --log=stdout"

echo.
echo ⏳ Waiting 5 seconds for ngrok to start...
timeout /t 5

echo.
echo 📝 Step 3: Get ngrok URL automatically...
for /f "tokens=2 delims=:" %%i in ('curl -s http://127.0.0.1:4040/api/tunnels ^| findstr "public_url"') do set NGROK_URL=%%i
set NGROK_URL=%NGROK_URL: =%
set NGROK_URL=%NGROK_URL:,=%

echo 🔗 ngrok URL: %NGROK_URL%

echo.
echo 📝 Step 4: Update .env file automatically...
powershell -Command "(Get-Content 'api\.env') -replace 'BACKEND_URL=.*', 'BACKEND_URL=%NGROK_URL%' | Set-Content 'api\.env'"

echo ✅ .env updated with ngrok URL!

echo.
echo 📝 Step 5: Start backend server...
start "Backend Server" cmd /k "cd /d %~dp0api && npm run dev"

echo.
echo 📝 Step 6: Start frontend server...
start "Frontend Server" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo ✅ All servers started with ngrok!
echo 🌐 Access from anywhere: %NGROK_URL%
echo 📱 Use ngrok URL on mobile devices
echo 🔧 Test admin dashboard and payments
echo.
pause
