@echo off
echo 🔍 Quick API Test
echo =================

echo.
echo 📝 Step 1: Test Login API...
curl -s -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"birukwagnew13@gmail.com\",\"password\":\"BirukAdmin123!@#\"}"

echo.
echo 📝 Step 2: Test Admin API with manual token...
curl -s -X GET http://localhost:5000/api/admin/all-users ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NTU3NzIzZjQyMzA0NzQ3MDJhNzJkMyIsImVtYWlsIjoiYmlydWt3YWduZXcxM0BnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MzYxMTIwMDksImV4cCI6MTczNjE5ODQwOX0.8Q6hJh8hQhL-JhQhL8hQhL8hQhL8hQhL8hQhL8hQhL8" ^
  -H "Content-Type: application/json"

echo.
echo =================
pause
