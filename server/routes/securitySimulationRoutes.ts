import express from 'express';
import { securitySimulator } from '../services/securitySimulator';
import { auditChain } from '../gateway/blockchain/mockChain';
import { securityMonitoringService } from '../gateway/services/securityMonitoringService';
import { securityAlertEmitter, attackSimulator } from '../services/securityAttackSimulator';

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

router.post('/simulate/start', (req, res) => {
  attackSimulator.start(true); // pass true to force start even if DEMO_MODE=false
  res.json({ success: true, message: 'Attack simulator started' });
});

router.post('/simulate/stop', (req, res) => {
  attackSimulator.stop();
  res.json({ success: true, message: 'Attack simulator stopped' });
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

router.get('/alerts-stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const listener = (data: any) => {
    res.write(`event: SECURITY_ALERT\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  securityAlertEmitter.on('SECURITY_ALERT', listener);

  req.on('close', () => {
    securityAlertEmitter.off('SECURITY_ALERT', listener);
  });
});

export default router;
