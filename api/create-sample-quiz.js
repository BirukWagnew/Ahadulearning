import mongoose from 'mongoose';
import QuizQuestion from './models/QuizQuestion.js';
import Lesson from './models/Lesson.js';
import Module from './models/Module.js';
import Course from './models/Course.js';
import User from './models/User.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ahadu-learning');

const createSampleQuizData = async () => {
  try {
    const lessonId = '695ff9525609a435c562f448'; // From the error log

    // Check if lesson exists
    let lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      console.log('Lesson not found, creating sample lesson...');
      
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

      // Create course if not exists
      let course = await Course.findOne({ title: 'Sample Course' });
      if (!course) {
        course = await Course.create({
          title: 'Sample Course',
          description: 'A sample course for testing',
          price: 49.99,
          instructor: adminUser._id,
          category: 'programming',
          level: 'beginner',
          published: true
        });
      }

      // Create module if not exists
      let module = await Module.findOne({ title: 'Sample Module' });
      if (!module) {
        module = await Module.create({
          title: 'Sample Module',
          description: 'A sample module',
          course: course._id,
          position: 1
        });
      }

      // Create lesson
      lesson = await Lesson.create({
        title: 'Sample Quiz Lesson',
        description: 'A sample lesson with quiz',
        type: 'quiz',
        module: module._id,
        position: 1,
        duration: 30,
        videoUrl: '',
        content: 'Sample content for quiz lesson',
        quizQuestions: []
      });

      console.log('Created sample lesson:', lesson._id);
    }

    // Check if quiz questions already exist
    const existingQuestions = await QuizQuestion.find({ lesson: lesson._id });
    if (existingQuestions.length > 0) {
      console.log('Quiz questions already exist for this lesson');
      console.log('Existing questions:', existingQuestions.length);
      return;
    }

    // Create sample quiz questions
    const sampleQuestions = [
      {
        lesson: lesson._id,
        question: 'What is React?',
        options: [
          { text: 'A JavaScript library for building user interfaces', isCorrect: true },
          { text: 'A database management system', isCorrect: false },
          { text: 'A programming language', isCorrect: false },
          { text: 'An operating system', isCorrect: false }
        ],
        type: 'single',
        points: 10
      },
      {
        lesson: lesson._id,
        question: 'What is a React component?',
        options: [
          { text: 'A reusable piece of UI', isCorrect: true },
          { text: 'A database table', isCorrect: false },
          { text: 'A CSS file', isCorrect: false },
          { text: 'A server configuration', isCorrect: false }
        ],
        type: 'single',
        points: 10
      },
      {
        lesson: lesson._id,
        question: 'What is JSX?',
        options: [
          { text: 'A syntax extension for JavaScript', isCorrect: true },
          { text: 'A styling language', isCorrect: false },
          { text: 'A database query language', isCorrect: false },
          { text: 'A version control system', isCorrect: false }
        ],
        type: 'single',
        points: 10
      }
    ];

    const createdQuestions = await QuizQuestion.insertMany(sampleQuestions);
    console.log('Created sample quiz questions:', createdQuestions.length);

    // Update lesson with quiz question references
    const questionIds = createdQuestions.map(q => q._id);
    await Lesson.findByIdAndUpdate(lesson._id, {
      $push: { quizQuestions: { $each: questionIds } }
    });

    console.log('Updated lesson with quiz question references');

    // Test the API endpoint
    const lessonWithQuestions = await Lesson.findById(lesson._id).populate('quizQuestions');
    console.log('Lesson with questions:', lessonWithQuestions.quizQuestions.length);

    console.log('\nSample quiz data created successfully!');
    console.log('- Lesson ID:', lesson._id);
    console.log('- Questions created:', createdQuestions.length);
    console.log('- API endpoint: /api/quizzes/' + lesson._id + '/questions');

  } catch (error) {
    console.error('Error creating sample quiz data:', error);
  } finally {
    mongoose.disconnect();
  }
};

createSampleQuizData();
