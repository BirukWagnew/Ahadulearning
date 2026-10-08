import axios from 'axios';
import Payment from '../../models/Payment.js';
import Enrollment from '../../models/Enrollment.js';
import Transaction from '../../models/Transaction.js';
import Course from '../../models/Course.js';
import User from '../../models/User.js';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to draw consolidated table in PDF
const drawConsolidatedTable = (doc, sections, startX, startY) => {
  let currentY = startY;
  const leftColumn = 50;
  const rightColumn = 250;
  
  sections.forEach((section) => {
    // Section title
    doc.fontSize(12)
       .fillColor('#2C3E50')
       .text(section.title, leftColumn, currentY, { bold: true });
    currentY += 20;
    
    // Section rows
    section.rows.forEach((row) => {
      doc.fontSize(10)
         .fillColor('#34495e')
         .text(row.label, leftColumn, currentY, { continued: true });
      
      if (row.highlight) {
        doc.fillColor('#27ae60')
           .text(row.value, rightColumn, currentY, { bold: true });
      } else {
        doc.fillColor('#2c3e50')
           .text(row.value, rightColumn, currentY);
      }
      currentY += 18;
    });
    
    currentY += 15; // Add spacing between sections
  });
  
  return currentY;
};

export const initiatePayment = async (req, res) => {
  const { email, fullName, courseId } = req.body;
  const studentId = req.user?._id; // Grab from authenticated user
  const tx_ref = `AHADU-${Date.now()}`;

  if (!studentId) {
    return res.status(401).json({ error: 'Unauthorized. Student ID missing.' });
  }

  if (req.user?.role !== 'student') {
    return res.status(403).json({ error: 'Only students can initiate course payments.' });
  }

  // Validate required fields
  if (!email || !fullName || !courseId) {
    return res.status(400).json({
      message: 'Missing required fields.',
      error: 'Missing required fields.',
    });
  }

  // Validate environment variables
  if (!process.env.CHAPA_SECRET_KEY || !process.env.FRONTEND_URL) {
    console.error('Missing required environment variables');
    return res.status(500).json({
      message: 'Server configuration error',
      error: 'Server configuration error',
      missing: {
        CHAPA_SECRET_KEY: !process.env.CHAPA_SECRET_KEY,
        FRONTEND_URL: !process.env.FRONTEND_URL,
      },
    });
  }

  // Log email for debugging
  console.log('Initiating payment with email:', email);
  console.log('Email length:', email.length);
  console.log('Email content:', email);
  console.log('Chapa callback_url:', `${process.env.FRONTEND_URL}/payment-success?course=${courseId}&tx_ref=${tx_ref}`);

  try {
    const courseForOwnershipCheck = await Course.findById(courseId).select('instructor price');
    if (!courseForOwnershipCheck) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    if (courseForOwnershipCheck.instructor?.toString() === studentId.toString()) {
      return res.status(400).json({ error: 'Instructors cannot purchase their own course.' });
    }

    const amount = courseForOwnershipCheck.price;

    // Step 1: Create a payment record in the database with 'pending' status
    await Payment.create({ studentId, courseId, amount, tx_ref, status: 'pending' });

    // Step 2: Call Chapa API to initialize the transaction
    const response = await axios.post(
      'https://api.chapa.co/v1/transaction/initialize',
      {
        amount,
        currency: 'ETB',
        email,
        first_name: fullName,
        tx_ref,
        // callback_url: `${process.env.FRONTEND_URL}/api/payments/webhook`,
        return_url: `${process.env.FRONTEND_URL}/payment-success?course=${courseId}&tx_ref=${tx_ref}`,
        customization: {
          title: 'Ahadu Learning',
          description: 'Payment for Course Enrollment',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        },
        timeout: 10000, // 10 seconds
      }
    );

    // Step 3: Check if the Chapa API response is successful
    const chapaRes = response.data;
    if (chapaRes.status === 'success') {
      return res.json({ checkoutUrl: chapaRes.data.checkout_url });
    } else {
      console.error('CHAPA Error (status not success):', chapaRes);
      return res.status(400).json({
        error: 'Failed to initialize payment',
        details: chapaRes,
      });
    }
  } catch (error) {
    // Handle any unexpected errors in the request process
    console.error('CHAPA Error Response:', error.response?.data || error.message);
    if (error.response) {
      console.log('Full Chapa Response Data:', error.response.data);
    }
    res.status(500).json({
      message: 'Payment initiation failed',
      error: 'Payment initiation failed',
      details: error.response?.data || error.message,
    });
  }
};

