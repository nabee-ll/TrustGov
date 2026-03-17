interface UserSignalState {
  failedLogins: number[];
  requestTimestamps: number[];
  blockedUntil?: number;
  knownDevices: Set<string>;
  flagged: boolean;
}

const userSignals = new Map<string, UserSignalState>();
const sessionBlocks = new Map<string, number>();

const now = () => Date.now();

const getOrCreate = (userId: string) => {
  let state = userSignals.get(userId);
  if (!state) {
    state = {
      failedLogins: [],
      requestTimestamps: [],
      knownDevices: new Set<string>(),
      flagged: false,
    };
    userSignals.set(userId, state);
  }
  return state;
};

const inWindow = (timestamps: number[], windowMs: number) => timestamps.filter((x) => now() - x <= windowMs);

export const securityMonitor = {
  logFailedLogin(userId: string) {
    const state = getOrCreate(userId);
    state.failedLogins = inWindow([...state.failedLogins, now()], 60 * 1000);
    return state.failedLogins.length;
  },

  logRequest(userId: string) {
    const state = getOrCreate(userId);
    state.requestTimestamps = inWindow([...state.requestTimestamps, now()], 60 * 1000);
    return state.requestTimestamps.length;
  },

  isHighRequestFrequency(userId: string) {
    const state = getOrCreate(userId);
    state.requestTimestamps = inWindow(state.requestTimestamps, 60 * 1000);
    return state.requestTimestamps.length > 100;
  },

  hasMultipleFailedLogins(userId: string) {
    const state = getOrCreate(userId);
    state.failedLogins = inWindow(state.failedLogins, 60 * 1000);
    return state.failedLogins.length > 10;
  },

  isUnknownDevice(userId: string, deviceId: string) {
    const state = getOrCreate(userId);
    return !state.knownDevices.has(deviceId);
  },

  registerDevice(userId: string, deviceId: string) {
    const state = getOrCreate(userId);
    state.knownDevices.add(deviceId);
  },

  blockSession(sessionId: string, durationMs = 15 * 60 * 1000) {
    sessionBlocks.set(sessionId, now() + durationMs);
  },

  isSessionBlocked(sessionId: string) {
    const blockedUntil = sessionBlocks.get(sessionId);
    if (!blockedUntil) return false;
    if (blockedUntil < now()) {
      sessionBlocks.delete(sessionId);
      return false;
    }
    return true;
  },

  flagUser(userId: string) {
    const state = getOrCreate(userId);
    state.flagged = true;
    state.blockedUntil = now() + 15 * 60 * 1000;
  },

  isUserBlocked(userId: string) {
    const state = getOrCreate(userId);
    if (!state.blockedUntil) return false;
    if (state.blockedUntil < now()) {
      state.blockedUntil = undefined;
      return false;
    }
    return true;
  },

  resetAllBlocks() {
    sessionBlocks.clear();
    userSignals.forEach((state) => {
      state.blockedUntil = undefined;
      state.flagged = false;
    });
  },
};
