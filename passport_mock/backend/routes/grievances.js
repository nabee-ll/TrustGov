const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { grievances } = require('../data/store');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

router.post('/', (req, res) => {
  const { arn, category, subject, description, name, mobile, email } = req.body;
  if (!subject || !description || !name || !mobile)
    return res.status(400).json({ success: false, message: 'Required fields missing' });
  const grn = 'GR' + Date.now().toString().slice(-11);
  const g = {
    id: uuidv4(), grn, arn, category, subject, description,
    name, mobile, email, status: 'Registered',
    createdAt: new Date().toISOString(),
  };
  grievances.push(g);
  res.status(201).json({ success: true, grn, message: 'Grievance registered. We will respond within 7 working days.' });
});

router.get('/track', (req, res) => {
  const { grn } = req.query;
  const g = grievances.find(x => x.grn === grn);
  if (!g) return res.status(404).json({ success: false, message: 'Grievance not found' });
  res.json({ success: true, grievance: g });
});

router.get('/', authMiddleware, (req, res) => {
  res.json({ success: true, grievances: grievances.filter(g => g.email === req.user.email) });
});

module.exports = router;
