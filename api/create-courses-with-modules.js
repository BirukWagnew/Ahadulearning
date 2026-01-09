import mongoose from 'mongoose';
import Course from './models/Course.js';
import Module from './models/Module.js';
import Lesson from './models/Lesson.js';
import User from './models/User.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ahadu-learning');

const createCoursesWithModules = async () => {
  try {
    console.log('Creating courses with modules and lessons...');
    
    // Get instructor
    const instructor = await User.findOne({ role: 'instructor' });
    if (!instructor) {
      console.log('No instructor found');
      return;
    }

    // Create courses first (modules need course reference)
    const coursesWithModules = await Course.insertMany([
      {
        title: 'React Fundamentals',
        description: 'Learn the basics of React including components, props, state, and hooks.',
        price: 49.99,
        instructor: instructor._id,
        category: 'programming',
        level: 'beginner',
        published: true,
        thumbnail: {
          url: 'https://via.placeholder.com/300x200/4F46E5B1?text=React',
          publicId: 'react-fundamentals'
        }
      },
      {
        title: 'Advanced React Patterns',
        description: 'Master advanced React patterns and best practices.',
        price: 79.99,
        instructor: instructor._id,
        category: 'programming',
        level: 'advanced',
        published: true,
        thumbnail: {
          url: 'https://via.placeholder.com/300x200/4F46E5B1?text=Advanced',
          publicId: 'react-advanced'
        }
      }
    ]);

    // Create modules with course references
    const reactModule = await Module.create({
      title: 'React Fundamentals',
      description: 'Learn the basics of React',
      course: coursesWithModules[0]._id,
      position: 1
    });

    const hooksModule = await Module.create({
      title: 'React Hooks',
      description: 'Master React Hooks',
      course: coursesWithModules[1]._id,
      position: 2
    });

    // Create lessons for React Fundamentals module
    const reactLessons = await Lesson.insertMany([
      {
        title: 'Introduction to React',
        description: 'What is React and why use it',
        type: 'video',
        module: reactModule._id,
        position: 1,
        duration: 30,
        videoUrl: 'https://example.com/react-intro.mp4',
        content: 'React is a JavaScript library for building user interfaces'
      },
      {
        title: 'Components and Props',
        description: 'Understanding React components and props',
        type: 'video',
        module: reactModule._id,
        position: 2,
        duration: 45,
        videoUrl: 'https://example.com/components.mp4',
        content: 'Learn how to create and use React components'
      },
      {
        title: 'State and Lifecycle',
        description: 'Managing component state and lifecycle methods',
        type: 'video',
        module: reactModule._id,
        position: 3,
        duration: 40,
        videoUrl: 'https://example.com/state.mp4',
        content: 'Understanding state management in React'
      }
    ]);

    // Create lessons for React Hooks module
    const hooksLessons = await Lesson.insertMany([
      {
        title: 'useState Hook',
        description: 'Managing component state with useState',
        type: 'video',
        module: hooksModule._id,
        position: 1,
        duration: 35,
        videoUrl: 'https://example.com/usestate.mp4',
        content: 'Learn how to use useState hook'
      },
      {
        title: 'useEffect Hook',
        description: 'Handling side effects with useEffect',
        type: 'video',
        module: hooksModule._id,
        position: 2,
        duration: 40,
        videoUrl: 'https://example.com/useeffect.mp4',
        content: 'Learn how to use useEffect hook'
      },
      {
        title: 'Custom Hooks',
        description: 'Creating your own custom hooks',
        type: 'quiz',
        module: hooksModule._id,
        position: 3,
        duration: 25,
        videoUrl: '',
        content: 'Learn how to create custom React hooks'
      }
    ]);

    console.log(`Created ${coursesWithModules.length} courses with modules and lessons`);
    console.log('React Module lessons:', reactLessons.length);
    console.log('Hooks Module lessons:', hooksLessons.length);

    mongoose.disconnect();
  } catch (error) {
    console.error('Error creating courses with modules:', error);
    mongoose.disconnect();
  }
};

createCoursesWithModules();
