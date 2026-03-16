import { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';

export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  if (env.FORCE_HTTPS && req.headers['x-forwarded-proto'] !== 'https' && env.NODE_ENV === 'production') {
    return res.status(403).json({ success: false, message: 'HTTPS is required.' });
  }

  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; connect-src 'self' http: https: ws: wss:; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline';");
  next();
};

export const corsConfig = (req: Request, res: Response, next: NextFunction) => {
  const origin = env.CORS_ORIGIN;
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Device-Id');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
};
