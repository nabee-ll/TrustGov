import { randomUUID } from 'crypto';
import type { SecurityAlert } from '../models/types';

const failedLoginsByIp = new Map<string, number[]>();
const modificationsByUser = new Map<string, number[]>();
const blockedUsers = new Map<string, number>();
const blockedSessions = new Set<string>();
const alerts: SecurityAlert[] = [];
let globalUnderAttack = false;

const now = () => Date.now();

const prune = (timestamps: number[], windowMs: number) => timestamps.filter((t) => now() - t <= windowMs);

const addAlert = (alert: Omit<SecurityAlert, 'id' | 'createdAt'>) => {
  alerts.unshift({
    id: randomUUID(),
    createdAt: now(),
    ...alert,
  });
};

export const securityMonitoringService = {
  logFailedLogin(ip: string, userId?: string) {
    const current = failedLoginsByIp.get(ip) ?? [];
    const updated = prune([...current, now()], 60 * 1000);
    failedLoginsByIp.set(ip, updated);

    if (updated.length > 10) {
      if (userId) blockedUsers.set(userId, now() + 15 * 60 * 1000);
      addAlert({
        userId,
        ip,
        type: 'FAILED_LOGIN_SPIKE',
        message: 'More than 10 failed login attempts detected in 1 minute.',
      });
      return true;
    }
    return false;
  },

  logModification(userId: string, ip: string) {
    const current = modificationsByUser.get(userId) ?? [];
    const updated = prune([...current, now()], 60 * 1000);
    modificationsByUser.set(userId, updated);

    if (updated.length > 20) {
      blockedUsers.set(userId, now() + 15 * 60 * 1000);
      addAlert({
        userId,
        ip,
        type: 'HIGH_MODIFICATION_RATE',
        message: 'More than 20 document modifications in 1 minute.',
      });
      return true;
    }
    return false;
  },

  flagUnregisteredDevice(userId: string, ip: string) {
    blockedUsers.set(userId, now() + 10 * 60 * 1000);
    addAlert({
      userId,
      ip,
      type: 'UNREGISTERED_DEVICE',
      message: 'Access attempted from unregistered device.',
    });
  },

  flagAttack(userId: string | undefined, ip: string, message: string) {
    globalUnderAttack = true;
    if (userId) blockedUsers.set(userId, now() + 15 * 60 * 1000);
    addAlert({
      userId,
      ip,
      type: 'ATTACK_ATTEMPT',
      message,
    });
  },

  clearAttackMode() {
    globalUnderAttack = false;
  },

  clearBlocks() {
    blockedUsers.clear();
    blockedSessions.clear();
  },

  resetSimulationState() {
    globalUnderAttack = false;
    blockedUsers.clear();
    blockedSessions.clear();
  },

  isSystemUnderAttack() {
    return globalUnderAttack;
  },

  blockSession(sessionId: string) {
    blockedSessions.add(sessionId);
  },

  isSessionBlocked(sessionId: string) {
    return blockedSessions.has(sessionId);
  },

  isUserBlocked(userId: string) {
    const blockedUntil = blockedUsers.get(userId);
    if (!blockedUntil) return false;
    if (blockedUntil < now()) {
      blockedUsers.delete(userId);
      return false;
    }
    return true;
  },

  getAlerts() {
    return alerts.slice(0, 100);
  },
};
