 import express from 'express';
import { generateCertificateForStudent } from '../../controllers/certificateController/certificateController.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = express.Router();

 router.get('/generate-certificate/:studentId/:courseId', protect, generateCertificateForStudent);

export default router;
