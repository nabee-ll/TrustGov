const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

router.get('/status', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, refunds: user.refunds });
});

// Public refund status check by PAN + AY
router.post('/check', async (req, res) => {
  const { pan, ay } = req.body;
  if (!pan || !ay) return res.status(400).json({ success: false, message: 'PAN and Assessment Year are required' });
  const user = await User.findOne({ pan: pan.toUpperCase() });
  if (!user) return res.status(404).json({ success: false, message: 'No records found for this PAN' });
  const refund = user.refunds.find(r => r.ay === ay);
  if (!refund) return res.json({ success: true, refund: null, message: 'No refund record for this AY' });
  res.json({ success: true, refund });
});

module.exports = router;
