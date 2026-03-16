import type { Response } from 'express';
import { documentService } from '../services/documentService';
import { securityMonitoringService } from '../services/securityMonitoringService';
import { auditChain } from '../blockchain/mockChain';
import type { GatewayRequest } from '../middleware/authenticateGateway';

const getIp = (req: GatewayRequest) => (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || 'unknown';

export const createDocument = (req: GatewayRequest, res: Response) => {
  const user = req.gatewayUser;
  if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

  const { title, content, owner_user_id, department } = req.body as {
    title?: string;
    content?: string;
    owner_user_id?: string;
    department?: string;
  };

  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'title and content are required.' });
  }

  try {
    const doc = documentService.createDocument({
      title,
      content,
      ownerUserId: owner_user_id || user.userId,
      department,
      actorUserId: user.userId,
    });
    return res.status(201).json({ success: true, document: doc });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Create failed';
    return res.status(403).json({ success: false, message });
  }
};

export const modifyDocument = (req: GatewayRequest, res: Response) => {
  const user = req.gatewayUser;
  if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

  const { id } = req.params;
  const { content } = req.body as { content?: string };
  if (!content) {
    return res.status(400).json({ success: false, message: 'content is required.' });
  }

  const ip = getIp(req);

  // Zero Trust gate: identity, device, role, permission are checked before modify
  try {
    const tooManyModifications = securityMonitoringService.logModification(user.userId, ip);
    if (tooManyModifications) {
      securityMonitoringService.blockSession(user.sessionId);
      auditChain.addBlock({
        action: 'ATTACK_ATTEMPT',
        user_id: user.userId,
        ip_address: ip,
        attempt_type: 'HIGH_MODIFICATION_RATE',
        timestamp: new Date().toISOString(),
      });
      return res.status(403).json({ success: false, message: 'Session blocked due to suspicious activity.' });
    }

    const doc = documentService.modifyDocument({
      documentId: id,
      content,
      actorUserId: user.userId,
    });
    return res.json({ success: true, document: doc });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Modify failed';
    if (message.includes('Permission denied')) {
      auditChain.addBlock({
        action: 'ATTACK_ATTEMPT',
        user_id: user.userId,
        ip_address: ip,
        attempt_type: 'MODIFY_ATTEMPT_DENIED',
        timestamp: new Date().toISOString(),
      });
      securityMonitoringService.flagAttack(user.userId, ip, 'Unauthorized document modification attempt denied.');
    }
    return res.status(403).json({ success: false, message });
  }
};

export const accessDocument = (req: GatewayRequest, res: Response) => {
  const user = req.gatewayUser;
  if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

  const { id } = req.params;

  try {
    const doc = documentService.accessDocument({ documentId: id, actorUserId: user.userId });
    return res.json({ success: true, document: doc });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Access failed';
    return res.status(403).json({ success: false, message });
  }
};

export const documentHistory = (req: GatewayRequest, res: Response) => {
  const user = req.gatewayUser;
  if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

  const { id } = req.params;

  try {
    const history = documentService.listHistory(id);
    return res.json({ success: true, history });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'History retrieval failed';
    return res.status(404).json({ success: false, message });
  }
};
