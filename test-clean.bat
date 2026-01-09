@echo off
echo 🧪 Testing Fidel-Hub Features - Clean Results
echo ===========================================

echo.
echo 📝 Testing Student Registration...
curl -s -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test Student\",\"email\":\"teststudent@example.com\",\"role\":\"student\",\"password\":\"Test123!@#\",\"confirmPassword\":\"Test123!@#\"}" | jq .

echo.
echo 📝 Testing Student Login...
curl -s -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"teststudent@example.com\",\"password\":\"Test123!@#\"}" | jq .

echo.
echo 📝 Testing Password Reset Request...
curl -s -X POST http://localhost:5000/api/otp/request-password-reset ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"teststudent@example.com\"}" | jq .

echo.
echo 📋 Testing Active Courses...
curl -s -X GET http://localhost:5000/api/courses/active | jq '.[0] | {title, price, category}'

echo.
echo 🔍 Testing Course Search...
curl -s -X GET "http://localhost:5000/api/courses/search?q=web" | jq '.[0] | {title, category}'

echo.
echo 🎯 Testing Course Details (Public Access)...
curl -s -X GET http://localhost:5000/api/courses/695b6e3a4dd7b993c29bd625 | jq '{title, price, isPublished}'

echo.
echo 📊 Testing Analytics (Should Require Auth)...
curl -s -X GET http://localhost:5000/api/graphs/student-progress-completion | jq .

echo.
echo ===========================================
echo ✅ Feature Testing Complete!
pause
