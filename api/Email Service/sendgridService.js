import sgMail from '@sendgrid/mail';

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmailWithSendGrid = async (to, subject, text, htmlContent) => {
  try {
    const msg = {
      to: to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: 'Ahadu Learning'
      },
      subject: subject,
      text: text,
      html: htmlContent || `<p>${text}</p>`
    };

    const response = await sgMail.send(msg);
    console.log('✅ SendGrid email sent successfully');
    return { provider: 'sendgrid', success: true, response };
  } catch (error) {
    console.log('❌ SendGrid failed:', error.message);
    throw error;
  }
};
