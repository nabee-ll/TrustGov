const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

// Get profile
router.get('/profile', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  const { password, ...safeUser } = user.toObject();
  res.json({ success: true, user: safeUser });
});

// Update profile
router.put('/profile', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  const { email, mobile, address } = req.body;
  if (email) user.email = email;
  if (mobile) user.mobile = mobile;
  if (address) user.address = address;
  await user.save();
  const { password, ...safeUser } = user.toObject();
  res.json({ success: true, user: safeUser, message: 'Profile updated successfully' });
});

module.exports = router;
