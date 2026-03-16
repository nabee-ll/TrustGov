const express = require('express');
const router = express.Router();
const { users } = require('../db');
const { authMiddleware } = require('../middleware/auth');

// Get profile
router.get('/profile', authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  const { password, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

// Update profile
router.put('/profile', authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  const { email, mobile, address } = req.body;
  if (email) user.email = email;
  if (mobile) user.mobile = mobile;
  if (address) user.address = address;
  const { password, ...safeUser } = user;
  res.json({ success: true, user: safeUser, message: 'Profile updated successfully' });
});

module.exports = router;
