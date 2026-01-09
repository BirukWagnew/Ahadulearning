import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export const sendTextBeltOTP = async (phone, otp) => {
  try {
    console.log('📱 TextBelt SMS Service');
    console.log('📱 Phone Number:', phone);
    console.log('📱 OTP Code:', otp);
    console.log('📱 ================================');
    
    // TextBelt free service (no API key required for testing)
    const response = await axios.post('https://textbelt.com/text', {
      phone: phone,
      message: `Your Fidel-Hub verification code is: ${otp}. This code expires in 5 minutes.`,
      key: 'textbelt' // Free key for testing
    });
    
    if (response.data.success) {
      console.log('✅ SMS sent successfully via TextBelt!');
      console.log('📱 Message ID:', response.data.textId);
      console.log('📱 Quota remaining:', response.data.quotaRemaining);
      console.log('📱 ================================');
      return { success: true, method: 'sms', messageId: response.data.textId };
    } else {
      console.log('❌ TextBelt failed:', response.data.error);
      console.log('🎯 FALLBACK - USE THIS OTP CODE:', otp);
      return { success: false, method: 'console', error: response.data.error };
    }
    
  } catch (error) {
    console.error('❌ Error sending SMS via TextBelt:', error.message);
    console.log('🎯 FALLBACK - USE THIS OTP CODE:', otp);
    return { success: false, method: 'console', error: error.message };
  }
};
