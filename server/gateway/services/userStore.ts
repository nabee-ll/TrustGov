import { randomUUID } from 'crypto';
import type { GatewayUser, LoginChallenge } from '../models/types';
import { passwordService } from '../auth/passwordService';

const users = new Map<string, GatewayUser>();
const usersByUsername = new Map<string, string>();
const loginChallenges = new Map<string, LoginChallenge>();

const seedUsers = async () => {
  if (users.size > 0) return;

  const seed = [
    { userId: 'CIT-1001', username: 'citizen1', password: 'Password@123', role: 'Citizen', department: 'Public', personalDocIds: [], registeredDevices: ['device-citizen-1'] },
    { userId: 'OFF-2001', username: 'officer1', password: 'Password@123', role: 'Officer', department: 'Revenue', personalDocIds: [], registeredDevices: ['device-officer-1'] },
    { userId: 'AUD-3001', username: 'auditor1', password: 'Password@123', role: 'Auditor', department: 'Audit', personalDocIds: [], registeredDevices: ['device-auditor-1'] },
    { userId: 'ADM-9001', username: 'admin1', password: 'Password@123', role: 'Admin', department: 'Core', personalDocIds: [], registeredDevices: ['device-admin-1'] },
  ] as const;

  for (const item of seed) {
    const passwordHash = await passwordService.hash(item.password);
    const user: GatewayUser = {
      userId: item.userId,
      username: item.username,
      passwordHash,
      role: item.role,
      department: item.department,
      personalDocIds: [...item.personalDocIds],
      registeredDevices: [...item.registeredDevices],
    };
    users.set(item.userId, user);
    usersByUsername.set(item.username, item.userId);
  }
};

void seedUsers();

export const userStore = {
  findByUsername: (username: string) => {
    const userId = usersByUsername.get(username);
    if (!userId) return undefined;
    return users.get(userId);
  },

  findById: (userId: string) => users.get(userId),

  update: (user: GatewayUser) => users.set(user.userId, user),

  createLoginChallenge: (userId: string, deviceId: string, otp: string, ttlMs = 5 * 60 * 1000) => {
    const challengeId = randomUUID();
    loginChallenges.set(challengeId, {
      challengeId,
      userId,
      deviceId,
      otp,
      expiresAt: Date.now() + ttlMs,
    });
    return challengeId;
  },

  getLoginChallenge: (challengeId: string) => loginChallenges.get(challengeId),

  consumeLoginChallenge: (challengeId: string) => loginChallenges.delete(challengeId),

  registerDeviceIfMissing: (userId: string, deviceId: string) => {
    const user = users.get(userId);
    if (!user) return;
    if (!user.registeredDevices.includes(deviceId)) {
      user.registeredDevices.push(deviceId);
      users.set(userId, user);
    }
  },
};
