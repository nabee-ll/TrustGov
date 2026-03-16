import type { NextFunction, Request, Response } from 'express';
import { tokenService } from '../auth/tokenService';
import { userStore } from '../services/userStore';
import { securityMonitoringService } from '../services/securityMonitoringService';

export interface GatewayRequest extends Request {
  gatewayUser?: {
    userId: string;
    role: string;
    deviceId: string;
    sessionId: string;
  };
}

export const authenticateGateway = (req: GatewayRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  if (!token) {
    return res.status(401).json({ success: false, message: 'Missing bearer token' });
  }

  try {
    const claims = tokenService.verify(token);
    const user = userStore.findById(claims.user_id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    if (securityMonitoringService.isUserBlocked(user.userId)) {
      return res.status(403).json({ success: false, message: 'User is temporarily blocked by monitoring policy.' });
    }

    const sessionId = `${claims.user_id}:${claims.device_id}`;
    if (securityMonitoringService.isSessionBlocked(sessionId)) {
      return res.status(403).json({ success: false, message: 'Session blocked due to suspicious activity.' });
    }

    req.gatewayUser = {
      userId: claims.user_id,
      role: claims.role,
      deviceId: claims.device_id,
      sessionId,
    };

    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
