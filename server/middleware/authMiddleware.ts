import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';
import { tokenRevocationService } from '../services/tokenRevocationService';
import { securityMonitor } from '../services/securityMonitor';
import { riskEngine } from '../services/riskEngine';
import { securityEventQueue } from '../services/securityEventQueue';

interface AuthClaims {
  userId?: string;
  user_id?: string;
  role?: string;
  device_id?: string;
  session_id?: string;
  issued_at?: number;
  expiry?: number;
  iat?: number;
  exp?: number;
}

const resolveToken = (req: Request) => {
  const authHeader = req.headers.authorization;
  return req.cookies?.access_token || (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined);
};

const getDeviceId = (req: Request) => {
  const explicit = req.headers['x-device-id'];
  if (typeof explicit === 'string' && explicit.trim()) return explicit.trim();
  const ua = req.headers['user-agent'] || 'unknown';
  return crypto.createHash('sha256').update(String(ua)).digest('hex').slice(0, 16);
};

export const validateJwt = (req: Request, res: Response, next: NextFunction) => {
  const token = resolveToken(req);

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  if (tokenRevocationService.isRevoked(token)) {
    return res.status(401).json({ success: false, message: 'Token has been revoked.' });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthClaims;

    const userId = decoded.userId || decoded.user_id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Invalid token payload.' });
    }

    if (decoded.session_id && securityMonitor.isSessionBlocked(decoded.session_id)) {
      return res.status(401).json({ success: false, message: 'Session blocked due to suspicious activity.' });
    }

    if (securityMonitor.isUserBlocked(userId)) {
      return res.status(401).json({ success: false, message: 'User blocked due to suspicious activity.' });
    }

    const requestDeviceId = getDeviceId(req);
    const tokenDeviceId = decoded.device_id;

    const risk = riskEngine.evaluate({
      unknownDevice: Boolean(tokenDeviceId && requestDeviceId !== tokenDeviceId),
      highRequestFrequency: securityMonitor.isHighRequestFrequency(userId),
      multipleFailedLogins: securityMonitor.hasMultipleFailedLogins(userId),
    });

    if (risk.level === 'block') {
      if (decoded.session_id) securityMonitor.blockSession(decoded.session_id);
      securityMonitor.flagUser(userId);
      securityEventQueue.enqueue({
        type: 'ATTACK_ATTEMPT',
        userId,
        ip: req.ip,
        details: { riskScore: risk.score, reason: 'risk_engine_block' },
      });
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (risk.level === 'reauth') {
      return res.status(401).json({ success: false, message: 'Re-authentication required.' });
    }

    securityMonitor.logRequest(userId);
    (req as any).user = {
      ...decoded,
      userId,
      device_id: tokenDeviceId,
      session_id: decoded.session_id,
      risk_score: risk.score,
    };

    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

export const requireRoles = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = (req as any).user?.role as string | undefined;
    if (!role || !roles.includes(role)) {
      return res.status(403).json({ success: false, message: 'Access denied for this role.' });
    }
    next();
  };
};
