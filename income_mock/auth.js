const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Otp } = require('./backend/db');

const JWT_SECRET = process.env.JWT_SECRET || 'incometax_jwt_secret_key_2024';
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { pan, password, name, dob, email, mobile, aadhaar } = req.body;

    if (!pan || !password || !name || !dob || !email || !mobile)
      return res.status(400).json({ error: 'All fields are required' });
    if (!PAN_REGEX.test(pan))
      return res.status(400).json({ error: 'Invalid PAN format (e.g. ABCDE1234F)' });
    if (password.length < 8)
      return res.status(400).json({ error: 'Password must be at least 8 characters' });

    const [existingPan, existingEmail] = await Promise.all([
      User.findOne({ pan: pan.toUpperCase() }),
      User.findOne({ email: email.toLowerCase() }),
    ]);
    if (existingPan) return res.status(409).json({ error: 'PAN already registered' });
    if (existingEmail) return res.status(409).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      pan: pan.toUpperCase(), password: hash, name, dob,
      email: email.toLowerCase(), mobile, aadhaar: aadhaar || null,
    });

    const token = jwt.sign({ id: user._id, pan: user.pan, name: user.name }, JWT_SECRET, { expiresIn: '8h' });
    const { password: _pw, __v, ...safeUser } = user.toObject();
    return res.status(201).json({ message: 'Registration successful', token, user: safeUser });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Server error during registration' });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { pan, password } = req.body;
    if (!pan || !password)
      return res.status(400).json({ error: 'PAN and password are required' });
    if (!PAN_REGEX.test(pan))
      return res.status(400).json({ error: 'Invalid PAN format' });

    const user = await User.findOne({ pan: pan.toUpperCase() });
    if (!user) return res.status(401).json({ error: 'Invalid PAN or password' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid PAN or password' });

    const token = jwt.sign({ id: user._id, pan: user.pan, name: user.name }, JWT_SECRET, { expiresIn: '8h' });
    const { password: _pw, __v, ...safeUser } = user.toObject();
    return res.json({ message: 'Login successful', token, user: safeUser });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error during login' });
  }
});

// ── POST /api/auth/send-otp ───────────────────────────────────────────────────
router.post('/send-otp', async (req, res) => {
  try {
    const { pan } = req.body;
    if (!pan || !PAN_REGEX.test(pan))
      return res.status(400).json({ error: 'Valid PAN is required' });

    const user = await User.findOne({ pan: pan.toUpperCase() });
    if (!user) return res.status(404).json({ error: 'PAN not registered' });

    await Otp.updateMany({ pan: pan.toUpperCase(), used: false }, { used: true });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await Otp.create({ pan: pan.toUpperCase(), otp, expiresAt });

    return res.json({
      message: `OTP sent to mobile ending in ${user.mobile.slice(-4)}`,
      otp,         // dev mode — remove in production
      mobile_hint: user.mobile.slice(-4),
    });
  } catch (err) {
    console.error('Send OTP error:', err);
    return res.status(500).json({ error: 'Server error sending OTP' });
  }
});

// ── POST /api/auth/verify-otp ─────────────────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
  try {
    const { pan, otp } = req.body;
    if (!pan || !otp)
      return res.status(400).json({ error: 'PAN and OTP are required' });

    const record = await Otp.findOne({
      pan: pan.toUpperCase(), otp, used: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!record) return res.status(401).json({ error: 'Invalid or expired OTP' });

    record.used = true;
    await record.save();

    const user = await User.findOne({ pan: pan.toUpperCase() });
    const token = jwt.sign({ id: user._id, pan: user.pan, name: user.name }, JWT_SECRET, { expiresIn: '8h' });
    const { password: _pw, __v, ...safeUser } = user.toObject();
    return res.json({ message: 'OTP verified successfully', token, user: safeUser });
  } catch (err) {
    console.error('Verify OTP error:', err);
    return res.status(500).json({ error: 'Server error verifying OTP' });
  }
});

module.exports = router;