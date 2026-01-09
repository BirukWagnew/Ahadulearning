import mongoose from 'mongoose';
import Transaction from './api/models/Transaction.js';
import User from './api/models/User.js';
import Course from './api/models/Course.js';
import Payment from './api/models/Payment.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ahadu-learning');

const createSampleTransactions = async () => {
  try {
    // Get sample data
    const users = await User.find({}).limit(5);
    const courses = await Course.find({}).limit(3);
    const payments = await Payment.find({}).limit(3);

    if (users.length === 0 || courses.length === 0 || payments.length === 0) {
      console.log('Need to create sample data first...');
      return;
    }

    // Create sample transactions
    const sampleTransactions = [
      {
        instructorId: users[0]._id,
        courseId: courses[0]._id,
        studentId: users[1]._id,
        paymentId: payments[0]?._id || new mongoose.Types.ObjectId(),
        amountPaid: 49.99,
        instructorShare: 39.99,
        platformShare: 10.00,
        status: 'completed',
        createdAt: new Date('2024-01-15')
      },
      {
        instructorId: users[0]._id,
        courseId: courses[1]._id,
        studentId: users[2]._id,
        paymentId: payments[1]?._id || new mongoose.Types.ObjectId(),
        amountPaid: 79.99,
        instructorShare: 63.99,
        platformShare: 16.00,
        status: 'completed',
        createdAt: new Date('2024-01-14')
      },
      {
        instructorId: users[0]._id,
        courseId: courses[2]._id,
        studentId: users[3]._id,
        paymentId: payments[2]?._id || new mongoose.Types.ObjectId(),
        amountPaid: 59.99,
        instructorShare: 47.99,
        platformShare: 12.00,
        status: 'failed',
        createdAt: new Date('2024-01-13')
      }
    ];

    // Clear existing transactions
    await Transaction.deleteMany({});

    // Insert sample transactions
    const inserted = await Transaction.insertMany(sampleTransactions);
    console.log(`Created ${inserted.length} sample transactions`);

    // Display the transactions
    const transactions = await Transaction.find({})
      .populate('studentId', 'name email')
      .populate('courseId', 'title')
      .sort({ createdAt: -1 });

    console.log('Sample transactions:');
    transactions.forEach(tx => {
      console.log(`- ${tx.courseId?.title} by ${tx.studentId?.name} - $${tx.amountPaid} (${tx.status})`);
    });

  } catch (error) {
    console.error('Error creating sample transactions:', error);
  } finally {
    mongoose.disconnect();
  }
};

createSampleTransactions();
