import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import admin from 'firebase-admin';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';
import { getCollection } from '../db/mongo';
import { tokenRevocationService } from '../services/tokenRevocationService';
import { securityMonitor } from '../services/securityMonitor';
import { securityEventQueue } from '../services/securityEventQueue';

const JWT_SECRET = process.env.JWT_SECRET || 'gov-secure-secret-key-123';
const ACCESS_TOKEN_EXPIRY = (process.env.ACCESS_TOKEN_EXPIRY || '15m') as SignOptions['expiresIn'];
const REFRESH_TOKEN_EXPIRY = (process.env.REFRESH_TOKEN_EXPIRY || '7d') as SignOptions['expiresIn'];
const OTP_EXPIRY_MS = 5 * 60 * 1000;
const BCRYPT_ROUNDS = 10;

const expiryToMs = (value: SignOptions['expiresIn'], fallbackMs: number) => {
  if (typeof value === 'number') return value * 1000;
  if (typeof value !== 'string') return fallbackMs;
  const match = value.match(/^(\d+)([smhd])$/i);
  if (!match) return fallbackMs;
  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  if (unit === 's') return amount * 1000;
  if (unit === 'm') return amount * 60 * 1000;
  if (unit === 'h') return amount * 60 * 60 * 1000;
  if (unit === 'd') return amount * 24 * 60 * 60 * 1000;
  return fallbackMs;
};

const resolveDeviceId = (req: Request) => {
  const explicit = req.headers['x-device-id'];
  if (typeof explicit === 'string' && explicit.trim()) return explicit.trim();
  const ua = req.headers['user-agent'] || 'unknown';
  return crypto.createHash('sha256').update(String(ua)).digest('hex').slice(0, 16);
};

// ── Rate-limit / lockout constants ────────────────────────────────────────────
const OTP_SEND_LIMIT = 3;           // max OTP sends per window
const OTP_SEND_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const OTP_FAIL_LIMIT = 5;           // wrong OTPs before lockout
const OTP_LOCKOUT_MS = 15 * 60 * 1000;     // 15-minute lockout
const IP_FAIL_LIMIT = 10;           // IP failures before block
const IP_FAIL_WINDOW_MS = 5 * 60 * 1000;   // 5-minute window
const IP_BLOCK_MS = 30 * 60 * 1000;        // 30-minute IP block

// ── In-memory stores (reset on server restart; replace with Redis for prod) ───
interface RateLimitEntry { count: number; windowStart: number; }
interface LockoutEntry   { failCount: number; lockedUntil: number; }
interface IpEntry        { count: number; windowStart: number; blockedUntil: number; }
interface DeviceEntry    { ip: string; userAgent: string; seenAt: number; }

const otpSendStore  = new Map<string, RateLimitEntry>(); // key: userId
const otpFailStore  = new Map<string, LockoutEntry>();   // key: userId
const ipStore       = new Map<string, IpEntry>();        // key: IP
const deviceStore   = new Map<string, DeviceEntry>();    // key: userId

let firebaseAppInitialized = false;

interface UserDocument {
  _id?: ObjectId;
  userId: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  createdAt: Date;
}

interface TokenRecordDocument {
  _id?: ObjectId;
  userId: string;
  sessionId: string;
  deviceId: string;
  tokenHash: string;
  tokenType: 'refresh';
  issuedAt: Date;
  expiresAt: Date;
  revoked: boolean;
}

interface OtpRecord {
  otp: string;
  expiresAt: number;
}

interface SecurityEventDocument {
  _id?: ObjectId;
  type: 'otp_rate_limited' | 'otp_lockout' | 'ip_blocked' | 'new_device_login';
  userId?: string;
  ip: string;
  userAgent: string;
  detail: string;
  occurredAt: Date;
}

const otpStore = new Map<string, OtpRecord>();

const usersCollection = () => getCollection<UserDocument>(process.env.USERS_COLLECTION || 'users');
const tokenRecordsCollection = () => getCollection<TokenRecordDocument>(process.env.TOKEN_RECORDS_COLLECTION || 'token_records');
const securityEventsCollection = () => getCollection<SecurityEventDocument>('security_events');

const logSecurityEvent = async (event: Omit<SecurityEventDocument, '_id' | 'occurredAt'>) => {
  securityEventQueue.enqueue({
    type: event.type,
    userId: event.userId,
    ip: event.ip,
    details: {
      userAgent: event.userAgent,
      detail: event.detail,
    },
  });
};

