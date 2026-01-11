import express from 'express';
import {
  createCourse,
  getCourses,
  getInstructorCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getStudentCountForCourse,
  getInstructorCoursesWithProgress,
  getCourseAverageProgress,
  setCourseStatus,
  setCourseVisibility,
  getActiveCourses,
  getAllCourses,
} from '../../controllers/Instructor-controller/courseController.js';
import { protect, instructor, adminAuth } from '../../middleware/authMiddleware.js';
import { upload } from '../../middleware/uploadToCloudinary.js';

const router = express.Router();

// Get all courses (GET) - for admin CourseManagement
router.get('/', protect, getCourses);

// Get all courses (GET) - alternative endpoint
router.get('/list', protect, getCourses);

// Get all courses (POST)
router.post('/list', getCourses);

// Create course (POST)
router.post('/', protect, instructor, upload.single('thumbnail'), createCourse);

// Get active courses (POST)
router.post('/active', getActiveCourses);

// Get active courses (GET) - avoid falling through to /:id
router.get('/active', getActiveCourses);

// Get student count for course (POST)
router.post('/:courseId/student-count', getStudentCountForCourse);

// Update course status (PATCH)
router.patch('/:courseId/status', protect, instructor, setCourseStatus);

// Update course visibility (PATCH)
router.patch('/visibility/:id', adminAuth, setCourseVisibility);

// Get instructor courses with progress (POST)
router.post('/:instructorId/courses/progress', getInstructorCoursesWithProgress);

// Get course average progress (POST)
router.post('/:instructorId/course/:courseId/average-progress', getCourseAverageProgress);

// Get instructor courses (POST)
router.post('/instructor/:instructorId/courses', getInstructorCourses);

// Get course by ID (GET)
router.get('/:id', getCourseById);

// Get course by ID (POST)
router.post('/:id', getCourseById);

// Update course (PUT)
router.put('/:id', protect, instructor, upload.single('thumbnail'), updateCourse);

// Delete course (DELETE)
router.delete('/:id', protect, instructor, deleteCourse);

// Get all courses (POST)
router.post('/all', getAllCourses);

export default router;
