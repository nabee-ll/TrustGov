const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { users, otpStore } = require('../db');
const { JWT_SECRET } = require('../middleware/auth');

// Login
router.post('/login', (req, res) => {
  const { pan, password } = req.body;
  if (!pan || !password)
    return res.status(400).json({ success: false, message: 'PAN and password are required' });

  const user = users.find(u => u.pan.toUpperCase() === pan.toUpperCase());
  if (!user)
    return res.status(401).json({ success: false, message: 'Invalid PAN or password' });

  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch)
    return res.status(401).json({ success: false, message: 'Invalid PAN or password' });

  const token = jwt.sign({ id: user.id, pan: user.pan, name: user.name }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ success: true, token, user: { id: user.id, name: user.name, pan: user.pan, email: user.email, mobile: user.mobile } });
});

// Register
router.post('/register', (req, res) => {
  const { pan, name, dob, email, mobile, password, aadhaar } = req.body;
  if (!pan || !name || !dob || !email || !mobile || !password)
    return res.status(400).json({ success: false, message: 'All fields are required' });

  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panRegex.test(pan.toUpperCase()))
    return res.status(400).json({ success: false, message: 'Invalid PAN format. Expected: ABCDE1234F' });

  const exists = users.find(u => u.pan.toUpperCase() === pan.toUpperCase());
  if (exists)
    return res.status(409).json({ success: false, message: 'PAN already registered' });

  const hashedPwd = bcrypt.hashSync(password, 10);
  const newUser = { id: uuidv4(), pan: pan.toUpperCase(), password: hashedPwd, name, dob, email, mobile, aadhaar: aadhaar || '', address: '', returns: [], refunds: [] };
  users.push(newUser);

  const token = jwt.sign({ id: newUser.id, pan: newUser.pan, name: newUser.name }, JWT_SECRET, { expiresIn: '8h' });
  res.status(201).json({ success: true, token, user: { id: newUser.id, name: newUser.name, pan: newUser.pan, email: newUser.email, mobile: newUser.mobile }, message: 'Registration successful' });
});

// Send OTP (mock)
router.post('/send-otp', (req, res) => {
  const { pan } = req.body;
  if (!pan) return res.status(400).json({ success: false, message: 'PAN is required' });

  const user = users.find(u => u.pan.toUpperCase() === pan.toUpperCase());
  if (!user) return res.status(404).json({ success: false, message: 'PAN not registered' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[pan.toUpperCase()] = { otp, expires: Date.now() + 5 * 60 * 1000 };

  console.log(`OTP for ${pan}: ${otp}`); // In production, send via SMS/email
  res.json({ success: true, message: `OTP sent to registered mobile ${user.mobile.slice(0, 2)}XXXXXX${user.mobile.slice(-2)}`, devOtp: otp });
});

// Verify OTP
router.post('/verify-otp', (req, res) => {
  const { pan, otp } = req.body;
  if (!pan || !otp) return res.status(400).json({ success: false, message: 'PAN and OTP are required' });

  const stored = otpStore[pan.toUpperCase()];
  if (!stored || stored.otp !== otp || Date.now() > stored.expires) {
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
  }

  delete otpStore[pan.toUpperCase()];
  const user = users.find(u => u.pan.toUpperCase() === pan.toUpperCase());
  const token = jwt.sign({ id: user.id, pan: user.pan, name: user.name }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ success: true, token, user: { id: user.id, name: user.name, pan: user.pan, email: user.email } });
});

module.exports = router;
