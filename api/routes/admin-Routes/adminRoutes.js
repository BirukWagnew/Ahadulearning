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

router.post("/pending-instructors", adminAuth, listPendingInstructors); // Changed from GET to POST

router.post("/active-instructors", adminAuth, listActiveInstructors); // Changed from GET to POST

router.post("/all-users", adminAuth, listAllUsers); // Changed from GET to POST
router.post("/role/:role", adminAuth, getUsersByRole); // Changed from GET to POST
router.put("/block/:id", adminAuth, blockUser);
router.put("/unblock/:id", adminAuth, unblockUser);
router.delete("/delete/:id", adminAuth, deleteUser);
router.post("/:id", getUserById); // Changed from GET to POST

router.get('/courses', adminAuth, getAllCoursesAdmin);
router.delete('/courses/:id', adminAuth, deleteCourseAdmin);

// Payment management routes
router.get('/payments', adminAuth, getPaymentTransactions);
router.get('/withdrawals', adminAuth, getWithdrawalRequests);
router.put('/withdrawals/approve/:id', adminAuth, approveWithdrawal);
router.put('/withdrawals/reject/:id', adminAuth, rejectWithdrawal);
router.get('/payments/report', adminAuth, generatePaymentReport);

export default router;
