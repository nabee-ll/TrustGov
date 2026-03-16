import express from 'express';
import { loginStep1, loginStep2, portalAccess } from '../controllers/authGatewayController';
import {
  accessDocument,
  createDocument,
  documentHistory,
  modifyDocument,
} from '../controllers/documentGatewayController';
import { getBlockchainExplorer, getSecurityDashboard } from '../controllers/securityGatewayController';
import { getSecurityFeatures } from '../controllers/securityFeatureController';
import { authenticateGateway } from '../middleware/authenticateGateway';
import { gatewayRateLimiter } from '../middleware/rateLimiter';

const router = express.Router();

router.use(gatewayRateLimiter);

router.post('/auth/login-step1', loginStep1);
router.post('/auth/login-step2', loginStep2);

router.get('/portal/access', authenticateGateway, portalAccess);

router.post('/documents', authenticateGateway, createDocument);
router.put('/documents/:id', authenticateGateway, modifyDocument);
router.get('/documents/:id', authenticateGateway, accessDocument);
router.get('/documents/:id/history', authenticateGateway, documentHistory);

router.get('/blockchain/blocks', getBlockchainExplorer);
router.get('/security/alerts', getSecurityDashboard);
router.get('/security/features', getSecurityFeatures);

export default router;
