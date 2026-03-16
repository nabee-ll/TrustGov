const express = require('express');
const { applications } = require('../data/store');
const router = express.Router();

router.get('/', (req, res) => {
  const { arn, dob } = req.query;
  if (!arn || !dob)
    return res.status(400).json({ success: false, message: 'ARN and date of birth are required' });
  const app = applications.find(a => a.arn === arn);
  if (!app)
    return res.status(404).json({ success: false, message: 'Application not found. Please check your ARN.' });
  const progress = Math.round((app.timeline.filter(t => t.done).length / app.timeline.length) * 100);
  res.json({ success: true, application: { ...app, progress } });
});

module.exports = router;
