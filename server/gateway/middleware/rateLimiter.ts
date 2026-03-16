import type { NextFunction, Request, Response } from 'express';

const requestsByIp = new Map<string, number[]>();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 120;

const now = () => Date.now();

export const gatewayRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || 'unknown';
  const entries = requestsByIp.get(ip) ?? [];
  const valid = entries.filter((ts) => now() - ts <= WINDOW_MS);
  valid.push(now());
  requestsByIp.set(ip, valid);

  if (valid.length > MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      message: 'API rate limit exceeded. Try again shortly.',
    });
  }

  next();
};
