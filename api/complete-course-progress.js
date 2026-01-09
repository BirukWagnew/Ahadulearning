import mongoose from 'mongoose';
import Progress from './models/Progress.js';
import Lesson from './models/Lesson.js';
import Course from './models/Course.js';
import Module from './models/Module.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ahadu_learning')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      const courseId = '69601a57532f6c607eec8426';
      const studentId = '695d6910467839b6b67bc238';
      
      // Get all lessons for the course
      const course = await Course.findById(courseId).populate({
        path: 'modules',
        populate: {
          path: 'lessons',
          model: 'Lesson'
        }
      });
      
      if (!course) {
        console.log('Course not found');
        process.exit(1);
      }
      
      // Get all lesson IDs
      const allLessonIds = [];
      course.modules.forEach(module => {
        if (module.lessons) {
          module.lessons.forEach(lesson => {
            allLessonIds.push(lesson._id);
          });
        }
      });
      
      console.log('Total lessons found:', allLessonIds.length);
      
      // Update progress to 100% completion
      const progress = await Progress.findOne({
        studentId: studentId,
        courseId: courseId
      });
      
      if (progress) {
        progress.completedLessons = allLessonIds;
        progress.totalLessons = allLessonIds.length;
        progress.progressPercentage = 100.00;
        await progress.save();
        console.log('Progress updated to 100% completion');
      } else {
        console.log('No progress record found');
      }
      
      console.log('Course is now completed!');
      console.log('Student can now get certificate');
      
      process.exit(0);
    } catch (error) {
      console.error('Error completing course:', error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