export const chapaWebhook = async (req, res) => {
  // 1. Signature Verification
  const signature = req.headers['chapa-signature'] || req.headers['x-chapa-signature'];
  const secret = process.env.CHAPA_WEBHOOK_SECRET || process.env.CHAPA_SECRET_KEY;
  
  if (!secret) {
    console.error('Webhook secret is missing from environment variables');
    return res.status(500).send('Server configuration error');
  }

  if (!signature) {
    return res.status(401).send('Missing signature');
  }

  if (!req.rawBody) {
    console.error('Raw body missing, unable to verify webhook');
    return res.status(500).send('Internal server error');
  }

  const hash = crypto.createHmac('sha256', secret).update(req.rawBody).digest('hex');
  
  // Constant-time comparison
  try {
    if (!crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature))) {
      console.error('Invalid signature');
      return res.status(401).send('Invalid signature');
    }
  } catch (err) {
    console.error('Signature comparison error or length mismatch:', err);
    return res.status(401).send('Invalid signature');
  }

  const { event, data } = req.body;

  if (event === 'charge.completed' && data && data.status === 'success') {
    const { tx_ref } = data;

    try {
      // 2. Extract tx_ref and find pending Payment
      const payment = await Payment.findOne({ tx_ref });
      if (!payment) {
        console.error('Payment not found for tx_ref:', tx_ref);
        return res.status(404).send('Payment not found');
      }

      // Idempotency: if already success, just return 200
      if (payment.status === 'success') {
        return res.status(200).send('Payment already processed');
      }

      // 3. Verify the transaction with Chapa
      const chapaResponse = await axios.get(
        `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
        {
          headers: { Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}` },
          timeout: 10000,
        }
      );

      const chapaData = chapaResponse.data;
      if (chapaData.status !== 'success' || chapaData.data.status !== 'success') {
        console.error('Chapa payment verification failed:', chapaData);
        return res.status(400).send('Payment verification failed');
      }

      // Confirm returned tx_ref matches
      if (chapaData.data.tx_ref !== payment.tx_ref) {
        console.error('Transaction reference mismatch');
        return res.status(400).send('Transaction reference mismatch');
      }

      // Confirm amount exactly matches
      if (Number(chapaData.data.amount) !== Number(payment.amount)) {
        console.error('Amount mismatch');
        return res.status(400).send('Amount mismatch');
      }

      // Confirm currency is ETB
      if (chapaData.data.currency !== 'ETB') {
        console.error('Currency mismatch');
        return res.status(400).send('Currency mismatch');
      }

      // 4. Make processing idempotent using atomic update from pending to success
      const updatedPayment = await Payment.findOneAndUpdate(
        { tx_ref, status: 'pending' },
        { status: 'success', chapaData: chapaData },
        { new: true }
      );

      if (!updatedPayment) {
        // Another webhook request might have updated it concurrently
        return res.status(200).send('Payment already processed concurrently');
      }

      // 5. Existing enrollment, transaction, and balance logic
      const course = await Course.findById(updatedPayment.courseId);
      if (!course) {
        console.error('Course not found for courseId:', updatedPayment.courseId);
        return res.status(404).send('Course not found');
      }

      const instructorId = course.instructor;
      if (!instructorId) {
        console.error('Instructor not found for course:', updatedPayment.courseId);
        return res.status(404).send('Instructor not found for the course');
      }

      const instructorShare = updatedPayment.amount * 0.8;
      const platformShare = updatedPayment.amount * 0.2;
      
      const existingTx = await Transaction.findOne({ paymentId: updatedPayment._id });
      if (!existingTx) {
        await Transaction.create({
          studentId: updatedPayment.studentId,
          courseId: updatedPayment.courseId,
          instructorId,
          paymentId: updatedPayment._id,
          amountPaid: updatedPayment.amount,
          instructorShare,
          platformShare,
          status: 'completed',
        });

        await User.findByIdAndUpdate(
          instructorId,
          { $inc: { availableBalance: instructorShare } }
        );
        console.log('Instructor balance updated for instructorId:', instructorId);
      }

      const alreadyEnrolled = await Enrollment.findOne({
        studentId: updatedPayment.studentId,
        courseId: updatedPayment.courseId,
      });

      if (!alreadyEnrolled) {
        await Enrollment.create({
          studentId: updatedPayment.studentId,
          courseId: updatedPayment.courseId,
          paymentId: updatedPayment._id,
        });
        console.log('Enrollment created for studentId:', updatedPayment.studentId);
      }

      return res.status(200).send('Payment, transaction, and enrollment successful');
    } catch (error) {
      console.error('Webhook Processing Error:', error.message, error.stack);
      return res.status(500).send('Server error');
    }
  }

  console.error('Invalid webhook event or status:', { event, status: data?.status });
  res.status(400).send('Invalid webhook');
};

