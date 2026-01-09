import mongoose from 'mongoose';
import Transaction from './models/Transaction.js';
import User from './models/User.js';
import Course from './models/Course.js';
import Payment from './models/Payment.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ahadu-learning');

const createSampleTransactions = async () => {
  try {
    // Get sample data
    const users = await User.find({}).limit(5);
    const courses = await Course.find({}).limit(3);
    const payments = await Payment.find({}).limit(3);

    if (users.length === 0 || courses.length === 0) {
      console.log('Creating sample users and courses first...');
      
      // Create sample users if none exist
      if (users.length === 0) {
        await User.create([
          { name: 'Admin User', email: 'admin@example.com', role: 'admin', password: 'Password123!' },
          { name: 'John Student', email: 'john@example.com', role: 'student', password: 'Password123!' },
          { name: 'Jane Student', email: 'jane@example.com', role: 'student', password: 'Password123!' },
          { name: 'Bob Student', email: 'bob@example.com', role: 'student', password: 'Password123!' }
        ]);
      }

      // Create sample courses if none exist
      if (courses.length === 0) {
        const adminUser = await User.findOne({ role: 'admin' });
        await Course.create([
          { 
            title: 'Introduction to React', 
            description: 'Learn the basics of React including components, props, state, and hooks.',
            price: 49.99, 
            instructor: adminUser._id,
            category: 'programming',
            level: 'beginner',
            published: true
          },
          { 
            title: 'Advanced JavaScript', 
            description: 'Master advanced JavaScript concepts including closures, prototypes, and async programming.',
            price: 79.99, 
            instructor: adminUser._id,
            category: 'programming',
            level: 'advanced',
            published: true
          },
          { 
            title: 'Python for Beginners', 
            description: 'Start your programming journey with Python fundamentals and basic programming concepts.',
            price: 59.99, 
            instructor: adminUser._id,
            category: 'programming',
            level: 'beginner',
            published: true
          }
        ]);
      }

      // Get the created data
      const newUsers = await User.find({}).limit(5);
      const newCourses = await Course.find({}).limit(3);

      // Create sample transactions
      const sampleTransactions = [
        {
          instructorId: newUsers[0]._id,
          courseId: newCourses[0]._id,
          studentId: newUsers[1]._id,
          paymentId: new mongoose.Types.ObjectId(),
          amountPaid: 49.99,
          instructorShare: 39.99,
          platformShare: 10.00,
          status: 'completed',
          createdAt: new Date('2024-01-15')
        },
        {
          instructorId: newUsers[0]._id,
          courseId: newCourses[1]._id,
          studentId: newUsers[2]._id,
          paymentId: new mongoose.Types.ObjectId(),
          amountPaid: 79.99,
          instructorShare: 63.99,
          platformShare: 16.00,
          status: 'completed',
          createdAt: new Date('2024-01-14')
        },
        {
          instructorId: newUsers[0]._id,
          courseId: newCourses[2]._id,
          studentId: newUsers[3]._id,
          paymentId: new mongoose.Types.ObjectId(),
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
    } else {
      console.log('Users and courses already exist, creating transactions...');
      
      // Create sample transactions with existing data
      const sampleTransactions = [
        {
          instructorId: users[0]._id,
          courseId: courses[0]._id,
          studentId: users[1]?._id || users[0]._id,
          paymentId: new mongoose.Types.ObjectId(),
          amountPaid: 49.99,
          instructorShare: 39.99,
          platformShare: 10.00,
          status: 'completed',
          createdAt: new Date('2024-01-15')
        },
        {
          instructorId: users[0]._id,
          courseId: courses[1]?._id || courses[0]._id,
          studentId: users[2]?._id || users[0]._id,
          paymentId: new mongoose.Types.ObjectId(),
          amountPaid: 79.99,
          instructorShare: 63.99,
          platformShare: 16.00,
          status: 'completed',
          createdAt: new Date('2024-01-14')
        },
        {
          instructorId: users[0]._id,
          courseId: courses[2]?._id || courses[0]._id,
          studentId: users[3]?._id || users[0]._id,
          paymentId: new mongoose.Types.ObjectId(),
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
    }

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
