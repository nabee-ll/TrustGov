import type { Request, Response } from 'express';
import { auditChain } from '../blockchain/mockChain';
import { securityMonitoringService } from '../services/securityMonitoringService';

export const getBlockchainExplorer = (_req: Request, res: Response) => {
  return res.json({
    success: true,
    integrity_ok: auditChain.verifyIntegrity(),
    blocks: auditChain.getBlocks(),
  });
};

export const getSecurityDashboard = (_req: Request, res: Response) => {
  return res.json({
    success: true,
    alerts: securityMonitoringService.getAlerts(),
  });
};
