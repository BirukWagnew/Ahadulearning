import mongoose from 'mongoose';
import Progress from './models/Progress.js';
import User from './models/User.js';
import Course from './models/Course.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ahadu-learning');

const createSampleProgress = async () => {
  try {
    // Get the specific student and course IDs from the error logs
    const studentId = '695d6910467839b6b67bc238';
    const courseId = '695ff9415609a435c562f2c5';

    // Check if student exists
    const student = await User.findById(studentId);
    if (!student) {
      console.log('Student not found, creating sample student...');
      const newStudent = await User.create({
        name: 'Sample Student',
        email: 'student@example.com',
        role: 'student',
        password: 'Password123!'
      });
      console.log('Created sample student:', newStudent._id);
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      console.log('Course not found, creating sample course...');
      const adminUser = await User.findOne({ role: 'admin' });
      const newCourse = await Course.create({
        title: 'Sample Course',
        description: 'A sample course for testing progress',
        price: 49.99,
        instructor: adminUser._id,
        category: 'programming',
        level: 'beginner',
        published: true
      });
      console.log('Created sample course:', newCourse._id);
    }

    // Check if progress already exists
    const existingProgress = await Progress.findOne({ studentId, courseId });
    if (existingProgress) {
      console.log('Progress already exists for this student and course');
      console.log('Progress data:', existingProgress);
      return;
    }

    // Create sample progress data
    const sampleProgress = await Progress.create({
      studentId: new mongoose.Types.ObjectId(studentId),
      courseId: new mongoose.Types.ObjectId(courseId),
      completedLessons: ['lesson1', 'lesson2', 'lesson3'], // Sample lesson IDs
      totalLessons: 10,
      progressPercentage: 30
    });

    console.log('Created sample progress data:');
    console.log('- Student ID:', sampleProgress.studentId);
    console.log('- Course ID:', sampleProgress.courseId);
    console.log('- Completed Lessons:', sampleProgress.completedLessons);
    console.log('- Total Lessons:', sampleProgress.totalLessons);
    console.log('- Progress Percentage:', sampleProgress.progressPercentage);

    // Test the API endpoints
    console.log('\nTesting API endpoints...');
    
    // Test getCompletedLessons
    const completedLessons = await Progress.findOne({ studentId, courseId });
    console.log('Completed lessons:', completedLessons?.completedLessons || []);
    
    // Test getProgressData
    const progressData = await Progress.findOne({ studentId, courseId });
    if (progressData) {
      console.log('Progress data:');
      console.log('- Completed Lessons:', progressData.completedLessons);
      console.log('- Total Lessons:', progressData.totalLessons);
      console.log('- Progress Percentage:', progressData.progressPercentage);
    }

  } catch (error) {
    console.error('Error creating sample progress:', error);
  } finally {
    mongoose.disconnect();
  }
};

createSampleProgress();
