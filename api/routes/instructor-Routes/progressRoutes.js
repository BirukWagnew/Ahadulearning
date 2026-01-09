import express from 'express';
import { 
  updateProgress, 
  getCompletedLessons, 
  getProgressData, 
  getAllStudentsProgress, 
  getCourseProgressSummary 
} from '../../controllers/Instructor-controller/progressController.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Update student progress
router.post('/', protect, updateProgress);

// Get completed lessons for a student in a course
router.get('/:studentId/:courseId/completedLessons', protect, getCompletedLessons);

// Get progress data for a specific student in a course
router.get('/:studentId/:courseId', protect, getProgressData);

// Get progress summary for all students in a course
router.get('/all-progress/:courseId', protect, getAllStudentsProgress);

// Get course progress summary (e.g., average progress, student count)
router.get('/:courseId/summary', protect, getCourseProgressSummary);

export default router;
