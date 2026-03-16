const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

// GET /api/refund/status  — logged-in user's refunds
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('refunds');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, refunds: user.refunds });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch refund status' });
  }
});

// POST /api/refund/check  — public refund check by PAN + AY
router.post('/check', async (req, res) => {
  try {
    const { pan, ay } = req.body;
    if (!pan || !ay)
      return res.status(400).json({ success: false, message: 'PAN and Assessment Year are required' });

    const user = await User.findOne({ pan: pan.toUpperCase() }).select('refunds');
    if (!user)
      return res.status(404).json({ success: false, message: 'No records found for this PAN' });

    const refund = user.refunds.find(r => r.ay === ay);
    if (!refund)
      return res.json({ success: true, refund: null, message: 'No refund record for this AY' });

    res.json({ success: true, refund });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not check refund' });
  }
});

module.exports = router;
