import express from 'express';
import { enrollStudent, checkEnrollment,getEnrolledCourses } from '../../controllers/Instructor-controller/enrollmentController.js';
import Enrollment from '../../models/Enrollment.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.get('/check', protect, async (req, res) => {
    const { studentId, courseId } = req.query;
  
    try {
      const enrollment = await Enrollment.findOne({ studentId, courseId });
      res.json({ isEnrolled: !!enrollment });
    } catch (error) {
      console.error("Enrollment check error:", error);
      res.status(500).json({ error: "Server error checking enrollment" });
    }
  });

router.post('/', protect, (req, res, next) => {
    if (req.user?.role !== 'student') {
      return res.status(403).json({ error: 'Only students can enroll in courses.' });
    }
    return next();
  }, enrollStudent);

router.get("/:studentId/courses", protect, getEnrolledCourses);
router.get('/:studentId/:courseId', protect, checkEnrollment);

export default router;
