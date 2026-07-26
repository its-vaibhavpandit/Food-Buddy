import { Router } from 'express';
import {
  createPaymentOrder,
  verifyPaymentSignature,
  handlePaymentFailure,
  processRefund,
} from '../controllers/payment.controller.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.post('/create-order', createPaymentOrder);
router.post('/verify-signature', verifyPaymentSignature);
router.post('/failure', handlePaymentFailure);
router.post('/refund', restrictTo('admin'), processRefund);

export default router;
