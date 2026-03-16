import { auditChain } from '../gateway/blockchain/mockChain';
import { securityMonitoringService } from '../gateway/services/securityMonitoringService';
import { documentService } from '../gateway/services/documentService';
import crypto from 'crypto';

export const securitySimulator = {
  simulateJwtAttack(ip: string) {
    const event = 'TOKEN_TAMPER_ATTEMPT';
    auditChain.addBlock({
      document_id: 'N/A',
      action: event,
      user_id: 'unknown_attacker',
      previous_hash: 'N/A',
      new_hash: 'N/A',
      timestamp: new Date().toISOString(),
    });
    
    securityMonitoringService.flagAttack(undefined, ip, 'JWT Tampering Attempt — BLOCKED');
    return { success: true, message: 'JWT Tampering Attempt Blocked and Logged' };
  },

  simulateApiInjection(ip: string) {
    const event = 'API_ATTACK_ATTEMPT';
    auditChain.addBlock({
      document_id: 'N/A',
      action: event,
      user_id: 'unknown_attacker',
      previous_hash: 'N/A',
      new_hash: 'N/A',
      timestamp: new Date().toISOString(),
    });
    
    securityMonitoringService.flagAttack(undefined, ip, 'API Injection Attempt — BLOCKED');
    return { success: true, message: 'API Injection Attempt Blocked and Logged' };
  },

  simulateEscalation(ip: string, userId: string = 'citizen_user') {
    const event = 'PRIVILEGE_ESCALATION_ATTEMPT';
    auditChain.addBlock({
      document_id: 'N/A',
      action: event,
      user_id: userId,
      previous_hash: 'N/A',
      new_hash: 'N/A',
      timestamp: new Date().toISOString(),
    });
    
    securityMonitoringService.flagAttack(userId, ip, 'Privilege Escalation Attempt — BLOCKED');
    return { success: true, message: 'Privilege Escalation Attempt Blocked and Logged' };
  },

  simulateDocumentTamper(ip: string, documentId: string) {
    const doc = documentService.getDocument(documentId);
    if (!doc) {
      throw new Error('Document not found for tampering');
    }

    // Artificially modify the stored document directly in memory without updating the hash
    if (doc.versions.length > 0) {
      const latestVersion = doc.versions[doc.versions.length - 1];
      // Inject malicious content
      latestVersion.content = latestVersion.content + "\n\n[TAMPERED: BANK ACCOUNT CHANGED TO 1337-HACKER]";
    }

    return { 
      success: true, 
      message: 'Document tampered in storage. Next read will trigger integrity verification failure.' 
    };
  }
};
