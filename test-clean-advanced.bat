@echo off
echo 🧪 Clean Advanced Testing
echo ==========================

echo.
echo 📝 Test 1: Instructor Login
curl -s -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"birukwagnew13@gmail.com\",\"password\":\"Password123!\"}"

echo.
echo 📝 Test 2: Get Instructor Courses
curl -s -X GET http://localhost:5000/api/courses/instructor/695b6c7da6c2fccb0d110aeb/courses

echo.
echo 📝 Test 3: Student Login
curl -s -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"teststudent@example.com\",\"password\":\"Test123!@#\"}"

echo.
echo 📝 Test 4: Course Enrollment Check
curl -s -X GET "http://localhost:5000/api/enrollments/check?studentId=teststudent&courseId=695b6e3a4dd7b993c29bd625"

echo.
echo 📝 Test 5: Payment Initiation
curl -s -X POST http://localhost:5000/api/payment/initiate ^
  -H "Content-Type: application/json" ^
  -d "{\"courseId\":\"695b6e3a4dd7b993c29bd625\",\"amount\":1000,\"email\":\"teststudent@example.com\",\"fullName\":\"Test Student\"}"

echo.
echo 📝 Test 6: Chat Conversations
curl -s -X GET "http://localhost:5000/api/chat/conversations/?userId=teststudent"

echo.
echo 📝 Test 7: Course Progress
curl -s -X GET "http://localhost:5000/api/progress/teststudent/695b6e3a4dd7b993c29bd625/completedLessons"

echo.
echo 📝 Test 8: Course Reviews
curl -s -X GET http://localhost:5000/api/review/695b6e3a4dd7b993c29bd625

echo.
echo 📝 Test 9: Student Recommendations
curl -s -X GET "http://localhost:5000/api/recommendations/courses/695b6e3a4dd7b993c29bd628/related"

echo.
echo ==========================
echo ✅ Clean Testing Complete!
pause
