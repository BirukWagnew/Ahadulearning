import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Lock, UserPlus } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { toast } from 'sonner';

const OTPVerification = ({
  email,
  onSuccess,
  onBack,
  isPasswordReset = false,
  isRegistration = false,
  devOtp = '',
}) => {
  const [otp, setOtp] = useState('');
  const [currentDevOtp, setCurrentDevOtp] = useState(devOtp || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const handleResendOTP = async () => {
    try {
      setIsSending(true);
      const res = await axios.post(`${API_BASE_URL}/api/otp/send-otp`, { email });
      if (res.data?.otp) {
        setCurrentDevOtp(res.data.otp);
        toast.success(`Verification code sent! (Code: ${res.data.otp})`);
      } else {
        toast.success("A new verification code has been sent to your email.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP. Please try again later.");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit verification code.");
      return;
    }

    setIsVerifying(true);
    try {
      const route = isRegistration 
        ? `${API_BASE_URL}/api/otp/verify-otp` 
        : `${API_BASE_URL}/api/otp/verify-password-reset-otp`;

      const response = await axios.post(route, {
        email,
        otp,
      });

      if (response.data.success || response.data.message?.includes('verified successfully')) {
        toast.success("OTP verified successfully");
        if (isRegistration) {
          // If it's registration, you can handle registration completion
          onSuccess();
        } else {
          setShowPasswordForm(true);
        }
      } else {
        throw new Error(response.data.message || "Verification failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred while verifying the OTP.");
      setShowPasswordForm(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResetPassword = async () => {
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/otp/reset-password`, {
        email,
        otp,
        newPassword: password,
      });

      toast.success("Password reset successfully");
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred while resetting the password.");
    }
  };

  if (showPasswordForm && isPasswordReset) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Lock className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-4 text-xl font-semibold">Create New Password</h2>
          <p className="mt-2 text-sm text-gray-600">
            Please enter and confirm your new password
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showPassword"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            <label htmlFor="showPassword" className="text-sm text-gray-700">
              Show Password
            </label>
          </div>
        </div>

        <div className="flex flex-col space-y-3">
          <Button 
            onClick={handleResetPassword} 
            className="w-full"
          >
            Reset Password
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          {isRegistration ? (
            <UserPlus className="h-6 w-6 text-blue-600" />
          ) : (
            <Lock className="h-6 w-6 text-blue-600" />
          )}
        </div>
        <h2 className="mt-4 text-xl font-semibold">
          {isRegistration ? "Complete Registration" : "Verification Required"}
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          We've sent a 6-digit verification code to<br />
          <strong>{email}</strong>
        </p>
      </div>

      {currentDevOtp && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <p className="text-xs text-blue-700 font-medium mb-1">Development Verification Code:</p>
          <button
            type="button"
            onClick={() => setOtp(currentDevOtp)}
            className="text-2xl font-mono font-bold text-blue-800 tracking-widest hover:underline cursor-pointer"
            title="Click to auto-fill"
          >
            {currentDevOtp}
          </button>
          <p className="text-[11px] text-blue-500 mt-0.5">(Click to auto-fill)</p>
        </div>
      )}

      <div className="flex justify-center">
        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      <div className="flex flex-col space-y-3">
        <Button 
          onClick={handleVerifyOTP} 
          disabled={otp.length !== 6 || isVerifying}
          className="w-full"
        >
          {isVerifying ? "Verifying..." : isRegistration ? "Verify & Complete Registration" : "Verify OTP"}
        </Button>
        
        <div className="flex justify-center text-sm">
          <button
            className="text-blue-600"
            onClick={handleResendOTP}
            disabled={isSending}
          >
            {isSending ? "Resending..." : "Resend OTP"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
