import express from 'express';
import { registerUser, loginUser ,logoutUser ,getMe } from '../controllers/authController.js';
import { uploadPDF } from '../middleware/uploadMiddleware.js';
import { protect } from '../middleware/authMiddleware.js'; // Import the JWT protection middleware

const router = express.Router();

// Apply the upload middleware to the register route
router.post('/register', uploadPDF.single('cv'), registerUser); // 'cv' is the name of the file field in the form
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/me', protect, getMe); // Changed from GET to POST

export default router;
