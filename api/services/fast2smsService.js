import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export const sendFast2SMSOTP = async (phone, otp) => {
  try {
    console.log('📱 Fast2SMS Service');
    console.log('📱 Phone Number:', phone);
    console.log('📱 OTP Code:', otp);
    console.log('📱 ================================');
    
    // Fast2SMS free service (India-focused but works internationally)
    const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
      authorization: 'YOUR_API_KEY', // You'd need to get this
      sender_id: 'FSTSMS',
      message: `Your Fidel-Hub verification code is: ${otp}. This code expires in 5 minutes.`,
      language: 'english',
      route: 'v3',
      numbers: phone
    });
    
    if (response.data.return) {
      console.log('✅ SMS sent successfully via Fast2SMS!');
      console.log('📱 Message ID:', response.data.message[0].id);
      console.log('📱 ================================');
      return { success: true, method: 'sms', messageId: response.data.message[0].id };
    } else {
      console.log('❌ Fast2SMS failed:', response.data.message);
      console.log('🎯 FALLBACK - USE THIS OTP CODE:', otp);
      return { success: false, method: 'console', error: response.data.message };
    }
    
  } catch (error) {
    console.error('❌ Error sending SMS via Fast2SMS:', error.message);
    console.log('🎯 FALLBACK - USE THIS OTP CODE:', otp);
    return { success: false, method: 'console', error: error.message };
  }
};
