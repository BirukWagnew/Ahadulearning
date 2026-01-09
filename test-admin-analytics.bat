@echo off
echo 🔍 Testing Admin Analytics API
echo ==============================

echo.
echo 📝 Step 1: Login as Admin...
curl -s -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"birukwagnew13@gmail.com\",\"password\":\"BirukAdmin123!@#\"}" > login_response.txt

echo.
echo 📝 Step 2: Extract token...
for /f "tokens=2 delims=:" %%i in ('findstr /C:"token" login_response.txt') do set TOKEN=%%i
set TOKEN=%TOKEN:"=%
set TOKEN=%TOKEN: =%
set TOKEN=%TOKEN:,=%
echo Token: %TOKEN%

echo.
echo 📝 Step 3: Test Analytics Overview API...
curl -s -X GET http://localhost:5000/api/admin/graphs/overview ^
  -H "Authorization: Bearer %TOKEN%" ^
  -H "Content-Type: application/json"

echo.
echo 📝 Step 4: Test All Users API...
curl -s -X GET http://localhost:5000/api/admin/all-users ^
  -H "Authorization: Bearer %TOKEN%" ^
  -H "Content-Type: application/json"

echo.
echo 📝 Step 5: Cleanup...
del login_response.txt 2>nul

echo.
echo ==============================
pause
