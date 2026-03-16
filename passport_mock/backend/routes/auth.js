const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { users } = require('../data/store');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, mobile, dob, passportOffice } = req.body;
    if (!firstName || !email || !password || !mobile)
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    if (users.find(u => u.email === email))
      return res.status(409).json({ success: false, message: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const user = { id: uuidv4(), firstName, lastName, email, password: hashed, mobile, dob, passportOffice, createdAt: new Date().toISOString() };
    users.push(user);
    res.status(201).json({ success: true, message: 'Registration successful. OTP sent to your mobile.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    const { password: _, ...safeUser } = user;
    res.json({ success: true, token, user: safeUser });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', (req, res) => {
  const { otp } = req.body;
  if (otp === '123456') return res.json({ success: true, message: 'OTP verified successfully' });
  res.status(400).json({ success: false, message: 'Invalid OTP' });
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  const { password: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

// PUT /api/auth/profile
router.put('/profile', authMiddleware, (req, res) => {
  const idx = users.findIndex(u => u.id === req.user.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'User not found' });
  const { firstName, lastName, mobile } = req.body;
  if (firstName) users[idx].firstName = firstName;
  if (lastName) users[idx].lastName = lastName;
  if (mobile) users[idx].mobile = mobile;
  const { password: _, ...safeUser } = users[idx];
  res.json({ success: true, user: safeUser });
});

module.exports = router;
