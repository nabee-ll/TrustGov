import { NextFunction, Request, Response } from 'express';

interface Bucket {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, Bucket>();

const makeLimiter = (name: string, limit: number, windowMs: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${name}:${req.ip}:${(req as any).user?.userId || 'anon'}`;
    const now = Date.now();
    const current = buckets.get(key);

    if (!current || now - current.windowStart > windowMs) {
      buckets.set(key, { count: 1, windowStart: now });
      return next();
    }

    current.count += 1;
    buckets.set(key, current);

    if (current.count > limit) {
      return res.status(429).json({ success: false, message: 'Too many requests. Please slow down.' });
    }

    next();
  };
};

export const loginRateLimiter = makeLimiter('login', 5, 60 * 1000);
export const documentRateLimiter = makeLimiter('document', 100, 60 * 1000);
