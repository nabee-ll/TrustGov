import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import admin from 'firebase-admin';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';
import { getCollection } from '../db/mongo';

const JWT_SECRET = process.env.JWT_SECRET || 'gov-secure-secret-key-123';
const ACCESS_TOKEN_EXPIRY = (process.env.ACCESS_TOKEN_EXPIRY || '15m') as SignOptions['expiresIn'];
const REFRESH_TOKEN_EXPIRY = (process.env.REFRESH_TOKEN_EXPIRY || '7d') as SignOptions['expiresIn'];
const OTP_EXPIRY_MS = 5 * 60 * 1000;
const BCRYPT_ROUNDS = 10;

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

const otpStore = new Map<string, OtpRecord>();

const usersCollection = () => getCollection<UserDocument>(process.env.USERS_COLLECTION || 'users');
const tokenRecordsCollection = () => getCollection<TokenRecordDocument>(process.env.TOKEN_RECORDS_COLLECTION || 'token_records');

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

const signAccessToken = (user: UserDocument) => jwt.sign(
  { sub: user._id?.toString(), userId: user.userId, role: 'citizen' },
  JWT_SECRET,
  { expiresIn: ACCESS_TOKEN_EXPIRY }
);

const signRefreshToken = (user: UserDocument, tokenId: string) => jwt.sign(
  { sub: user._id?.toString(), userId: user.userId, tokenId, tokenType: 'refresh' },
  JWT_SECRET,
  { expiresIn: REFRESH_TOKEN_EXPIRY }
);

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

const issueSessionForUser = async (user: UserDocument, res: Response) => {
  const tokenId = uuidv4();
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user, tokenId);
  const refreshTokenHash = hashToken(refreshToken);
  const refreshExpiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await (await tokenRecordsCollection()).insertOne({
    userId: user.userId,
    tokenHash: refreshTokenHash,
    tokenType: 'refresh',
    issuedAt: new Date(),
    expiresAt: refreshExpiryDate,
    revoked: false,
  });

  res.cookie('access_token', accessToken, getCookieOptions(15 * 60 * 1000));
  res.cookie('refresh_token', refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

  return {
    accessToken,
    refreshToken,
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

  const user = await resolveUserByIdentifier(loginMethod, identifier.trim());
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found for given identifier.' });
  }

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

  const user = await resolveUserByIdentifier(loginMethod, identifier.trim());
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  const otpRecord = otpStore.get(user.userId);
  if (!otpRecord || otpRecord.expiresAt < Date.now() || otpRecord.otp !== otp) {
    return res.status(401).json({ success: false, message: 'Invalid or expired OTP.' });
  }

  otpStore.delete(user.userId);

  const session = await issueSessionForUser(user, res);

  return res.json({
    success: true,
    message: 'OTP verified successfully.',
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    user: session.user,
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

    const session = await issueSessionForUser(user, res);
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

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as { userId: string; tokenType: string };
    if (decoded.tokenType !== 'refresh') {
      return res.status(403).json({ success: false, message: 'Invalid refresh token type.' });
    }

    const tokenHash = hashToken(refreshToken);
    const tokenRecord = await (await tokenRecordsCollection()).findOne({
      userId: decoded.userId,
      tokenHash,
      revoked: false,
      expiresAt: { $gt: new Date() },
    });

    if (!tokenRecord) {
      return res.status(403).json({ success: false, message: 'Refresh token is invalid or revoked.' });
    }

    const user = await (await usersCollection()).findOne({ userId: decoded.userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const accessToken = signAccessToken(user);
    res.cookie('access_token', accessToken, getCookieOptions(15 * 60 * 1000));

    return res.json({ success: true, accessToken });
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid refresh token.' });
  }
};

export const me = async (req: Request, res: Response) => {
  const authUser = (req as any).user as { userId?: string } | undefined;
  if (!authUser?.userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const user = await (await usersCollection()).findOne({ userId: authUser.userId });
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
  const refreshToken = req.cookies?.refresh_token as string | undefined;
  if (refreshToken) {
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