export const verifyPayment = async (req, res) => {
  const { tx_ref } = req.params;

  if (req.user?.role && req.user.role !== 'student') {
    return res.status(403).json({ error: 'Only students can verify course payments.' });
  }

  // Log incoming data for debugging
  console.log('Verify Payment - Incoming tx_ref:', tx_ref);

  // Validate required data
  if (!tx_ref) {
    console.error('Verify Payment - Missing tx_ref');
    return res.status(400).json({ error: 'Transaction reference (tx_ref) is required' });
  }

  try {
    // Call Chapa to verify transaction
    const chapaResponse = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        },
        timeout: 10000,
      }
    );

    const chapaData = chapaResponse.data;
    console.log('Verify Payment - Chapa Verification Response:', chapaData);

    // Check Chapa verification response
    if (chapaData.status !== 'success' || chapaData.data.status !== 'success') {
      console.error('Verify Payment - Chapa payment verification failed:', chapaData);
      return res.status(400).json({
        error: 'Payment not successful',
        details: chapaData,
      });
    }

    // Find existing payment
    const existingPayment = await Payment.findOne({ tx_ref: tx_ref.trim() });
    if (!existingPayment) {
      console.error('Verify Payment - No payment found in DB for tx_ref:', tx_ref);
      const recentPayments = await Payment.find().sort({ createdAt: -1 }).limit(5);
      console.log('Verify Payment - Recent Payment Records:', recentPayments);
      return res.status(404).json({ error: 'Payment record not found in database' });
    }

    const course_id = existingPayment.courseId;

    // Update payment status
    const updatedPayment = await Payment.findOneAndUpdate(
      { tx_ref: tx_ref.trim() },
      {
        status: 'success',
        verifiedAt: new Date(),
        chapaData: chapaData,
      },
      { new: true }
    );

    // Fetch course to get instructorId
    const course = await Course.findById(course_id);
    if (!course) {
      console.error('Verify Payment - Course not found for courseId:', course_id);
      return res.status(404).json({ error: 'Course not found' });
    }

    if (course.instructor?.toString() === existingPayment.studentId?.toString()) {
      return res.status(400).json({ error: 'Instructors cannot purchase their own course.' });
    }

    const instructorId = course.instructor;
    if (!instructorId) {
      console.error('Verify Payment - Instructor not found for course:', course_id);
      return res.status(404).json({ error: 'Instructor not found for the course' });
    }

    // Create transaction if it doesn't exist
    const instructorShare = existingPayment.amount * 0.8;
    const platformShare = existingPayment.amount * 0.2;
    const existingTx = await Transaction.findOne({ paymentId: updatedPayment._id });

    if (!existingTx) {
      await Transaction.create({
        studentId: existingPayment.studentId,
        courseId: course_id,
        instructorId,
        paymentId: updatedPayment._id,
        amountPaid: existingPayment.amount,
        instructorShare,
        platformShare,
        status: 'completed',
      });
      console.log('Verify Payment - Transaction created for tx_ref:', tx_ref);

      // Update instructor balance
      await User.findByIdAndUpdate(
        instructorId,
        { $inc: { availableBalance: instructorShare } }
      );
      console.log('Verify Payment - Instructor balance updated for instructorId:', instructorId);
    } else {
      console.log('Verify Payment - Transaction already exists for paymentId:', updatedPayment._id);
    }

    // Create enrollment if not already present
    const alreadyEnrolled = await Enrollment.findOne({
      studentId: existingPayment.studentId,
      courseId: course_id,
    });

    if (!alreadyEnrolled) {
      await Enrollment.create({
        studentId: existingPayment.studentId,
        courseId: course_id,
        paymentId: updatedPayment._id,
      });
      console.log('Verify Payment - Enrollment created for studentId:', existingPayment.studentId);
    } else {
      console.log('Verify Payment - Student already enrolled for courseId:', course_id);
    }

    console.log('Verify Payment - Payment verified, transaction processed, and enrollment created.');

    return res.status(200).json({
      message: 'Payment verified, transaction processed, and user enrolled successfully',
      payment: updatedPayment,
      courseId: course_id,
    });
  } catch (error) {
    console.error('Verify Payment - Error:', error.message, error.stack);
    if (error.response) {
      console.error('Verify Payment - Chapa API Error:', error.response.data);
    } else if (error.request) {
      console.error('Verify Payment - No response from Chapa API:', error.request);
    }
    return res.status(500).json({
      error: 'Payment verification failed',
      details: error.response?.data || error.message,
    });
  }
};

