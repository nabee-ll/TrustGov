import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/register', authController.register);
router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/verify-firebase-phone', authController.verifyFirebasePhone);
router.post('/refresh', authController.refreshSession);
router.get('/me', authenticateToken, authController.me);
router.post('/logout', authController.logout);

export default router;
