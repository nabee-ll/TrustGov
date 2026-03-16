import crypto from 'crypto';

const revokedTokenHashes = new Map<string, number>();

const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

export const tokenRevocationService = {
  revokeToken: (token: string, ttlMs = 7 * 24 * 60 * 60 * 1000) => {
    revokedTokenHashes.set(hashToken(token), Date.now() + ttlMs);
  },

  isRevoked: (token: string) => {
    const key = hashToken(token);
    const expiresAt = revokedTokenHashes.get(key);
    if (!expiresAt) return false;
    if (expiresAt < Date.now()) {
      revokedTokenHashes.delete(key);
      return false;
    }
    return true;
  },

  getRevocationCount: () => {
    // Cleanup expired entries
    const now = Date.now();
    for (const [key, expiresAt] of revokedTokenHashes.entries()) {
      if (expiresAt < now) {
        revokedTokenHashes.delete(key);
      }
    }
    return revokedTokenHashes.size;
  },
};
