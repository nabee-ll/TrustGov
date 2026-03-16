const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');

const otpStore = {}; // { pan: { otp, expires } }

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { pan, name, dob, email, mobile, password, aadhaar } = req.body;
    if (!pan || !name || !dob || !email || !mobile || !password)
      return res.status(400).json({ success: false, message: 'All fields are required' });

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(pan.toUpperCase()))
      return res.status(400).json({ success: false, message: 'Invalid PAN format. Expected: ABCDE1234F' });

    const exists = await User.findOne({ pan: pan.toUpperCase() });
    if (exists)
      return res.status(409).json({ success: false, message: 'PAN already registered' });

    const hashedPwd = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      pan: pan.toUpperCase(),
      password: hashedPwd,
      name,
      dob,
      email,
      mobile,
      aadhaar: aadhaar || '',
      address: '',
      returns: [],
      refunds: [],
      payments: [],
    });

    const token = jwt.sign({ id: newUser._id, pan: newUser.pan, name: newUser.name }, JWT_SECRET, { expiresIn: '8h' });
    res.status(201).json({
      success: true,
      token,
      user: { id: newUser._id, name: newUser.name, pan: newUser.pan, email: newUser.email, mobile: newUser.mobile },
      message: 'Registration successful',
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { pan, password } = req.body;
    if (!pan || !password)
      return res.status(400).json({ success: false, message: 'PAN and password are required' });

    const user = await User.findOne({ pan: pan.toUpperCase() });
    if (!user)
      return res.status(401).json({ success: false, message: 'Invalid PAN or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Invalid PAN or password' });

    const token = jwt.sign({ id: user._id, pan: user.pan, name: user.name }, JWT_SECRET, { expiresIn: '8h' });
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, pan: user.pan, email: user.email, mobile: user.mobile },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
});

// POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
  try {
    const { pan } = req.body;
    if (!pan) return res.status(400).json({ success: false, message: 'PAN is required' });

    const user = await User.findOne({ pan: pan.toUpperCase() });
    if (!user) return res.status(404).json({ success: false, message: 'PAN not registered' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[pan.toUpperCase()] = { otp, expires: Date.now() + 5 * 60 * 1000 };
    console.log(`[DEV] OTP for ${pan}: ${otp}`);

    res.json({
      success: true,
      message: `OTP sent to registered mobile ${user.mobile.slice(0, 2)}XXXXXX${user.mobile.slice(-2)}`,
      devOtp: otp,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not send OTP' });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { pan, otp } = req.body;
    if (!pan || !otp) return res.status(400).json({ success: false, message: 'PAN and OTP are required' });

    const stored = otpStore[pan.toUpperCase()];
    if (!stored || stored.otp !== otp || Date.now() > stored.expires)
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

    delete otpStore[pan.toUpperCase()];
    const user = await User.findOne({ pan: pan.toUpperCase() });
    const token = jwt.sign({ id: user._id, pan: user.pan, name: user.name }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ success: true, token, user: { id: user._id, name: user.name, pan: user.pan, email: user.email } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'OTP verification failed' });
  }
});

module.exports = router;
