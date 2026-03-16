const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User } = require('./backend/db');

const JWT_SECRET = process.env.JWT_SECRET || 'incometax_jwt_secret_key_2024';

// Inline auth middleware (no separate middleware folder needed)
function auth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ── GET /api/user/profile ─────────────────────────────────────────────────────
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -__v');
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json(user);
  } catch (err) {
    console.error('Get profile error:', err);
    return res.status(500).json({ error: 'Server error fetching profile' });
  }
});

// ── PUT /api/user/profile ─────────────────────────────────────────────────────
router.put('/profile', auth, async (req, res) => {
  try {
    const { email, mobile, address, city, state, pincode } = req.body;

    if (email) {
      const existing = await User.findOne({ email: email.toLowerCase(), _id: { $ne: req.user.id } });
      if (existing) return res.status(409).json({ error: 'Email already in use' });
    }

    const updates = {};
    if (email) updates.email = email.toLowerCase();
    if (mobile) updates.mobile = mobile;
    if (address !== undefined) updates.address = address;
    if (city !== undefined) updates.city = city;
    if (state !== undefined) updates.state = state;
    if (pincode !== undefined) updates.pincode = pincode;

    const updated = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password -__v');
    return res.json({ message: 'Profile updated successfully', user: updated });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ error: 'Server error updating profile' });
  }
});

module.exports = router;