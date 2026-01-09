import mongoose from 'mongoose';
import User from './models/User.js';
import Course from './models/Course.js';
import Enrollment from './models/Enrollment.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ahadu-learning');

const createInstructorData = async () => {
  try {
    console.log('Creating instructor data...');
    
    // Check if there's an instructor user
    let instructor = await User.findOne({ role: 'instructor' });
    
    if (!instructor) {
      console.log('No instructor found, creating sample instructor...');
      instructor = await User.create({
        name: 'Sample Instructor',
        email: 'instructor@example.com',
        role: 'instructor',
        password: 'Password123!',
        expertise: 'Web Development, React, JavaScript'
      });
      console.log('Created sample instructor:', instructor._id);
    } else {
      console.log('Instructor already exists:', instructor._id);
    }

    // Check if instructor has courses
    const instructorCourses = await Course.find({ instructor: instructor._id });
    console.log('Instructor courses found:', instructorCourses.length);

    if (instructorCourses.length === 0) {
      console.log('Creating courses for instructor...');
      
      // Create sample courses for this instructor
      const sampleCourses = [
        {
          title: 'React Fundamentals',
          description: 'Learn the basics of React including components and state management',
          price: 49.99,
          instructor: instructor._id,
          category: 'programming',
          level: 'beginner',
          published: true
        },
        {
          title: 'Advanced React Patterns',
          description: 'Master advanced React patterns and best practices',
          price: 79.99,
          instructor: instructor._id,
          category: 'programming',
          level: 'advanced',
          published: true
        },
        {
          title: 'React Hooks Deep Dive',
          description: 'Comprehensive guide to React Hooks',
          price: 59.99,
          instructor: instructor._id,
          category: 'programming',
          level: 'intermediate',
          published: true
        }
      ];

      const createdCourses = await Course.insertMany(sampleCourses);
      console.log(`Created ${createdCourses.length} courses for instructor`);
    }

    // Create some enrollments for instructor's courses
    const students = await User.find({ role: 'student' }).limit(3);
    const finalInstructorCourses = await Course.find({ instructor: instructor._id });
    
    if (students.length > 0 && finalInstructorCourses.length > 0) {
      for (let i = 0; i < Math.min(students.length, finalInstructorCourses.length); i++) {
        await Enrollment.create({
          studentId: students[i]._id,
          courseId: finalInstructorCourses[i]._id,
          enrolledAt: new Date(),
          status: 'active',
          progress: Math.floor(Math.random() * 100) // Random progress
        });
        console.log(`Enrolled student in ${finalInstructorCourses[i].title}`);
      }
    }

    console.log('\nInstructor dashboard data ready!');
    console.log('- Instructor ID:', instructor._id);
    console.log('- Instructor courses:', finalInstructorCourses.length);
    console.log('- API endpoint: /api/courses/instructor/' + instructor._id + '/courses');

  } catch (error) {
    console.error('Error creating instructor data:', error);
  } finally {
    mongoose.disconnect();
  }
};

createInstructorData();