export const generateReceipt = async (req, res) => {
  try {
    const { tx_ref } = req.params;
    
    if (!tx_ref) {
      return res.status(400).json({ 
        success: false,
        error: 'Transaction reference is required',
      });
    }

    const payment = await Payment.findOne({ tx_ref })
      .populate('studentId', 'name email phone')
      .populate('courseId', 'title description price instructor duration');

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment record not found',
      });
    }

    // Generate QR code
    let qrCodeImage;
    try {
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-payment/${tx_ref}`;
      qrCodeImage = await QRCode.toDataURL(verificationUrl);
    } catch (qrError) {
      console.warn('QR code generation failed:', qrError);
    }

    const doc = new PDFDocument({ 
      size: 'A4',
      margin: 40,
      info: {
        Title: `Payment Receipt - ${tx_ref}`,
        Author: 'Ahadu Learning',
      },
    });

    doc.on('error', (err) => {
      console.error('PDF stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: 'Error generating PDF',
        });
      }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Payment-Receipt-${tx_ref}.pdf`);
    doc.pipe(res);

    // Header with Ahadu Learning text (no logo)
    doc.fontSize(20)
       .fillColor('#2C3E50')
       .text('Ahadu Learning', 50, 50)
       .text('PAYMENT RECEIPT', 50, 80);

    doc.fontSize(10)
       .fillColor('#7f8c8d')
       .text('OFFICIAL PAYMENT RECEIPT', 50, 90);

    doc.moveTo(50, 105)
       .lineTo(550, 105)
       .stroke('#3498db')
       .lineWidth(1);

    // Consolidated table with all information
    const tableSections = [
      {
        title: 'Payment Information',
        rows: [
          { label: 'Receipt Number', value: tx_ref },
          { label: 'Date', value: new Date(payment.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
          { label: 'Amount Paid', value: `${payment.amount.toLocaleString()} ETB`, highlight: true },
          { label: 'Payment Method', value: payment.chapaData?.data?.method || 'Online Payment' },
          { label: 'Status', value: payment.status.toUpperCase() },
        ],
      },
      {
        title: 'Student Information',
        rows: [
          { label: 'Full Name', value: payment.studentId?.name || 'N/A' },
          { label: 'Email Address', value: payment.studentId?.email || 'N/A' },
          { label: 'Phone Number', value: payment.studentId?.phone || 'N/A' },
        ],
      },
      {
        title: 'Course Information',
        rows: [
          { label: 'Course Title', value: payment.courseId?.title || 'N/A' },
          { label: 'Instructor', value: payment.courseId?.instructor || 'N/A' },
          { label: 'Duration', value: payment.courseId?.duration || 'N/A' },
          { label: 'Course Price', value: `${payment.courseId?.price?.toLocaleString() || '0'} ETB` },
        ],
      },
    ];

    let currentY = drawConsolidatedTable(doc, tableSections, 50, 130);

    // QR Code (if there's space)
    if (qrCodeImage && currentY < 650) {
      doc.image(qrCodeImage, 400, currentY, { width: 100 });
      doc.fontSize(10)
         .fillColor('#7f8c8d')
         .text('Scan to verify payment', 400, currentY + 110, {
           width: 100,
           align: 'center',
         });
      currentY += 130;
    }

    // Footer
    doc.moveTo(50, currentY)
       .lineTo(550, currentY)
       .stroke('#3498db')
       .lineWidth(1);

    doc.fontSize(10)
       .fillColor('#7f8c8d')
       .text('Thank you for your payment.', 50, currentY + 20);

    doc.end();
  } catch (error) {
    console.error('Error generating receipt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate receipt',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({})
      .populate('studentId', 'name email')
      .populate('courseId', 'title')
      .sort({ createdAt: -1 });

    // Format transactions for frontend
    const formattedTransactions = transactions.map(tx => ({
      id: tx._id,
      date: tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'N/A',
      student: tx.studentId?.name || 'N/A',
      course: tx.courseId?.title || 'N/A',
      amount: tx.amountPaid || 0,
      instructor: 'Admin User', // Since instructorId is populated
      status: tx.status || 'pending'
    }));

    res.status(200).json({
      success: true,
      transactions: formattedTransactions
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};