import mongoose from 'mongoose';
import Enrollment from './models/Enrollment.js';
import Course from './models/Course.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ahadu_learning')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      const studentId = '695d6910467839b6b67bc238';
      const courseId = '695ff77d5609a435c562eff4';
      
      // Check if enrollment exists
      const existingEnrollment = await Enrollment.findOne({
        studentId: studentId,
        courseId: courseId
      });
      
      if (existingEnrollment) {
        console.log('Enrollment already exists:', existingEnrollment);
      } else {
        // Create enrollment
        const enrollment = new Enrollment({
          studentId: studentId,
          courseId: courseId,
          enrolledAt: new Date(),
          status: 'active',
          progress: 0
        });
        
        await enrollment.save();
        console.log('Enrollment created successfully!');
      }
      
      // Check course exists
      const course = await Course.findById(courseId);
      if (course) {
        console.log('Course found:', course.title);
      } else {
        console.log('Course not found');
      }
      
      process.exit(0);
    } catch (error) {
      console.error('Error fixing enrollment:', error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
