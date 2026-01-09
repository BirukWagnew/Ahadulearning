// Simple Phone OTP Service for Testing
export const sendPhoneOTP = async (phone, otp) => {
  try {
    console.log('📱 Phone OTP Service');
    console.log('📱 Phone Number:', phone);
    console.log('📱 OTP Code:', otp);
    console.log('📱 ================================');
    console.log('📱 SMS would be sent to:', phone);
    console.log('📱 Message: Your verification code is: ' + otp);
    console.log('📱 ================================');
    console.log('🎯 USE THIS OTP CODE:', otp);
    
    return { success: true, message: 'OTP sent via phone' };
  } catch (error) {
    console.error('❌ Error sending phone OTP:', error);
    return { success: false, error: error.message };
  }
};
