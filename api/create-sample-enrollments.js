import mongoose from 'mongoose';
import Enrollment from './models/Enrollment.js';
import User from './models/User.js';
import Course from './models/Course.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ahadu-learning');

const checkAndCreateEnrollments = async () => {
  try {
    console.log('Checking existing enrollments...');
    
    // Check existing enrollments
    const existingEnrollments = await Enrollment.find({}).populate('studentId courseId');
    console.log('Existing enrollments found:', existingEnrollments.length);
    
    if (existingEnrollments.length > 0) {
      console.log('Current enrollments:');
      existingEnrollments.forEach(enrollment => {
        console.log(`- Student: ${enrollment.studentId?.name || 'Unknown'}, Course: ${enrollment.courseId?.title || 'Unknown'}`);
      });
      return;
    }

    // Get sample data
    const students = await User.find({ role: 'student' }).limit(3);
    const courses = await Course.find({}).limit(3);

    if (students.length === 0 || courses.length === 0) {
      console.log('No students or courses found, creating sample data...');
      
      // Create admin user if not exists
      let adminUser = await User.findOne({ role: 'admin' });
      if (!adminUser) {
        adminUser = await User.create({
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
          password: 'Password123!'
        });
      }

      // Create sample courses if none exist
      if (courses.length === 0) {
        await Course.create([
          { 
            title: 'Introduction to React', 
            description: 'Learn the basics of React',
            price: 49.99, 
            instructor: adminUser._id,
            category: 'programming',
            level: 'beginner',
            published: true
          },
          { 
            title: 'Advanced JavaScript', 
            description: 'Master advanced JavaScript',
            price: 79.99, 
            instructor: adminUser._id,
            category: 'programming',
            level: 'advanced',
            published: true
          }
        ]);
      }

      // Create sample students if none exist
      if (students.length === 0) {
        await User.create([
          { name: 'John Student', email: 'john@example.com', role: 'student', password: 'Password123!' },
          { name: 'Jane Student', email: 'jane@example.com', role: 'student', password: 'Password123!' },
          { name: 'Bob Student', email: 'bob@example.com', role: 'student', password: 'Password123!' }
        ]);
      }

      // Get created data
      const newStudents = await User.find({ role: 'student' }).limit(3);
      const newCourses = await Course.find({}).limit(3);
      
      // Create enrollments
      const sampleEnrollments = [];
      for (let i = 0; i < Math.min(newStudents.length, newCourses.length); i++) {
        const enrollment = await Enrollment.create({
          studentId: newStudents[i]._id,
          courseId: newCourses[i]._id,
          enrolledAt: new Date(),
          status: 'active',
          progress: 0
        });
        sampleEnrollments.push(enrollment);
        console.log(`Enrolled ${newStudents[i].name} in ${newCourses[i].title}`);
      }
      
      console.log(`Created ${sampleEnrollments.length} sample enrollments`);
    } else {
      // Create enrollments with existing data
      const sampleEnrollments = [];
      for (let i = 0; i < Math.min(students.length, courses.length); i++) {
        const enrollment = await Enrollment.create({
          studentId: students[i]._id,
          courseId: courses[i]._id,
          enrolledAt: new Date(),
          status: 'active',
          progress: 0
        });
        sampleEnrollments.push(enrollment);
        console.log(`Enrolled ${students[i].name} in ${courses[i].title}`);
      }
      
      console.log(`Created ${sampleEnrollments.length} sample enrollments`);
    }

    // Verify enrollments were created
    const finalEnrollments = await Enrollment.find({}).populate('studentId courseId');
    console.log('\nFinal enrollment count:', finalEnrollments.length);
    
    console.log('\nEnrollment data ready for admin dashboard!');
    console.log('API endpoint: /api/enrollments');

  } catch (error) {
    console.error('Error checking/creating enrollments:', error);
  } finally {
    mongoose.disconnect();
  }
};

checkAndCreateEnrollments();
