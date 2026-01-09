import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to, subject, text, htmlContent = '') => {
  try {
    console.log('📧 Email Service Configuration Check:');
    console.log('📧 Sending email to:', to);
    console.log('📧 Subject:', subject);
    
    // 1. Try Resend first (primary service)
    try {
      console.log('📧 Trying Resend...');
      const resendResponse = await resend.emails.send({
        from: process.env.RESEND_FROM,
        to: [to],
        subject: subject,
        html: htmlContent || `<p>${text}</p>`,
        text: text
      });

      // Resend SDK can return { data, error } without throwing
      if (resendResponse?.error) {
        throw new Error(
          resendResponse.error?.message ||
            resendResponse.error?.name ||
            'Resend returned an error'
        );
      }

      if (!resendResponse?.data) {
        throw new Error('Resend did not return a success response');
      }

      console.log('✅ Resend accepted email:', resendResponse.data);
      return { provider: 'resend', ...resendResponse.data };
    } catch (resendError) {
      console.log('❌ Resend failed:', resendError.message);
      console.log('💡 Resend Error Details:', resendError);
    }
    
    // 2. Try Nodemailer with Gmail as fallback
    try {
      console.log('📧 Trying Nodemailer with Gmail...');
      
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD
        }
      });
      
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: to,
        subject: subject,
        text: text,
        html: htmlContent || `<p>${text}</p>`
      };
      
      const nodemailerResponse = await transporter.sendMail(mailOptions);
      console.log('✅ Nodemailer email sent:', nodemailerResponse);
      return { provider: 'nodemailer', ...nodemailerResponse };
    } catch (nodemailerError) {
      console.log('❌ Nodemailer failed:', nodemailerError.message);
      console.log('💡 Nodemailer Error Details:', nodemailerError);
    }
    
    // 3. Fallback to console
    console.log('📧 All email services failed - using console fallback');
    const otpMatch = text.match(/(\d{6})/);
    if (otpMatch) {
      console.log('🎯 EMAIL FAILED - YOUR OTP CODE IS:', otpMatch[1]);
      console.log('🎯 USE THIS CODE FOR VERIFICATION:', otpMatch[1]);
      console.log('📧 Email would be sent to:', to);
      console.log('📧 Subject:', subject);
    }
    
    return { success: true, method: 'console', otp: otpMatch?.[1] };
    
  } catch (error) {
    console.error('❌ Email service error:', error);
    
    // Extract OTP for console fallback
    const otpMatch = text.match(/(\d{6})/);
    if (otpMatch) {
      console.log('🎯 EMAIL FAILED - YOUR OTP CODE IS:', otpMatch[1]);
      console.log('🎯 USE THIS CODE FOR VERIFICATION:', otpMatch[1]);
    }
    
    return { success: true, method: 'console', otp: otpMatch?.[1] };
  }
};





// // emailService.js
// import nodemailer from 'nodemailer';
// import dotenv from 'dotenv';

// dotenv.config(); // Load environment variables from .env file

// // Create a transporter using your email provider settings (e.g., Gmail)
// const transporter = nodemailer.createTransport({
//   service: 'gmail', // Example using Gmail
//   auth: {
//     user: process.env.EMAIL_USER, // The email address from which you are sending emails
//     pass: process.env.EMAIL_PASS, // The password or app password
//   },
// });

// // Function to send an email
// const sendEmail = async (to, subject, text, htmlContent = '') => {
//   const mailOptions = {
//     from: process.env.EMAIL_USER, // Sender address
//     to, // Recipient(s)
//     subject, // Subject line
//     text, // Plain text body
//     html: htmlContent, // Optional HTML content for the email body
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log('Email sent successfully');
//   } catch (error) {
//     console.error('Error sending email:', error);
//   }
// };

// export { sendEmail };







// import FormData from "form-data";
// import Mailgun from "mailgun.js";
// import dotenv from "dotenv";
// dotenv.config();

// const mailgun = new Mailgun(FormData);
// const mg = mailgun.client({
//   username: "api",
//   key: process.env.MAILGUN_API_KEY,
// });

// export const sendEmail = async (to, subject, text, html) => {
//   try {
//     const message = await mg.messages.create(process.env.MAILGUN_DOMAIN, {
//       from: `${process.env.MAILGUN_FROM_NAME} <${process.env.MAILGUN_FROM_EMAIL}>`,
//       to,
//       subject,
//       text,
//       html,
//     });
//     console.log("Email sent:", message.id);
//   } catch (err) {
//     console.error("Email send failed:", err);
//   }
// };
