import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

export const sendSMSOTP = async (phone, otp) => {
  try {
    console.log('📱 Twilio SMS Service');
    console.log('📱 Phone Number:', phone);
    console.log('📱 OTP Code:', otp);
    console.log('📱 ================================');
    
    // Check if Twilio credentials are configured
    console.log('📱 Checking Twilio configuration...');
    console.log('📱 TWILIO_ACCOUNT_SID exists:', !!process.env.TWILIO_ACCOUNT_SID);
    console.log('📱 TWILIO_AUTH_TOKEN exists:', !!process.env.TWILIO_AUTH_TOKEN);
    console.log('📱 TWILIO_PHONE_NUMBER exists:', !!process.env.TWILIO_PHONE_NUMBER);
    
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      console.log('❌ Twilio not configured - falling back to console');
      console.log('🎯 USE THIS OTP CODE:', otp);
      return { success: true, method: 'console' };
    }
    
    console.log('📱 Twilio configured - attempting to send SMS...');
    
    // Initialize Twilio client
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    // Send real SMS via Twilio
    const message = await client.messages.create({
      body: `Your Fidel-Hub verification code is: ${otp}. This code expires in 5 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    
    console.log('✅ SMS sent successfully!');
    console.log('📱 Message SID:', message.sid);
    console.log('📱 Status:', message.status);
    console.log('📱 ================================');
    
    return { success: true, method: 'sms', messageId: message.sid };
    
  } catch (error) {
    console.error('❌ Error sending SMS:', error.message);
    console.error('❌ Full error:', error);
    console.log('🎯 FALLBACK - USE THIS OTP CODE:', otp);
    return { success: false, method: 'console', error: error.message };
  }
};
