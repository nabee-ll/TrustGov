// ── offices.js ─────────────────────────────────────────────────
const express = require('express');
const { offices } = require('../data/store');
const router = express.Router();

router.get('/', (req, res) => {
  const { state, type, q } = req.query;
  let result = [...offices];
  if (state) result = result.filter(o => o.state.toLowerCase() === state.toLowerCase());
  if (type) result = result.filter(o => o.type === type);
  if (q) result = result.filter(o =>
    o.name.toLowerCase().includes(q.toLowerCase()) ||
    o.city.toLowerCase().includes(q.toLowerCase()) ||
    o.address.toLowerCase().includes(q.toLowerCase())
  );
  res.json({ success: true, offices: result, total: result.length });
});

router.get('/states', (req, res) => {
  const states = [...new Set(offices.map(o => o.state))].sort();
  res.json({ success: true, states });
});

router.get('/:id', (req, res) => {
  const office = offices.find(o => o.id === req.params.id);
  if (!office) return res.status(404).json({ success: false, message: 'Office not found' });
  res.json({ success: true, office });
});

module.exports = router;
