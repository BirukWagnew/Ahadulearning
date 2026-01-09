@echo off
echo 🧪 Testing OTP Email System
echo ============================

echo.
echo 📝 Step 1: Test OTP Request for Existing User...
curl -X POST http://localhost:5000/api/otp/send-otp ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"birukwagnew13@gmail.com\"}"

echo.
echo 📝 Step 2: Test Password Reset OTP Request...
curl -X POST http://localhost:5000/api/otp/request-password-reset ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"birukwagnew13@gmail.com\"}"

echo.
echo 📝 Step 3: Test OTP with Invalid Email...
curl -X POST http://localhost:5000/api/otp/send-otp ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"nonexistent@example.com\"}"

echo.
echo ============================
echo ✅ OTP Email Testing Complete!
pause
