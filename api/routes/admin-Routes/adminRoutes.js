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
router.put("/block/:id", blockUser);
router.put("/unblock/:id", unblockUser);
router.delete("/delete/:id", adminAuth, deleteUser);
router.post("/:id", getUserById); // Changed from GET to POST

export default router;
