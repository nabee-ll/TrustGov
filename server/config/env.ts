import 'dotenv/config';

const toBool = (value: string | undefined, fallback: boolean) => {
  if (!value) return fallback;
  return value.toLowerCase() === 'true';
};

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 3000),
  JWT_SECRET: process.env.JWT_SECRET || 'gov-secure-secret-key-123',
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY || '15m',
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  FORCE_HTTPS: toBool(process.env.FORCE_HTTPS, false),
};

export const assertCriticalEnv = () => {
  if (env.NODE_ENV === 'production' && env.JWT_SECRET === 'gov-secure-secret-key-123') {
    throw new Error('JWT_SECRET must be set to a strong secret in production.');
  }
};
