import { randomInt } from 'crypto';
import type { Request, Response } from 'express';
import { passwordService } from '../auth/passwordService';
import { tokenService } from '../auth/tokenService';
import { userStore } from '../services/userStore';
import { securityMonitoringService } from '../services/securityMonitoringService';
import { auditChain } from '../blockchain/mockChain';

const getIp = (req: Request) => (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || 'unknown';

export const loginStep1 = async (req: Request, res: Response) => {
  const { username, password, device_id } = req.body as {
    username?: string;
    password?: string;
    device_id?: string;
  };

  if (!username || !password || !device_id) {
    return res.status(400).json({ success: false, message: 'username, password, and device_id are required.' });
  }

  const user = userStore.findByUsername(username);
  const ip = getIp(req);

  if (!user) {
    securityMonitoringService.logFailedLogin(ip);
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  if (securityMonitoringService.isUserBlocked(user.userId)) {
    return res.status(403).json({ success: false, message: 'User is temporarily blocked by policy.' });
  }

  const ok = await passwordService.verify(password, user.passwordHash);
  if (!ok) {
    const blocked = securityMonitoringService.logFailedLogin(ip, user.userId);
    if (blocked) {
      auditChain.addBlock({
        action: 'ATTACK_ATTEMPT',
        user_id: user.userId,
        ip_address: ip,
        attempt_type: 'FAILED_LOGIN_SPIKE',
        timestamp: new Date().toISOString(),
      });
    }
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const otp = String(randomInt(100000, 999999));
  const challengeId = userStore.createLoginChallenge(user.userId, device_id, otp);

  return res.json({
    success: true,
    message: 'Password verified. Complete MFA with OTP.',
    challenge_id: challengeId,
    debug_otp: process.env.NODE_ENV === 'production' ? undefined : otp,
  });
};

export const loginStep2 = (req: Request, res: Response) => {
  const { challenge_id, otp, device_id } = req.body as {
    challenge_id?: string;
    otp?: string;
    device_id?: string;
  };

  if (!challenge_id || !otp || !device_id) {
    return res.status(400).json({ success: false, message: 'challenge_id, otp, and device_id are required.' });
  }

  const challenge = userStore.getLoginChallenge(challenge_id);
  if (!challenge || challenge.expiresAt < Date.now()) {
    return res.status(401).json({ success: false, message: 'MFA challenge expired or invalid.' });
  }

  const user = userStore.findById(challenge.userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  const ip = getIp(req);

  if (challenge.deviceId !== device_id) {
    securityMonitoringService.flagUnregisteredDevice(user.userId, ip);
    securityMonitoringService.blockSession(`${user.userId}:${device_id}`);
    auditChain.addBlock({
      action: 'ATTACK_ATTEMPT',
      user_id: user.userId,
      ip_address: ip,
      attempt_type: 'DEVICE_MISMATCH_DURING_MFA',
      timestamp: new Date().toISOString(),
    });
    return res.status(403).json({ success: false, message: 'Unregistered or changed device detected.' });
  }

  if (challenge.otp !== otp) {
    securityMonitoringService.logFailedLogin(ip, user.userId);
    return res.status(401).json({ success: false, message: 'Invalid OTP.' });
  }

  userStore.consumeLoginChallenge(challenge_id);
  userStore.registerDeviceIfMissing(user.userId, device_id);

  const token = tokenService.sign({
    user_id: user.userId,
    role: user.role,
    device_id,
  });

  return res.json({
    success: true,
    token,
    user: {
      user_id: user.userId,
      role: user.role,
      device_id,
    },
  });
};

export const portalAccess = (req: Request, res: Response) => {
  return res.json({
    success: true,
    message: 'Access granted through TrustGov API Gateway.',
  });
};
