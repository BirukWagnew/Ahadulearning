import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { uploadImage, uploadPDF } from '../middleware/uploadMiddleware.js';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../Email Service/emailService.js';
import { sendPhoneOTP } from '../services/phoneOTPService.js';
import { sendSMSOTP } from '../services/smsOTPService.js';
import { sendTextBeltOTP } from '../services/textBeltService.js';

export const registerUser = async (req, res) => {
  const { name, email, phone, role, expertise, password, confirmPassword } = req.body;

  if (role === 'admin') {
    return res.status(403).json({ message: 'Registering as an admin is forbidden' });
  }

   if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

     if (role === 'instructor') {
      if (!expertise) {
        return res.status(400).json({ message: 'Expertise is required for instructors' });
      }
      if (!req.file) {
        return res.status(400).json({ message: 'CV is required for instructors' });
      }
    }

     const user = new User({
      name,
      email,
      phone,
      role,
      expertise: role === 'instructor' ? expertise : null, 
      cv: role === 'instructor' ? req.file.path : null,  
      password, 
    });

    await user.save();

     const otp = user.generateOTP();  
    await user.save(); 
    
    // Always send OTP via email (primary method)
    console.log('📧 Sending OTP via email to:', email);
    console.log('🎯 DEVELOPMENT OTP CODE:', otp);

    // Send OTP via email with professional template
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
            Use the verification code below to complete your registration:
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
          <p> 2024 ahadulearning. All rights reserved.</p>
        </div>
      </div>
    `;
    
    const emailResult = await sendEmail(email, emailSubject, emailContent);
    
    res.status(201).json({ 
      message: 'Registration successful! Please check your email for the OTP verification code.',
      otpSent: true,
      emailSent: emailResult?.provider ? true : false,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


export const loginUser = async (req, res) => {
  const { email, phone, password, otp } = req.body;  

  try {
    // Find user by email or phone
    let user;
    if (email) {
      user = await User.findOne({ email });
    } else if (phone) {
      user = await User.findOne({ phone });
    } else {
      return res.status(400).json({ message: "Email or phone number is required" });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.comparePassword(password);
     

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.blocked) {
      return res.status(403).json({ message: "Your account has been blocked by the admin." });
    }

     if (!user.isVerified) {
      if (!otp) {
         const generatedOtp = user.generateOTP();
        await user.save();
        
        // Send OTP via SMS if phone number provided, otherwise email
        if (user.phone) {
          console.log('📱 Attempting to send SMS to:', user.phone);
          
          // Try TextBelt first (free, no setup required)
          const result = await sendTextBeltOTP(user.phone, generatedOtp);
          
          if (result.success && result.method === 'sms') {
            return res.status(400).json({ 
              message: 'OTP required to verify your account. Please check your phone for the SMS code.' 
            });
          } else {
            // Fallback to console
            return res.status(400).json({ 
              message: 'OTP required to verify your account. Please check the API console for the OTP code.' 
            });
          }
        } else {
          await sendEmail(user.email, 'Your OTP Code', `Your OTP code is: ${generatedOtp}`);
          return res.status(400).json({ 
            message: "OTP required to verify your account. Check your email for the code." 
          });
        }
      }

       const isOtpValid = user.verifyOTP(otp);
      if (!isOtpValid) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }

       user.isVerified = true;
      await user.save();
    }

    if (user.role === "instructor" && !user.isApproved) {
       
      return res.status(403).json({ message: "Your account is pending approval by an admin." });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
     

     res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",  
      sameSite: "strict", 
      maxAge: 1 * 24 * 60 * 60 * 1000,  
    });

    res.status(200).json({ message: "Login successful", user, token });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


 
export const logoutUser = (req, res) => {
  try {
     res.clearCookie("token"); 
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


 
export const getMe = async (req, res) => {
  try {
    

     const user = await User.findById(req.user.id);  
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);  
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