// ── Security helpers ──────────────────────────────────────────────────────────

const getClientIp = (req: Request): string =>
  (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || 'unknown';

/** Returns minutes remaining if blocked, 0 if allowed. */
const checkIpBlock = (ip: string): number => {
  const entry = ipStore.get(ip);
  if (!entry) return 0;
  if (entry.blockedUntil > Date.now()) {
    return Math.ceil((entry.blockedUntil - Date.now()) / 60000);
  }
  // window expired – reset
  if (Date.now() - entry.windowStart > IP_FAIL_WINDOW_MS) {
    ipStore.delete(ip);
    return 0;
  }
  return 0;
};

const recordIpFailure = (ip: string): boolean => {
  const now = Date.now();
  let entry = ipStore.get(ip) ?? { count: 0, windowStart: now, blockedUntil: 0 };
  if (now - entry.windowStart > IP_FAIL_WINDOW_MS) {
    entry = { count: 0, windowStart: now, blockedUntil: 0 };
  }
  entry.count += 1;
  if (entry.count >= IP_FAIL_LIMIT) {
    entry.blockedUntil = now + IP_BLOCK_MS;
  }
  ipStore.set(ip, entry);
  return entry.count >= IP_FAIL_LIMIT;
};

/** Returns minutes remaining if rate-limited, 0 if allowed. */
const checkOtpSendRate = (userId: string): number => {
  const now = Date.now();
  const entry = otpSendStore.get(userId);
  if (!entry) return 0;
  if (now - entry.windowStart > OTP_SEND_WINDOW_MS) {
    otpSendStore.delete(userId);
    return 0;
  }
  if (entry.count >= OTP_SEND_LIMIT) {
    return Math.ceil((entry.windowStart + OTP_SEND_WINDOW_MS - now) / 60000);
  }
  return 0;
};

const recordOtpSend = (userId: string) => {
  const now = Date.now();
  const entry = otpSendStore.get(userId) ?? { count: 0, windowStart: now };
  if (now - entry.windowStart > OTP_SEND_WINDOW_MS) {
    otpSendStore.set(userId, { count: 1, windowStart: now });
  } else {
    otpSendStore.set(userId, { count: entry.count + 1, windowStart: entry.windowStart });
  }
};

/** Returns minutes remaining if locked, 0 if allowed. */
const checkOtpLockout = (userId: string): number => {
  const entry = otpFailStore.get(userId);
  if (!entry) return 0;
  if (entry.lockedUntil > Date.now()) {
    return Math.ceil((entry.lockedUntil - Date.now()) / 60000);
  }
  return 0;
};

const recordOtpFailure = (userId: string) => {
  const entry = otpFailStore.get(userId) ?? { failCount: 0, lockedUntil: 0 };
  entry.failCount += 1;
  if (entry.failCount >= OTP_FAIL_LIMIT) {
    entry.lockedUntil = Date.now() + OTP_LOCKOUT_MS;
  }
  otpFailStore.set(userId, entry);
};

const clearOtpFailures = (userId: string) => otpFailStore.delete(userId);

const ensureFirebaseAdmin = () => {
  if (firebaseAppInitialized) return true;
  if (admin.apps.length > 0) {
    firebaseAppInitialized = true;
    return true;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    return false;
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
  firebaseAppInitialized = true;
  return true;
};

const getCookieOptions = (maxAge: number) => {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? ('none' as const) : ('lax' as const),
    maxAge,
  };
};

const generateUserId = async (): Promise<string> => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidate = `TG-${Math.floor(10000 + Math.random() * 90000)}`;
    const existing = await (await usersCollection()).findOne({ userId: candidate });
    if (!existing) return candidate;
  }
  return `TG-${Date.now().toString().slice(-5)}`;
};

