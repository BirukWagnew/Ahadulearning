import express from 'express';
import { 
  getStudentEnrollmentsPerCourse,
  getPlatformOverview,
  getCourseEnrollments,
  getUserStatistics,
  getRevenueStatistics
} from '../../controllers/graphs/admin.js';
import { protect, adminAuth } from '../../middleware/authMiddleware.js';

const adminRouter = express.Router();
adminRouter.use(protect, adminAuth);

// Analytics endpoints
adminRouter.get('/overview', getPlatformOverview);
adminRouter.get('/enrollments-per-course', getStudentEnrollmentsPerCourse);
adminRouter.get('/course-enrollments', getCourseEnrollments);
adminRouter.get('/user-statistics', getUserStatistics);
adminRouter.get('/revenue-statistics', getRevenueStatistics);

export default adminRouter;