@echo off
echo 🔍 Testing Admin User Management API
echo ===================================

echo.
echo 📝 Step 1: Test All Users API...
curl -s -X GET http://localhost:5000/api/admin/all-users ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NTU3NzIzZjQyMzA0NzQ3MDJhNzJkMyIsImVtYWlsIjoiYmlydWt3YWduZXcxM0BnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MzYxMTIwMDksImV4cCI6MTczNjE5ODQwOX0.8Q6hJh8hQhL-JhQhL8hQhL8hQhL8hQhL8hQhL8hQhL8hQhL8" ^
  -H "Content-Type: application/json"

echo.
echo 📝 Step 2: Test Pending Instructors API...
curl -s -X GET http://localhost:5000/api/admin/pending-instructors ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NTU3NzIzZjQyMzA0NzQ3MDJhNzJkMyIsImVtYWlsIjoiYmlydWt3YWduZXcxM0BnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MzYxMTIwMDksImV4cCI6MTczNjE5ODQwOX0.8Q6hJh8hQhL-JhQhL8hQhL8hQhL8hQhL8hQhL8hQhL8hQhL8" ^
  -H "Content-Type: application/json"

echo.
echo 📝 Step 3: Test Active Instructors API...
curl -s -X GET http://localhost:5000/api/admin/active-instructors ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NTU3NzIzZjQyMzA0NzQ3MDJhNzJkMyIsImVtYWlsIjoiYmlydWt3YWduZXcxM0BnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MzYxMTIwMDksImV4cCI6MTczNjE5ODQwOX0.8Q6hJh8hQhL-JhQhL8hQhL8hQhL8hQhL8hQhL8hQhL8hQhL8" ^
  -H "Content-Type: application/json"

echo.
echo ===================================
echo ✅ API Testing Complete!
pause
