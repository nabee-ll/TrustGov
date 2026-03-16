const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

// GET /api/user/profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch profile' });
  }
});

// PUT /api/user/profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { email, mobile, address } = req.body;
    const update = {};
    if (email) update.email = email;
    if (mobile) update.mobile = mobile;
    if (address) update.address = address;

    const user = await User.findByIdAndUpdate(req.user.id, update, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user, message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not update profile' });
  }
});

module.exports = router;
