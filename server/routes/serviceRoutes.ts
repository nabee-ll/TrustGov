import { Router } from 'express';
import * as serviceController from '../controllers/serviceController';
import { authenticateToken } from '../middleware/auth';
import { documentRateLimiter } from '../middleware/rateLimiter';
import { requireFields } from '../middleware/requestValidator';

const router = Router();

// Public routes
router.get('/health', serviceController.getHealth);
router.get('/stats', serviceController.getStats);

// Protected routes
router.get('/services', authenticateToken, documentRateLimiter, serviceController.getServices);
router.get('/activity', authenticateToken, documentRateLimiter, serviceController.getActivity);
router.post('/request-service', authenticateToken, documentRateLimiter, requireFields(['serviceId']), serviceController.requestService);

export default router;
