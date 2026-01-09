import mongoose from 'mongoose';
import Course from './models/Course.js';
import Module from './models/Module.js';
import Lesson from './models/Lesson.js';
import Progress from './models/Progress.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ahadu_learning')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      const courseId = '69601a57532f6c607eec8426';
      
      // Create modules for the course
      const modules = [
        {
          title: 'Introduction to Advanced React',
          description: 'Getting started with advanced React concepts',
          course: courseId,
          position: 1
        },
        {
          title: 'React Hooks Deep Dive',
          description: 'Mastering React Hooks',
          course: courseId,
          position: 2
        },
        {
          title: 'Performance Optimization',
          description: 'Optimizing React applications',
          course: courseId,
          position: 3
        }
      ];
      
      const createdModules = await Module.insertMany(modules);
      console.log('Created modules:', createdModules.length);
      
      // Create lessons for each module
      const lessons = [];
      
      createdModules.forEach((module, moduleIndex) => {
        const moduleLessons = [
          {
            title: `Lesson ${moduleIndex * 2 + 1}: Introduction`,
            description: `Introduction to ${module.title}`,
            content: `This is the introduction lesson for ${module.title}`,
            videoUrl: 'https://sample-videos.com/intro.mp4',
            duration: 15,
            position: 1,
            module: module._id,
            course: courseId
          },
          {
            title: `Lesson ${moduleIndex * 2 + 2}: Deep Dive`,
            description: `Deep dive into ${module.title}`,
            content: `This is the deep dive lesson for ${module.title}`,
            videoUrl: 'https://sample-videos.com/deepdive.mp4',
            duration: 25,
            position: 2,
            module: module._id,
            course: courseId
          }
        ];
        
        lessons.push(...moduleLessons);
      });
      
      const createdLessons = await Lesson.insertMany(lessons);
      console.log('Created lessons:', createdLessons.length);
      
      // Create progress records for enrolled students
      const studentId = '695d6910467839b6b67bc238'; // Test student
      
      const totalLessons = createdLessons.length;
      const progress = await Progress.create({
        studentId: studentId,
        courseId: courseId,
        completedLessons: createdLessons.slice(0, 2).map(l => l._id), // Complete first 2 lessons
        totalLessons: totalLessons,
        progressPercentage: parseFloat(((2 / totalLessons) * 100).toFixed(2))
      });
      
      console.log('Created progress record');
      console.log('Progress percentage:', progress.progressPercentage + '%');
      
      console.log('Course setup complete!');
      console.log('- Modules:', createdModules.length);
      console.log('- Lessons:', createdLessons.length);
      console.log('- Progress created for student');
      
      process.exit(0);
    } catch (error) {
      console.error('Error setting up course:', error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
