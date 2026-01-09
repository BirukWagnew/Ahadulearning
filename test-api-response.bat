@echo off
echo 🔍 Testing Admin API Response Format
echo ====================================

echo.
echo 📝 Step 1: Login as Admin to get token...
curl -s -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"birukwagnew13@gmail.com\",\"password\":\"BirukAdmin123!@#\"}" ^
  | findstr /C:"token" > token.txt

echo.
echo 📝 Step 2: Extract token...
for /f "tokens=2 delims=:" %%i in ('findstr /C:"token" token.txt') do set TOKEN=%%i
set TOKEN=%TOKEN:"=%
set TOKEN=%TOKEN: =%
echo Token extracted: %TOKEN%

echo.
echo 📝 Step 3: Test All Users API...
curl -s -X GET http://localhost:5000/api/admin/all-users ^
  -H "Authorization: Bearer %TOKEN%" ^
  -H "Content-Type: application/json"

echo.
echo 📝 Step 4: Test Pending Instructors API...
curl -s -X GET http://localhost:5000/api/admin/pending-instructors ^
  -H "Authorization: Bearer %TOKEN%" ^
  -H "Content-Type: application/json"

echo.
echo 📝 Step 5: Cleanup...
del token.txt 2>nul

echo.
echo ====================================
echo ✅ API Response Testing Complete!
pause
