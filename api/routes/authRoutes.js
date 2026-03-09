import express from 'express';
import { registerUser, loginUser ,logoutUser ,getMe } from '../controllers/authController.js';
import { uploadPDF } from '../middleware/uploadMiddleware.js';
import { protect } from '../middleware/authMiddleware.js'; // Import the JWT protection middleware

const router = express.Router();

// Multer error handler
const handleMulterError = (err, req, res, next) => {
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

// Apply the upload middleware to the register route
router.post('/register', uploadPDF.single('cv'), handleMulterError, registerUser); // 'cv' is the name of the file field in the form
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/me', protect, getMe); // Changed from GET to POST

export default router;
