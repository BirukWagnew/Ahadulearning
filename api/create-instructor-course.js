import mongoose from 'mongoose';
import Course from './models/Course.js';
import User from './models/User.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ahadu_learning')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Find the instructor
      const instructor = await User.findOne({ email: 'teshales912@gmail.com' });
      if (!instructor) {
        console.log('Instructor not found');
        process.exit(1);
      }
      
      console.log('Creating course for instructor:', instructor.name);
      
      // Create a test course
      const course = new Course({
        title: 'Advanced React Development',
        description: 'Learn advanced React concepts including hooks, context, and performance optimization',
        instructor: instructor._id,
        category: 'programming',
        level: 'intermediate',
        price: 79.99,
        requirements: ['Basic JavaScript knowledge', 'React fundamentals'],
        thumbnail: {
          url: 'https://via.placeholder.com/300x200/4f46e5/ffffff?text=React+Course',
          publicId: 'test-react-course'
        },
        published: true,
        isActive: true,
        embedding: [0.1, 0.2, 0.3, 0.4, 0.5] // Mock embedding
      });
      
      const savedCourse = await course.save();
      console.log('Course created successfully!');
      console.log('Course ID:', savedCourse._id);
      console.log('Course Title:', savedCourse.title);
      console.log('Instructor:', instructor.name);
      
      process.exit(0);
    } catch (error) {
      console.error('Error creating course:', error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