const signAccessToken = (user: UserDocument, sessionId: string, deviceId: string) => {
  const issuedAt = Date.now();
  const expiry = issuedAt + expiryToMs(ACCESS_TOKEN_EXPIRY, 15 * 60 * 1000);
  return jwt.sign(
    {
      sub: user._id?.toString(),
      userId: user.userId,
      user_id: user.userId,
      role: 'Citizen',
      device_id: deviceId,
      session_id: sessionId,
      issued_at: issuedAt,
      expiry,
    },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
};

const signRefreshToken = (user: UserDocument, tokenId: string, sessionId: string, deviceId: string) => {
  const issuedAt = Date.now();
  const expiry = issuedAt + expiryToMs(REFRESH_TOKEN_EXPIRY, 7 * 24 * 60 * 60 * 1000);
  return jwt.sign(
    {
      sub: user._id?.toString(),
      userId: user.userId,
      user_id: user.userId,
      tokenId,
      tokenType: 'refresh',
      role: 'Citizen',
      device_id: deviceId,
      session_id: sessionId,
      issued_at: issuedAt,
      expiry,
    },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
};

const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

const getOtpForDemo = () => process.env.DEMO_OTP || '123456';

const normalizePhone = (value: string) => value.replace(/\D/g, '');

const normalizeIdentifier = (loginMethod: 'userId' | 'phone', identifier: string) => {
  const raw = identifier.trim();
  if (loginMethod === 'phone') return normalizePhone(raw);
  return raw.toUpperCase();
};

const resolveUserByIdentifier = async (loginMethod: 'userId' | 'phone', identifier: string) => {
  const normalizedIdentifier = normalizeIdentifier(loginMethod, identifier);
  const query = loginMethod === 'userId'
    ? { userId: normalizedIdentifier }
    : { phone: normalizedIdentifier };
  return (await usersCollection()).findOne(query);
};

const issueSessionForUser = async (user: UserDocument, req: Request, res: Response) => {
  const tokenId = uuidv4();
  const sessionId = uuidv4();
  const deviceId = resolveDeviceId(req);
  const accessToken = signAccessToken(user, sessionId, deviceId);
  const refreshToken = signRefreshToken(user, tokenId, sessionId, deviceId);
  const refreshTokenHash = hashToken(refreshToken);
  const refreshExpiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await (await tokenRecordsCollection()).insertOne({
    userId: user.userId,
    sessionId,
    deviceId,
    tokenHash: refreshTokenHash,
    tokenType: 'refresh',
    issuedAt: new Date(),
    expiresAt: refreshExpiryDate,
    revoked: false,
  });

  securityMonitor.registerDevice(user.userId, deviceId);

  res.cookie('access_token', accessToken, getCookieOptions(15 * 60 * 1000));
  res.cookie('refresh_token', refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

  return {
    accessToken,
    refreshToken,
    sessionId,
    deviceId,
    user: {
      id: user.userId,
      userId: user.userId,
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
  };
};

export const register = async (req: Request, res: Response) => {
  const { name, email, phone, password } = req.body as {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
  };

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ success: false, message: 'name, email, phone, and password are required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPhone = normalizePhone(phone);

  if (normalizedPhone.length < 10) {
    return res.status(400).json({ success: false, message: 'Enter a valid phone number with at least 10 digits.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
  }

  const users = await usersCollection();
  const existing = await users.findOne({ $or: [{ email: normalizedEmail }, { phone: normalizedPhone }] });
  if (existing) {
    return res.status(409).json({ success: false, message: 'User already exists with this email or phone.' });
  }

  const userId = await generateUserId();
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user: UserDocument = {
    userId,
    name: name.trim(),
    email: normalizedEmail,
    phone: normalizedPhone,
    passwordHash,
    createdAt: new Date(),
  };

  await users.insertOne(user);

  return res.status(201).json({
    success: true,
    message: 'Registration successful. Use your User ID or phone number to login with OTP.',
    userId,
  });
};

export const sendOtp = async (req: Request, res: Response) => {
  const { loginMethod, identifier } = req.body as {
    loginMethod?: 'userId' | 'phone';
    identifier?: string;
  };

  if (!loginMethod || !identifier || !['userId', 'phone'].includes(loginMethod)) {
    return res.status(400).json({ success: false, message: 'loginMethod(userId|phone) and identifier are required.' });
  }

  const ip = getClientIp(req);
  const userAgent = req.headers['user-agent'] || 'unknown';

  // ── IP block check ─────────────────────────────────────────────────────────
  const ipBlockMins = checkIpBlock(ip);
  if (ipBlockMins > 0) {
    return res.status(429).json({
      success: false,
      message: `Too many failed attempts from your network. Try again in ${ipBlockMins} minute${ipBlockMins !== 1 ? 's' : ''}.`,
    });
  }

  const user = await resolveUserByIdentifier(loginMethod, identifier.trim());
  if (!user) {
    // Count this as an IP failure so attackers can't enumerate users indefinitely
    const nowBlocked = recordIpFailure(ip);
    if (nowBlocked) {
      await logSecurityEvent({ type: 'ip_blocked', ip, userAgent, detail: 'IP blocked after repeated OTP send failures' });
    }
    return res.status(404).json({ success: false, message: 'User not found for given identifier.' });
  }

  // ── OTP send rate limit ────────────────────────────────────────────────────
  const sendWaitMins = checkOtpSendRate(user.userId);
  if (sendWaitMins > 0) {
    await logSecurityEvent({ type: 'otp_rate_limited', userId: user.userId, ip, userAgent, detail: `OTP send rate limit hit (max ${OTP_SEND_LIMIT} per ${OTP_SEND_WINDOW_MS / 60000} min)` });
    return res.status(429).json({
      success: false,
      message: `Too many OTP requests. Try again in ${sendWaitMins} minute${sendWaitMins !== 1 ? 's' : ''}.`,
    });
  }

  recordOtpSend(user.userId);
  const otp = getOtpForDemo();
  otpStore.set(user.userId, { otp, expiresAt: Date.now() + OTP_EXPIRY_MS });

  const debugOtp = process.env.NODE_ENV === 'production' ? undefined : otp;
  return res.json({
    success: true,
    message: `OTP sent to registered ${loginMethod === 'phone' ? 'phone number' : 'contact channel'}.`,
    debugOtp,
    userId: user.userId,
  });
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { loginMethod, identifier, otp } = req.body as {
    loginMethod?: 'userId' | 'phone';
    identifier?: string;
    otp?: string;
  };

  if (!loginMethod || !identifier || !otp || !['userId', 'phone'].includes(loginMethod)) {
    return res.status(400).json({ success: false, message: 'loginMethod, identifier, and otp are required.' });
  }

  const ip = getClientIp(req);
  const userAgent = req.headers['user-agent'] || 'unknown';

  // ── IP block check ─────────────────────────────────────────────────────────
  const ipBlockMins = checkIpBlock(ip);
  if (ipBlockMins > 0) {
    return res.status(429).json({
      success: false,
      message: `Too many failed attempts from your network. Try again in ${ipBlockMins} minute${ipBlockMins !== 1 ? 's' : ''}.`,
    });
  }

  const user = await resolveUserByIdentifier(loginMethod, identifier.trim());
  if (!user) {
    recordIpFailure(ip);
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  // ── Account lockout check ──────────────────────────────────────────────────
  const lockMins = checkOtpLockout(user.userId);
  if (lockMins > 0) {
    return res.status(423).json({
      success: false,
      message: `Account temporarily locked after too many failed OTP attempts. Try again in ${lockMins} minute${lockMins !== 1 ? 's' : ''}.`,
    });
  }

  const otpRecord = otpStore.get(user.userId);
  if (!otpRecord || otpRecord.expiresAt < Date.now() || otpRecord.otp !== otp) {
    // Record failure for both user lockout and IP tracking
    recordOtpFailure(user.userId);
    const failedCount = securityMonitor.logFailedLogin(user.userId);
    const nowBlocked = recordIpFailure(ip);

    if (nowBlocked) {
      await logSecurityEvent({ type: 'ip_blocked', userId: user.userId, ip, userAgent, detail: 'IP blocked after repeated OTP verify failures' });
    }

    if (failedCount > 10) {
      securityMonitor.flagUser(user.userId);
      securityEventQueue.enqueue({
        type: 'ATTACK_ATTEMPT',
        userId: user.userId,
        ip,
        details: { attemptType: 'MULTIPLE_FAILED_LOGINS' },
      });
    }

    // Check if this failure just triggered a lockout
    const newLockMins = checkOtpLockout(user.userId);
    if (newLockMins > 0) {
      await logSecurityEvent({ type: 'otp_lockout', userId: user.userId, ip, userAgent, detail: `Account locked for ${newLockMins} min after ${OTP_FAIL_LIMIT} wrong OTP attempts` });
      return res.status(423).json({
        success: false,
        message: `Too many wrong OTP attempts. Account locked for ${newLockMins} minute${newLockMins !== 1 ? 's' : ''}.`,
      });
    }

    return res.status(401).json({ success: false, message: 'Invalid or expired OTP.' });
  }

  // ── Success path ───────────────────────────────────────────────────────────
  otpStore.delete(user.userId);
  clearOtpFailures(user.userId);

  // ── Suspicious device / new IP detection ──────────────────────────────────
  const lastDevice = deviceStore.get(user.userId);
  const isNewDevice = lastDevice && (lastDevice.ip !== ip || lastDevice.userAgent !== userAgent);
  if (isNewDevice) {
    await logSecurityEvent({
      type: 'new_device_login',
      userId: user.userId,
      ip,
      userAgent,
      detail: `Login from new device/IP. Previous: ${lastDevice.ip} / ${lastDevice.userAgent.slice(0, 80)}`,
    });
  }
  deviceStore.set(user.userId, { ip, userAgent, seenAt: Date.now() });

  const session = await issueSessionForUser(user, req, res);

  return res.json({
    success: true,
    message: 'OTP verified successfully.',
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    user: session.user,
    ...(isNewDevice ? { securityNotice: 'Login detected from a new device or location.' } : {}),
  });
};

export const verifyFirebasePhone = async (req: Request, res: Response) => {
  const { idToken } = req.body as { idToken?: string };

  if (!idToken) {
    return res.status(400).json({ success: false, message: 'Firebase idToken is required.' });
  }

  if (!ensureFirebaseAdmin()) {
    return res.status(500).json({ success: false, message: 'Firebase Admin is not configured on the server.' });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const phoneNumber = normalizePhone(decoded.phone_number || '');

    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: 'Verified Firebase account does not include a phone number.' });
    }

    const user = await (await usersCollection()).findOne({ phone: phoneNumber });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No TrustGov user found for this phone number.' });
    }

    const session = await issueSessionForUser(user, req, res);
    return res.json({
      success: true,
      message: 'Firebase phone verification successful.',
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      user: session.user,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Firebase token verification failed.';
    return res.status(401).json({ success: false, message });
  }
};

export const refreshSession = async (req: Request, res: Response) => {
  const refreshToken = (req.cookies?.refresh_token || req.body?.refreshToken) as string | undefined;

  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'Refresh token not provided.' });
  }

  if (tokenRevocationService.isRevoked(refreshToken)) {
    return res.status(401).json({ success: false, message: 'Refresh token has been revoked.' });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as {
      userId?: string;
      user_id?: string;
      tokenType: string;
      session_id?: string;
      device_id?: string;
    };
    const userId = decoded.userId || decoded.user_id;
    if (decoded.tokenType !== 'refresh') {
      return res.status(403).json({ success: false, message: 'Invalid refresh token type.' });
    }
    if (!userId) {
      return res.status(403).json({ success: false, message: 'Invalid refresh token payload.' });
    }

    const requestDeviceId = resolveDeviceId(req);
    if (decoded.device_id && decoded.device_id !== requestDeviceId) {
      securityEventQueue.enqueue({
        type: 'ATTACK_ATTEMPT',
        userId,
        ip: getClientIp(req),
        details: { attemptType: 'REFRESH_DEVICE_MISMATCH' },
      });
      return res.status(401).json({ success: false, message: 'Device mismatch detected. Please login again.' });
    }

    const tokenHash = hashToken(refreshToken);
    const tokenRecord = await (await tokenRecordsCollection()).findOne({
      userId,
      tokenHash,
      revoked: false,
      expiresAt: { $gt: new Date() },
    });

    if (!tokenRecord) {
      return res.status(403).json({ success: false, message: 'Refresh token is invalid or revoked.' });
    }

    const user = await (await usersCollection()).findOne({ userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const sessionId = tokenRecord.sessionId || decoded.session_id || uuidv4();
    const deviceId = tokenRecord.deviceId || decoded.device_id || requestDeviceId;
    const accessToken = signAccessToken(user, sessionId, deviceId);
    res.cookie('access_token', accessToken, getCookieOptions(15 * 60 * 1000));

    return res.json({ success: true, accessToken });
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid refresh token.' });
  }
};

export const me = async (req: Request, res: Response) => {
  const authUser = (req as any).user as { userId?: string; user_id?: string } | undefined;
  const userId = authUser?.userId || authUser?.user_id;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const user = await (await usersCollection()).findOne({ userId });
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  return res.json({
    success: true,
    user: {
      id: user.userId,
      userId: user.userId,
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
  });
};

export const logout = async (req: Request, res: Response) => {
  const accessToken = (req.cookies?.access_token || req.headers.authorization?.replace('Bearer ', '')) as string | undefined;
  const refreshToken = req.cookies?.refresh_token as string | undefined;
  if (accessToken) {
    tokenRevocationService.revokeToken(accessToken, expiryToMs(ACCESS_TOKEN_EXPIRY, 15 * 60 * 1000));
  }
  if (refreshToken) {
    tokenRevocationService.revokeToken(refreshToken, expiryToMs(REFRESH_TOKEN_EXPIRY, 7 * 24 * 60 * 60 * 1000));
    const tokenHash = hashToken(refreshToken);
    await (await tokenRecordsCollection()).updateOne(
      { tokenHash },
      { $set: { revoked: true } }
    );
  }

  const isProd = process.env.NODE_ENV === 'production';
  const clearCookieOpts = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? ('none' as const) : ('lax' as const),
  };

  res.clearCookie('access_token', clearCookieOpts);
  res.clearCookie('refresh_token', clearCookieOpts);

  return res.json({ success: true, message: 'Logged out successfully' });
};

// ── IP Geolocation helper (ip-api.com, free tier – no key needed) ─────────────
const geoLookup = (ip: string): Promise<{ country: string; countryCode: string; city: string; status: string }> =>
  new Promise((resolve) => {
    // Use localhost/private IPs as India for local development
    if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('::ffff:127.')) {
      return resolve({ country: 'India', countryCode: 'IN', city: 'Chennai', status: 'success' });
    }
    const url = `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,countryCode,city`;
    import('node:http').then(({ get }) => {
      const req = get(url, (res) => {
        let data = '';
        res.on('data', (c: Buffer) => { data += c; });
        res.on('end', () => {
          try { resolve(JSON.parse(data)); }
          catch { resolve({ country: 'Unknown', countryCode: 'XX', city: 'Unknown', status: 'fail' }); }
        });
      });
      req.on('error', () => resolve({ country: 'Unknown', countryCode: 'XX', city: 'Unknown', status: 'fail' }));
      req.setTimeout(4000, () => { req.destroy(); resolve({ country: 'Unknown', countryCode: 'XX', city: 'Unknown', status: 'fail' }); });
    }).catch(() => resolve({ country: 'Unknown', countryCode: 'XX', city: 'Unknown', status: 'fail' }));
  });

/** POST /api/auth/check-security
 *  Called after OTP verification, during the device/location security check.
 *  Returns { success: true, location } if OK, or { success: false, blocked: true, blockedDetails } if not.
 */
export const checkSecurity = async (req: Request, res: Response) => {
  const ip = getClientIp(req);

  // ── Check existing IP block ────────────────────────────────────────────────
  const ipBlockMins = checkIpBlock(ip);
  if (ipBlockMins > 0) {
    const now = Date.now();
    const blockedAt = new Date(now - IP_BLOCK_MS + ipBlockMins * 60 * 1000).toISOString();
    const blockExpiresAt = new Date(now + ipBlockMins * 60 * 1000).toISOString();
    return res.status(403).json({
      success: false,
      blocked: true,
      reason: 'ip_blocked',
      blockedDetails: {
        blockedAt,
        blockExpiresAt,
        remainingMinutes: ipBlockMins,
      },
    });
  }

  // ── Geolocation check ──────────────────────────────────────────────────────
  const geo = await geoLookup(ip);

  // Block access from outside India
  const ALLOWED_COUNTRIES = (process.env.ALLOWED_COUNTRY_CODES || 'IN').split(',').map(c => c.trim().toUpperCase());
  if (geo.status === 'success' && !ALLOWED_COUNTRIES.includes(geo.countryCode)) {
    const now = Date.now();
    const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes
    const blockedAt = new Date(now).toISOString();
    const blockExpiresAt = new Date(now + BLOCK_DURATION_MS).toISOString();

    // Record as IP failure to discourage repeated probing from foreign IPs
    recordIpFailure(ip);
    await logSecurityEvent({
      type: 'ip_blocked',
      ip,
      userAgent: req.headers['user-agent'] || 'unknown',
      detail: `Access denied: location ${geo.city}, ${geo.country} (${geo.countryCode}) not in allowed regions`,
    });

    return res.status(403).json({
      success: false,
      blocked: true,
      reason: 'location_not_allowed',
      blockedDetails: {
        blockedAt,
        blockExpiresAt,
        remainingMinutes: 15,
      },
    });
  }

  // ── All checks passed ─────────────────────────────────────────────────────
  return res.json({
    success: true,
    location: geo.status === 'success' ? `${geo.city}, ${geo.country}` : 'India',
    countryCode: geo.countryCode,
  });
};
