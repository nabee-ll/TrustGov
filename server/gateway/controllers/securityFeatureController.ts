import type { Request, Response } from 'express';
import { securityMonitoringService } from '../services/securityMonitoringService';
import { riskEngine } from '../../services/riskEngine';

export const getSecurityFeatures = (_req: Request, res: Response) => {
  return res.json({
    success: true,
    features: [
      {
        id: 'jwt-binding',
        name: 'JWT Session & Device Binding',
        description: 'Every login creates a unique session with device fingerprinting. Device mismatch triggers security alerts.',
        status: 'ACTIVE',
        implementation: 'authMiddleware.ts',
        testable: true,
        test_command: 'Login → Check token payload for device_id, session_id'
      },
      {
        id: 'token-revocation',
        name: 'Token Revocation Service',
        description: 'Instantly revoke compromised tokens. Revoked tokens are rejected even if cryptographically valid.',
        status: 'ACTIVE',
        implementation: 'tokenRevocationService.ts',
        test_command: 'Logout → Token added to revocation blacklist → Subsequent requests rejected'
      },
      {
        id: 'risk-scoring',
        name: 'AI Risk Engine',
        description: 'Scores device anomalies (30pts), request frequency spikes (40pts), failed login attempts (50pts). Thresholds: Block ≥70, Require Re-auth ≥30.',
        status: 'ACTIVE',
        implementation: 'riskEngine.ts',
        risk_levels: ['ALLOW (0-29)', 'REAUTH (30-69)', 'BLOCK (70+)'],
        test_command: 'Failed login 3x → risk score increases → requests get blocked'
      },
      {
        id: 'rate-limiting',
        name: 'Rate Limiting & Throttling',
        description: 'Sliding window rate limiters: 5 login attempts/min, 100 document operations/min per user.',
        status: 'ACTIVE',
        implementation: 'rateLimiter.ts',
        limits: {
          login: '5 attempts per 60 seconds',
          documents: '100 operations per 60 seconds'
        },
        test_command: 'Spam login attempts → 429 Too Many Requests after 5 tries'
      },
      {
        id: 'security-headers',
        name: 'Security Headers & CORS',
        description: 'Content Security Policy (CSP), X-Frame-Options, X-Content-Type-Options, HSTS, and strict CORS configuration.',
        status: 'ACTIVE',
        implementation: 'securityHeaders.ts',
        headers: [
          'Content-Security-Policy: Prevents XSS attacks',
          'X-Frame-Options: DENY (prevents clickjacking)',
          'X-Content-Type-Options: nosniff (prevents MIME type sniffing)',
          'Strict-Transport-Security: Forces HTTPS'
        ],
        test_command: 'Check browser DevTools → Network → Response Headers'
      },
      {
        id: 'request-validation',
        name: 'Input Validation & Sanitization',
        description: 'All requests validated for required fields, types, and length. Prevents injection attacks.',
        status: 'ACTIVE',
        implementation: 'requestValidator.ts',
        test_command: 'Send malformed JSON → 400 Bad Request with validation errors'
      },
      {
        id: 'security-monitoring',
        name: 'Real-time Security Monitoring',
        description: 'Tracks suspicious activities: failed logins, device mismatches, unusual request patterns. Triggers auto-lockout at thresholds.',
        status: 'ACTIVE',
        implementation: 'securityMonitor.ts',
        active_alerts: securityMonitoringService.getAlerts().length,
        test_command: 'Multiple failed logins → Account locked automatically'
      },
      {
        id: 'async-event-queue',
        name: 'Async Security Event Queue',
        description: 'Non-blocking background worker that logs all security events to database and blockchain. Does not slow down requests.',
        status: 'ACTIVE',
        implementation: 'securityEventQueue.ts',
        test_command: 'Login → Event queued asynchronously → Check /api/gateway/blockchain/blocks'
      },
      {
        id: 'blockchain-integrity',
        name: 'Blockchain Audit Trail',
        description: 'All security events cryptographically linked in a blockchain. Tamper attempts detected immediately.',
        status: 'ACTIVE',
        implementation: 'integrityService.ts + mockChain.ts',
        test_command: 'Query /api/gateway/blockchain/blocks → See merkle-linked audit trail'
      },
      {
        id: 'device-fingerprint',
        name: 'Device Anomaly Detection',
        description: 'Fingerprints device characteristics (OS, browser, IP). Flags new/unknown devices for additional verification.',
        status: 'ACTIVE',
        test_command: 'Login from new device → Risk engine detects new device (30pts) → Logs security event'
      }
    ],
    quick_start: {
      view_alerts: 'GET /api/gateway/security/alerts',
      view_blockchain: 'GET /api/gateway/blockchain/blocks',
      demo_attack: 'POST /api/auth/login 5 times with wrong password → rate limit + risk flag'
    }
  });
};
