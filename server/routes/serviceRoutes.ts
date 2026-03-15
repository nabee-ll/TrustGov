import { Router } from 'express';
import * as serviceController from '../controllers/serviceController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/health', serviceController.getHealth);
router.get('/stats', serviceController.getStats);

// Protected routes
router.get('/services', authenticateToken, serviceController.getServices);
router.get('/activity', authenticateToken, serviceController.getActivity);

export default router;
