import { EventEmitter } from 'events';
import { auditChain } from '../gateway/blockchain/mockChain';
import { documentService } from '../gateway/services/documentService';
import { securityMonitoringService } from '../gateway/services/securityMonitoringService';
import { securityMonitor } from './securityMonitor';

export const securityAlertEmitter = new EventEmitter();

const attackTypes = ['JWT', 'API', 'PRIVILEGE', 'TAMPER'];

class SecurityAttackSimulator {
  private timer: NodeJS.Timeout | null = null;
  private attackIndex = 0;

  start(forceManualStart = false) {
    if (this.timer) return;
    if (!forceManualStart && process.env.DEMO_MODE !== 'true') return;

    console.log('[Security Simulator] Automatic Attack Scheduler Started. Running every 25s.');
    this.simulateNextAttack();

    this.timer = setInterval(() => {
      this.simulateNextAttack();
    }, 25000);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    securityMonitoringService.resetSimulationState();
    securityMonitor.resetAllBlocks();

    securityAlertEmitter.emit('SECURITY_ALERT', {
      event_type: 'SIMULATION_STOPPED',
      severity: 'LOW',
      message: 'Attack simulation stopped. Services are restored.',
      action_taken: 'SERVICE_ACCESS_RESTORED',
    });

    console.log('[Security Simulator] Stopped and cleared all simulation blocks.');
  }

  simulateRandomAttack() {
    const type = attackTypes[Math.floor(Math.random() * attackTypes.length)];
    this.simulateAttack(type);
  }

  simulateNextAttack() {
    const type = attackTypes[this.attackIndex];
    this.simulateAttack(type);
    this.attackIndex = (this.attackIndex + 1) % attackTypes.length;
  }

  simulateAttack(type: string) {
    const ip = `192.168.1.${Math.floor(Math.random() * 255)}`;

    let eventType:
      | 'TOKEN_TAMPER_ATTEMPT'
      | 'API_ATTACK_ATTEMPT'
      | 'PRIVILEGE_ESCALATION_ATTEMPT'
      | 'DOCUMENT_TAMPER_DETECTED' = 'TOKEN_TAMPER_ATTEMPT';

    let msg = '';
    let actionTaken = '';

    if (type === 'JWT') {
      eventType = 'TOKEN_TAMPER_ATTEMPT';
      msg = 'JWT Token Tampering Attempt Detected';
      actionTaken = 'SESSION_BLOCKED';
      securityMonitoringService.blockSession('simulated_session_123');
    } else if (type === 'API') {
      eventType = 'API_ATTACK_ATTEMPT';
      msg = 'Malicious API payload detected';
      actionTaken = 'REQUEST_BLOCKED';
    } else if (type === 'PRIVILEGE') {
      eventType = 'PRIVILEGE_ESCALATION_ATTEMPT';
      msg = 'Unauthorized Privilege Escalation Request';
      actionTaken = 'ACCESS_DENIED';
    } else if (type === 'TAMPER') {
      eventType = 'DOCUMENT_TAMPER_DETECTED';
      msg = 'Document Integrity Check Failed';
      actionTaken = 'DOCUMENT_QUARANTINED';
      try {
        this.tamperRandomDocument();
      } catch {
        // Best-effort simulation only.
      }
    }

    const securityEvent = {
      event_type: eventType,
      user: 'attacker_simulation',
      severity: 'HIGH',
      action_taken: actionTaken,
      timestamp: Date.now(),
    };

    securityMonitoringService.flagAttack('attacker_simulation', ip, msg);

    auditChain.addBlock({
      document_id: 'N/A',
      action: eventType,
      user_id: 'attacker_simulation',
      previous_hash: 'N/A',
      new_hash: 'N/A',
      timestamp: new Date(securityEvent.timestamp).toISOString(),
    });

    securityAlertEmitter.emit('SECURITY_ALERT', {
      event_type: eventType,
      severity: 'HIGH',
      message: msg,
      action_taken: actionTaken,
    });

    console.log(`[Simulator] Executed ${type} attack simulation.`);
  }

  private tamperRandomDocument() {
    const service = documentService as any;
    if (typeof service.listDocuments !== 'function') return;

    const docs = service.listDocuments('citizen_user');
    if (!docs?.length) return;

    const doc = documentService.getDocument(docs[0].id);
    if (doc?.versions?.length) {
      doc.versions[doc.versions.length - 1].content += '\n\n[TAMPERED IN DEMO_MODE]';
    }
  }
}

export const attackSimulator = new SecurityAttackSimulator();