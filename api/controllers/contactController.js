import { sendEmail } from '../Email Service/emailService.js';

export const sendContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Prepare email content
    const emailSubject = `Contact Form: ${subject}`;
    const emailText = `
New Contact Form Submission from Ahadu Learning Website

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
This message was sent from the Ahadu Learning contact form.
    `;

    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #333; margin-bottom: 20px;">New Contact Form Submission</h2>
        <div style="background: white; padding: 15px; border-radius: 5px; margin-bottom: 10px;">
          <p style="margin: 5px 0;"><strong>Name:</strong> ${name}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 5px 0;"><strong>Subject:</strong> ${subject}</p>
        </div>
        <div style="background: white; padding: 15px; border-radius: 5px;">
          <p style="margin: 0 0 10px 0;"><strong>Message:</strong></p>
          <p style="margin: 0; white-space: pre-wrap;">${message}</p>
        </div>
      </div>
      <div style="text-align: center; color: #666; font-size: 12px;">
        <p>This message was sent from the Ahadu Learning contact form.</p>
      </div>
    </div>
    `;

    // Send email to Ahadu Learning
    await sendEmail(
      'Ahadu.learning@gmail.com',
      emailSubject,
      emailText,
      htmlContent
    );

    // Send confirmation email to the user
    const confirmationSubject = 'Thank you for contacting Ahadu Learning';
    const confirmationText = `
Dear ${name},

Thank you for reaching out to Ahadu Learning. We have received your message and will get back to you as soon as possible.

Your message:
Subject: ${subject}
${message}

If you have any urgent questions, please don't hesitate to contact us directly at Ahadu.learning@gmail.com or call us at +251 942 177690.

Best regards,
Ahadu Learning Team
    `;

    const confirmationHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
        <h2 style="color: #333; margin-bottom: 20px;">Thank you for contacting Ahadu Learning!</h2>
        <p style="color: #666; margin-bottom: 20px;">Dear ${name},</p>
        <p style="color: #666; margin-bottom: 20px;">Thank you for reaching out to Ahadu Learning. We have received your message and will get back to you as soon as possible.</p>
        
        <div style="background: white; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <p style="margin: 0 0 10px 0;"><strong>Your message:</strong></p>
          <p style="margin: 0 0 10px 0;"><strong>Subject:</strong> ${subject}</p>
          <p style="margin: 0; white-space: pre-wrap;">${message}</p>
        </div>
        
        <p style="color: #666; margin-bottom: 20px;">If you have any urgent questions, please don't hesitate to contact us directly:</p>
        <ul style="color: #666; margin-bottom: 20px;">
          <li>Email: Ahadu.learning@gmail.com</li>
          <li>Phone: +251 942 177690</li>
          <li>Location: KIOT Wollo University Building 33</li>
        </ul>
        
        <p style="color: #666;">Best regards,<br>Ahadu Learning Team</p>
      </div>
    </div>
    `;

    // Send confirmation to user (optional - comment out if not needed)
    try {
      await sendEmail(email, confirmationSubject, confirmationText, confirmationHtml);
    } catch (confirmationError) {
      console.log('Failed to send confirmation email to user:', confirmationError.message);
      // Don't fail the request if confirmation email fails
    }

    res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully! We will get back to you soon.'
    });

  } catch (error) {
    console.error('Error sending contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.'
    });
  }
};
