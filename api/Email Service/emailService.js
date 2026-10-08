import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const sendEmail = async (to, subject, textOrHtml, htmlContent = '') => {
  try {
    console.log('📧 Email Service: Sending email to:', to);
    console.log('📧 Subject:', subject);

    const isHtml = typeof textOrHtml === 'string' && textOrHtml.includes('<') && textOrHtml.includes('>');
    const html = htmlContent || (isHtml ? textOrHtml : `<p>${textOrHtml}</p>`);
    const plainText = isHtml
      ? textOrHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      : textOrHtml;

    // 1. Try Nodemailer with Gmail (primary working service)
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      try {
        console.log('📧 Sending email via Gmail Nodemailer...');
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD.replace(/\s+/g, '')
          }
        });

        const mailOptions = {
          from: `"Ahadu Online Learning" <${process.env.GMAIL_USER}>`,
          to: to,
          subject: subject,
          text: plainText,
          html: html
        };

        const nodemailerResponse = await transporter.sendMail(mailOptions);
        console.log('✅ Nodemailer email sent successfully:', nodemailerResponse.messageId);
        return { success: true, provider: 'nodemailer', ...nodemailerResponse };
      } catch (nodemailerError) {
        console.error('❌ Nodemailer failed:', nodemailerError.message);
      }
    } else {
      console.log('⚠️ Gmail credentials not configured');
    }

    // 2. Try Resend if configured
    if (process.env.RESEND_API_KEY) {
      try {
        console.log('📧 Trying Resend fallback...');
        const resend = new Resend(process.env.RESEND_API_KEY);
        const fromAddress = process.env.RESEND_FROM && !process.env.RESEND_FROM.includes('@gmail.com')
          ? process.env.RESEND_FROM
          : 'onboarding@resend.dev';

        const resendResponse = await resend.emails.send({
          from: fromAddress,
          to: [to],
          subject: subject,
          html: html,
          text: plainText
        });

        if (resendResponse?.error) {
          throw new Error(
            resendResponse.error?.message ||
            resendResponse.error?.name ||
            'Resend returned an error'
          );
        }

        if (resendResponse?.data) {
          console.log('✅ Resend sent email:', resendResponse.data);
          return { success: true, provider: 'resend', ...resendResponse.data };
        }
      } catch (resendError) {
        console.error('❌ Resend failed:', resendError.message);
      }
    }

    // 3. Fallback to console
    console.log('⚠️ All email services failed or unavailable - using console fallback');
    const otpMatch = (String(textOrHtml) + ' ' + String(htmlContent)).match(/(\d{6})/);
    if (otpMatch) {
      console.log('🎯 ========================================');
      console.log('🎯 OTP CODE FOR ' + to + ' IS: ' + otpMatch[1]);
      console.log('🎯 USE THIS CODE FOR VERIFICATION: ' + otpMatch[1]);
      console.log('🎯 ========================================');
    }

    return { success: false, method: 'console', otp: otpMatch?.[1] };
  } catch (error) {
    console.error('❌ Email service error:', error);
    const otpMatch = (String(textOrHtml) + ' ' + String(htmlContent)).match(/(\d{6})/);
    return { success: false, method: 'console', otp: otpMatch?.[1], error: error.message };
  }
};
