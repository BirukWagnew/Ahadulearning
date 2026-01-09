@echo off
echo 🧪 Testing Fidel-Hub Features
echo ================================

echo.
echo 📝 Testing User Registration...
echo Testing student registration...
curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test Student\",\"email\":\"teststudent@example.com\",\"role\":\"student\",\"password\":\"Test123!@#\",\"confirmPassword\":\"Test123!@#\"}"

echo.
echo Testing instructor registration (without CV - should fail)...
curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test Instructor\",\"email\":\"testinstructor@example.com\",\"role\":\"instructor\",\"expertise\":\"Web Development\",\"password\":\"Test123!@#\",\"confirmPassword\":\"Test123!@#\"}"

echo.
echo 📝 Testing User Login...
echo Testing student login...
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"teststudent@example.com\",\"password\":\"Test123!@#\"}"

echo.
echo 📝 Testing Password Reset...
curl -X POST http://localhost:5000/api/otp/request-password-reset ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"teststudent@example.com\"}"

echo.
echo 📋 Testing Course Retrieval...
curl -X GET http://localhost:5000/api/courses/active

echo.
echo 🔍 Testing Course Search...
curl -X GET "http://localhost:5000/api/courses/search?q=web"

echo.
echo 📊 Testing Analytics (should require auth)...
curl -X GET http://localhost:5000/api/graphs/student-progress-completion

echo.
echo 🎯 Testing Course Details (public access)...
curl -X GET http://localhost:5000/api/courses/695b6e3a4dd7b993c29bd625

echo.
echo ================================
echo ✅ Feature Testing Complete!
pause
