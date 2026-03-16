import express from 'express';
import { securitySimulator } from '../services/securitySimulator';
import { auditChain } from '../gateway/blockchain/mockChain';
import { securityMonitoringService } from '../gateway/services/securityMonitoringService';

const router = express.Router();

router.get('/blockchain', (req, res) => {
  const blocks = auditChain.getBlocks();
  const formattedBlocks = blocks.map(b => ({
    block_index: b.index,
    timestamp: b.timestamp,
    event_type: b.data.action,
    user: b.data.user_id,
    document_id: b.data.document_id,
    previous_hash: b.previous_hash,
    hash: b.current_hash
  }));
  res.json({ success: true, blockchain: formattedBlocks });
});

router.post('/simulate/jwt', (req, res) => {
  const result = securitySimulator.simulateJwtAttack(req.ip || '127.0.0.1');
  res.status(403).json(result); 
});

router.post('/simulate/api', (req, res) => {
  const result = securitySimulator.simulateApiInjection(req.ip || '127.0.0.1');
  res.status(400).json(result);
});

router.post('/simulate/escalation', (req, res) => {
  const result = securitySimulator.simulateEscalation(req.ip || '127.0.0.1');
  res.status(403).json(result);
});

router.post('/simulate/tamper', (req, res) => {
  const { documentId } = req.body;
  if (!documentId) {
    return res.status(400).json({ success: false, message: 'Document ID required to simulate tampering' });
  }
  try {
    const result = securitySimulator.simulateDocumentTamper(req.ip || '127.0.0.1', documentId);
    res.json(result);
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
});

router.get('/alerts', (req, res) => {
  res.json({ success: true, alerts: securityMonitoringService.getAlerts() });
});

export default router;
