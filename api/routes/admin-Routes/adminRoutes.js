import express from "express";
import {
  approveInstructor,
  rejectInstructor,
  listPendingInstructors,
  listActiveInstructors,
  listAllUsers,
  getUsersByRole,
  blockUser,
  unblockUser,
  getUserById,
  deleteUser,
  getAllCoursesAdmin,
  deleteCourseAdmin,
  getPaymentTransactions,
  getWithdrawalRequests,
  approveWithdrawal,
  rejectWithdrawal,
  generatePaymentReport,
  getCourseStudents,
} from "../../controllers/admin-conroller/adminController.js";
import { adminAuth, protect } from "../../middleware/authMiddleware.js";
import { 
  getStudentEnrollmentsPerCourse,
  getPlatformOverview,
  getCourseEnrollments,
  getUserStatistics,
  getRevenueStatistics
} from "../../controllers/graphs/admin.js";

const router = express.Router();

router.put("/approve-instructor/:userId", adminAuth, approveInstructor);

router.delete("/reject-instructor/:id", adminAuth, rejectInstructor);

router.get("/pending-instructors", adminAuth, listPendingInstructors);

router.get("/active-instructors", adminAuth, listActiveInstructors);

router.get("/all-users", protect, adminAuth, listAllUsers); // Added protect middleware
router.get("/role/:role", adminAuth, getUsersByRole);
router.put("/block/:id", protect, adminAuth, blockUser);
router.put("/unblock/:id", protect, adminAuth, unblockUser);

// Debug route to test if admin routes are working
router.get("/test", (req, res) => {
  res.json({ message: "Admin routes are working", timestamp: new Date() });
});

router.delete("/delete/:id", adminAuth, deleteUser);

// Course management routes
router.get('/courses', adminAuth, getAllCoursesAdmin);
router.delete('/courses/:id', adminAuth, deleteCourseAdmin);
router.get('/courses/:courseId/students', adminAuth, getCourseStudents);

// Payment management routes
router.get('/payments', adminAuth, getPaymentTransactions);
router.get('/withdrawals', adminAuth, getWithdrawalRequests);
router.put('/withdrawals/approve/:id', adminAuth, approveWithdrawal);
router.put('/withdrawals/reject/:id', adminAuth, rejectWithdrawal);
router.get('/payments/report', adminAuth, generatePaymentReport);

// User by ID route - MUST be last to catch specific IDs
router.get("/:id", getUserById);

export default router;
