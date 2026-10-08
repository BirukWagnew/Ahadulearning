import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';

const VerifyOTP = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isVerifying, setIsVerifying] = useState(false);
    const [resendDisabled, setResendDisabled] = useState(true);
    const [countdown, setCountdown] = useState(60);
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();

    const { email, registrationData, timestamp, isPasswordReset, devOtp } = location.state || {};
    const [currentDevOtp, setCurrentDevOtp] = useState(devOtp || '');

    useEffect(() => {
        if (!email) {
            navigate('/signup', { replace: true });
            return;
        }

        // For password reset, we don't need registrationData
        if (!isPasswordReset && !registrationData) {
            navigate('/signup', { replace: true });
            return;
        }

        const timer = setInterval(() => {
            setCountdown((prev) => (prev <= 1 ? (clearInterval(timer), setResendDisabled(false), 0) : prev - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, [email, registrationData, isPasswordReset, navigate]);

    const handleOtpChange = (index, value) => {
        if (/^\d*$/.test(value) && value.length <= 1) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);
            
            if (value && index < 5) {
                document.getElementById(`otp-${index + 1}`).focus();
            }
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const fullOtp = otp.join('');

        console.log('🔍 Verify button clicked');
        console.log('🔍 OTP entered:', fullOtp);
        console.log('🔍 OTP length:', fullOtp.length);

        if (fullOtp.length !== 6) {
            toast({
                title: "Incomplete Code",
                description: "Please enter all 6 digits",
                variant: "destructive",
            });
            return;
        }

        setIsVerifying(true);
        console.log('🔍 Starting verification...');

        try {
            if (isPasswordReset) {
                // Handle password reset OTP verification
                console.log('🔍 Verifying password reset OTP...');
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/otp/verify-password-reset-otp`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: email,
                        otp: fullOtp
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Verification failed');
                }
                
                toast({
                    title: "OTP Verified!",
                    description: "Please enter your new password",
                });

                // Navigate to reset password page
                navigate('/reset-password', {
                    state: {
                        email: email,
                        otp: fullOtp
                    },
                    replace: true
                });
            } else {
                // Handle registration OTP verification
                console.log('🔍 Verifying registration OTP...');
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/otp/verify-otp`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: email,
                        otp: fullOtp
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Verification failed');
                }
                
                toast({
                    title: "Account Verified!",
                    description: "Your account has been successfully created",
                });

                // Navigate to login page with success state
                navigate('/login', {
                    state: {
                        registrationSuccess: true,
                        verifiedEmail: email,
                        from: 'registration'
                    },
                    replace: true
                });
            }

        } catch (error) {
            toast({
                title: "Verification Failed",
                description: error.message || "Invalid verification code",
                variant: "destructive",
            });
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResendOTP = async () => {
        setResendDisabled(true);
        setCountdown(60);
        
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/otp/send-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to resend code');
            }
            
            if (data.otp) {
                setCurrentDevOtp(data.otp);
                toast({
                    title: "Code Sent",
                    description: `Verification code sent! (Code: ${data.otp})`,
                });
            } else {
                toast({
                    title: "New Code Sent",
                    description: `A new verification code has been sent to ${email}`,
                });
            }
        } catch (error) {
            toast({
                title: "Resend Failed",
                description: error.message || "Please try again later",
                variant: "destructive",
            });
            setResendDisabled(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Fidel-Hub</h1>
                </div>
                
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-semibold">Enter Verification Code</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Sent to <span className="font-medium">{email}</span>
                        </p>
                    </div>

                    {currentDevOtp && (
                        <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                            <p className="text-xs text-blue-700 font-medium mb-1">Development Verification Code:</p>
                            <button
                                type="button"
                                onClick={() => {
                                    const digits = currentDevOtp.split('').slice(0, 6);
                                    setOtp(digits);
                                }}
                                className="text-2xl font-mono font-bold text-blue-800 tracking-widest hover:underline cursor-pointer"
                                title="Click to auto-fill"
                            >
                                {currentDevOtp}
                            </button>
                            <p className="text-[11px] text-blue-500 mt-0.5">(Click to auto-fill)</p>
                        </div>
                    )}
                    
                    <form className="space-y-4" onSubmit={handleVerify}>
                        <div className="flex justify-center space-x-2">
                            {otp.map((digit, index) => (
                                <Input
                                    key={index}
                                    id={`otp-${index}`}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    className="w-12 h-12 text-center text-xl"
                                    autoFocus={index === 0}
                                />
                            ))}
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isVerifying || otp.join('').length !== 6}
                        >
                            {isVerifying ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Verifying...
                                </>
                            ) : 'Verify Account'}
                        </Button>

                        <div className="text-center text-sm">
                            <Button
                                variant="link"
                                onClick={handleResendOTP}
                                disabled={resendDisabled}
                                className="text-gray-600"
                            >
                                Resend Code {resendDisabled && `(${countdown}s)`}
                            </Button>
                        </div>

                        <Button
                            variant="ghost"
                            onClick={() => navigate('/signup/send-otp-Registration', { state: { registrationData } })}
                            type="button"
                            className="w-full"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Email Verification
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default VerifyOTP;