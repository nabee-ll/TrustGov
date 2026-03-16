import jwt from 'jsonwebtoken';
import type { JwtClaims } from '../models/types';

const JWT_SECRET = process.env.JWT_SECRET || 'gov-secure-secret-key-123';
const JWT_TTL = (process.env.GATEWAY_JWT_TTL || '15m') as jwt.SignOptions['expiresIn'];

export const tokenService = {
  sign: (claims: JwtClaims) => jwt.sign(claims, JWT_SECRET, { expiresIn: JWT_TTL }),
  verify: (token: string) => jwt.verify(token, JWT_SECRET) as JwtClaims,
};
