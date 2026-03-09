@echo off
echo 🧪 Advanced Fidel-Hub Feature Testing
echo =====================================

echo.
echo 📝 Step 1: Login as existing instructor...
curl -s -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"birukwagnew13@gmail.com\",\"password\":\"Password123!\"}" > instructor_token.txt

echo.
echo 📝 Step 2: Extract instructor token...
for /f "tokens=2 delims=:" %%i in ('findstr /C:"token" instructor_token.txt') do set INSTRUCTOR_TOKEN=%%i
set INSTRUCTOR_TOKEN=%INSTRUCTOR_TOKEN:"=%
set INSTRUCTOR_TOKEN=%INSTRUCTOR_TOKEN: =%
echo Instructor token extracted: %INSTRUCTOR_TOKEN%

echo.
echo 📝 Step 3: Test instructor course creation...
curl -s -X POST http://localhost:5000/api/courses ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %INSTRUCTOR_TOKEN%" ^
  -d "{\"title\":\"Test Course - Advanced Testing\",\"description\":\"This is a test course created during advanced testing\",\"price\":1500,\"category\":\"Advanced Testing\",\"level\":\"intermediate\",\"duration\":\"15 hours\",\"language\":\"English\",\"thumbnail\":{\"url\":\"https://example.com/test-thumbnail.jpg\",\"publicId\":\"test_thumbnail\"},\"modules\":[{\"title\":\"Module 1: Advanced Testing\",\"description\":\"Advanced testing module\",\"duration\":\"5 hours\",\"lessons\":[{\"title\":\"Lesson 1: Testing Fundamentals\",\"type\":\"video\",\"duration\":\"60 minutes\",\"video\":{\"url\":\"https://example.com/video1.mp4\",\"thumbnailUrl\":\"https://example.com/thumb1.jpg\"},\"free\":true}]}]}"

echo.
echo 📝 Step 4: Test instructor course retrieval...
curl -s -X GET http://localhost:5000/api/courses/instructor/695b6c7da6c2fccb0d110aeb/courses ^
  -H "Authorization: Bearer %INSTRUCTOR_TOKEN%"

echo.
echo 📝 Step 5: Test student login...
curl -s -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"teststudent@example.com\",\"password\":\"Test123!@#\"}" > student_token.txt

echo.
echo 📝 Step 6: Extract student token...
for /f "tokens=2 delims=:" %%i in ('findstr /C:"token" student_token.txt') do set STUDENT_TOKEN=%%i
set STUDENT_TOKEN=%STUDENT_TOKEN:"=%
set STUDENT_TOKEN=%STUDENT_TOKEN: =%
echo Student token extracted: %STUDENT_TOKEN%

echo.
echo 📝 Step 7: Test course enrollment initiation...
curl -s -X POST http://localhost:5000/api/payment/initiate ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %STUDENT_TOKEN%" ^
  -d "{\"courseId\":\"695b6e3a4dd7b993c29bd625\",\"amount\":1000,\"email\":\"teststudent@example.com\",\"fullName\":\"Test Student\"}"

echo.
echo 📝 Step 8: Test enrollment check...
curl -s -X GET "http://localhost:5000/api/enrollments/check?studentId=teststudent&courseId=695b6e3a4dd7b993c29bd625" ^
  -H "Authorization: Bearer %STUDENT_TOKEN%"

echo.
echo 📝 Step 9: Test quiz functionality...
curl -s -X GET "http://localhost:5000/api/quiz/course/695b6e3a4dd7b993c29bd625" ^
  -H "Authorization: Bearer %STUDENT_TOKEN%"

echo.
echo 📝 Step 10: Test messaging system...
curl -s -X GET "http://localhost:5000/api/chat/conversations/?userId=teststudent" ^
  -H "Authorization: Bearer %STUDENT_TOKEN%"

echo.
echo 📝 Step 11: Test instructor analytics...
curl -s -X GET "http://localhost:5000/api/graphs/enrollments-per-course?range=Month" ^
  -H "Authorization: Bearer %INSTRUCTOR_TOKEN%"

echo.
echo 📝 Step 12: Test admin login...
curl -s -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@ahadulearning.com\",\"password\":\"Admin123!@#\"}" > admin_token.txt

echo.
echo 📝 Step 13: Extract admin token...
for /f "tokens=2 delims=:" %%i in ('findstr /C:"token" admin_token.txt') do set ADMIN_TOKEN=%%i
set ADMIN_TOKEN=%ADMIN_TOKEN:"=%
set ADMIN_TOKEN=%ADMIN_TOKEN: =%
echo Admin token extracted: %ADMIN_TOKEN%

echo.
echo 📝 Step 14: Test admin user management...
curl -s -X GET "http://localhost:5000/api/auth/users" ^
  -H "Authorization: Bearer %ADMIN_TOKEN%"

echo.
echo 📝 Step 15: Test course categories...
curl -s -X GET "http://localhost:5000/api/courses/categories" ^
  -H "Authorization: Bearer %ADMIN_TOKEN%"

echo.
echo 📝 Step 16: Cleanup - Delete test files...
del instructor_token.txt student_token.txt admin_token.txt 2>nul

echo.
echo =====================================
echo ✅ Advanced Feature Testing Complete!
pause
