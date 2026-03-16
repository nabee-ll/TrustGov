import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { loginRateLimiter } from '../middleware/rateLimiter';
import { requireFields } from '../middleware/requestValidator';

const router = Router();

router.post('/register', requireFields(['name', 'email', 'phone', 'password']), authController.register);
router.post('/send-otp', loginRateLimiter, requireFields(['loginMethod', 'identifier']), authController.sendOtp);
router.post('/verify-otp', loginRateLimiter, requireFields(['loginMethod', 'identifier', 'otp']), authController.verifyOtp);
router.post('/verify-firebase-phone', loginRateLimiter, requireFields(['idToken']), authController.verifyFirebasePhone);
router.post('/refresh', authController.refreshSession);
router.get('/me', authenticateToken, authController.me);
router.post('/logout', authController.logout);

export default router;
