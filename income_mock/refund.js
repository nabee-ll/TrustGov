const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User, TaxReturn } = require('./backend/db');

const JWT_SECRET = process.env.JWT_SECRET || 'incometax_jwt_secret_key_2024';

// Inline auth middleware
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

const STEPS = [
  'Return Filed',
  'Return Verified',
  'Processing',
  'Refund Initiated',
  'Refund Credited',
];

// ── GET /api/refund/status (authenticated) ────────────────────────────────────
router.get('/status', auth, async (req, res) => {
  try {
    const { assessment_year } = req.query;
    const query = { userId: req.user.id };
    if (assessment_year) query.assessmentYear = assessment_year;

    const ret = await TaxReturn.findOne(query).sort({ createdAt: -1 });
    if (!ret) return res.status(404).json({ error: 'No return found' });

    return res.json({
      ack_number: ret.ackNumber,
      assessment_year: ret.assessmentYear,
      refund_amount: ret.refundAmount,
      tax_payable: ret.taxPayable,
      status: ret.status,
      current_step: ret.refundStep || 1,
      steps: STEPS,
      filed_at: ret.createdAt,
    });
  } catch (err) {
    console.error('Refund status error:', err);
    return res.status(500).json({ error: 'Server error fetching refund status' });
  }
});

// ── POST /api/refund/check (public) ───────────────────────────────────────────
router.post('/check', async (req, res) => {
  try {
    const { pan, assessment_year } = req.body;
    if (!pan || !assessment_year)
      return res.status(400).json({ error: 'PAN and Assessment Year are required' });

    const user = await User.findOne({ pan: pan.toUpperCase() });
    if (!user) return res.status(404).json({ error: 'PAN not found' });

    const ret = await TaxReturn.findOne({ userId: user._id, assessmentYear: assessment_year })
      .sort({ createdAt: -1 });
    if (!ret)
      return res.status(404).json({ error: 'No return found for this PAN and Assessment Year' });

    return res.json({
      pan: pan.toUpperCase(),
      assessment_year: ret.assessmentYear,
      refund_amount: ret.refundAmount,
      status: ret.status,
      current_step: ret.refundStep || 1,
      steps: STEPS,
      filed_at: ret.createdAt,
    });
  } catch (err) {
    console.error('Refund check error:', err);
    return res.status(500).json({ error: 'Server error checking refund' });
  }
});

module.exports = router;