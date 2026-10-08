import User from '../../models/User.js';
import { sendEmail } from '../../Email Service/emailService.js';

export const sendOtp = async (req, res) => {
  const { email } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });
    
    // Generate OTP and store it in the database
    const otp = user.generateOTP();
    await user.save();

    // Send OTP via email with better formatting
    const emailSubject = 'Ahadu Online Learning - Your OTP Verification Code';
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Ahadu Online Learning</h1>
          <p style="margin: 10px 0; opacity: 0.9;">Your Learning Platform</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin: 20px 0;">
          <h2 style="color: #333; margin-bottom: 20px;">Email Verification</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Use the verification code below to complete your registration or password reset:
          </p>
          
          <div style="background: white; border: 2px dashed #667eea; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px;">${otp}</span>
          </div>
          
          <p style="color: #999; font-size: 14px; margin-top: 20px;">
            This code will expire in 10 minutes. Please don't share this code with anyone.
          </p>
        </div>
        
        <div style="text-align: center; color: #999; font-size: 12px;">
          <p>If you didn't request this code, please ignore this email.</p>
          <p> 2026 Ahadu Online Learning. All rights reserved.</p>
        </div>
      </div>
    `;
    
    const emailResult = await sendEmail(email, emailSubject, emailContent);
    
    res.status(200).json({ 
      message: 'OTP sent successfully',
      otp: otp,
      emailSent: emailResult?.provider ? true : false
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating OTP', error: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  
  console.log('🔍 OTP Verification Request:');
  console.log('🔍 Email:', email);
  console.log('🔍 OTP:', otp);
  
  try {
    const user = await User.findOne({ email });
    console.log('🔍 User found:', !!user);
    
    if (!user) return res.status(400).json({ message: 'User not found' });
    
    console.log('🔍 User OTP:', user.otp);
    console.log('🔍 User OTP Expiration:', user.otpExpiration);
    console.log('🔍 Current Time:', new Date());
    console.log('🔍 OTP Valid:', user.otpExpiration > Date.now());
    
    const isValid = user.verifyOTP(otp);
    console.log('🔍 OTP Verification Result:', isValid);
    
    if (!isValid) return res.status(400).json({ message: 'Invalid or expired OTP' });
    
    user.isVerified = true;
    await user.save();
    
    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('🔍 OTP Verification Error:', error);
    res.status(500).json({ message: 'Error verifying OTP', error: error.message });
  }
};





// Password reset request (send OTP to email)
export const requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    
    console.log('🔍 Password Reset Request:');
    console.log('🔍 Email:', email);
  
    try {
      const user = await User.findOne({ email });
      console.log('🔍 User found:', !!user);
      
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      // Generate OTP for password reset
      const otp = user.generatePasswordResetOTP();
      console.log('🔍 Generated OTP:', otp);
      
      await user.save(); // Save OTP and expiration time in the user model
      console.log('🔍 User saved with OTP');
  
      // Send OTP to user's email
      console.log('🔍 Sending email...');
      const emailSubject = 'Ahadu Online Learning - Password Reset Code';
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Ahadu Online Learning</h1>
            <p style="margin: 10px 0; opacity: 0.9;">Your Learning Platform</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin: 20px 0;">
            <h2 style="color: #333; margin-bottom: 20px;">Password Reset</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.5;">
              We received a request to reset your password. Use the verification code below:
            </p>
            
            <div style="background: white; border: 2px dashed #667eea; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px;">${otp}</span>
            </div>
            
            <p style="color: #999; font-size: 14px; margin-top: 20px;">
              This code will expire in 10 minutes. Please don't share this code with anyone.
            </p>
          </div>
          
          <div style="text-align: center; color: #999; font-size: 12px;">
            <p>If you didn't request this code, please ignore this email.</p>
            <p> 2026 Ahadu Online Learning. All rights reserved.</p>
          </div>
        </div>
      `;
      
      const emailResult = await sendEmail(email, emailSubject, emailContent);
      console.log('🔍 Email send result:', emailResult);
  
      res.status(200).json({ 
        message: 'OTP sent to your email for password reset',
        otp: otp,
        emailSent: emailResult?.provider ? true : false
      });
    } catch (error) {
      console.error('🔍 Password reset error:', error);
      res.status(500).json({ message: 'Error requesting password reset', error: error.message });
    }
  };

  // Verify OTP for password reset
  export const verifyPasswordResetOtp = async (req, res) => {
    const { email, otp } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      // Log OTP and expiry details for debugging
      console.log('Stored OTP:', user.otp); // Log stored OTP
      console.log('OTP Expiry:', user.otpExpiry); // Log OTP expiration time
      console.log('Received OTP:', otp); // Log received OTP
  
      // Verify OTP
      const isOtpValid = user.verifyPasswordResetOTP(otp);
      console.log('Is OTP valid:', isOtpValid); // Log whether OTP is valid
  
      if (!isOtpValid) {
        return res.status(400).json({ message: 'Invalid or expired OTPw' });
      }
  
      res.status(200).json({ message: 'verified successfully' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Error verifying OTP', error: error.message });
    }
  };
  
  

  // Reset password after OTP verification
export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      // Verify OTP
      const isOtpValid = user.verifyPasswordResetOTP(otp);
      if (!isOtpValid) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }
  
      // Update password
      user.password = newPassword; // This will trigger the pre-save hook and hash the password
      user.passwordResetOtp = undefined; // Clear the OTP after successful password reset
      user.passwordResetOtpExpiration = undefined; // Clear expiration time
      await user.save();
  
      res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
      res.status(500).json({ message: 'Error resetting password', error: error.message });
    }
  };
  