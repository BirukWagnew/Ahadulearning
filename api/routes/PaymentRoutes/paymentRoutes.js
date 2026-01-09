import express from 'express';
import { initiatePayment, chapaWebhook ,verifyPayment,generateReceipt, getTransactions } from '../../controllers/paymentController/paymentController.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.get('/transactions', protect, getTransactions);
router.post('/initiate', protect, initiatePayment);
router.post('/webhook', express.raw({ type: 'application/json' }), chapaWebhook);
router.get('/verify-payment/:tx_ref', verifyPayment);
router.get('/receipt/:tx_ref', protect, generateReceipt);

export default router;