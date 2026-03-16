const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { applications } = require('../data/store');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

const FEE_MAP = {
  'Fresh Passport (Normal) - 36 Pages': 1500,
  'Fresh Passport (Normal) - 60 Pages': 2000,
  'Fresh Passport (Tatkal) - 36 Pages': 3500,
  'Fresh Passport (Tatkal) - 60 Pages': 4000,
  'Minor Passport': 1000,
  'Re-issue of Passport (Normal)': 1500,
  'Re-issue of Passport (Tatkal)': 3500,
  'Police Clearance Certificate': 500,
  'Emergency Certificate': 250,
};

// GET /api/applications — user's applications
router.get('/', authMiddleware, (req, res) => {
  const userApps = applications.filter(a => a.userId === req.user.id);
  res.json({ success: true, applications: userApps });
});

// GET /api/applications/:arn
router.get('/:arn', authMiddleware, (req, res) => {
  const app = applications.find(a => a.arn === req.params.arn && a.userId === req.user.id);
  if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
  res.json({ success: true, application: app });
});

// POST /api/applications — submit new application
router.post('/', authMiddleware, (req, res) => {
  try {
    const { serviceType, bookletType, validity, personalInfo, familyInfo, addressInfo } = req.body;
    if (!serviceType || !personalInfo)
      return res.status(400).json({ success: false, message: 'Missing required fields' });

    const baseFee = FEE_MAP[serviceType] || 1500;
    const dispatch = 50;
    const gst = Math.round((baseFee + dispatch) * 0.18);
    const total = baseFee + dispatch + gst;

    const arn = 'AP' + Date.now().toString().slice(-11);
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() + (serviceType.includes('Tatkal') ? 10 : 35));

    const newApp = {
      id: uuidv4(),
      arn,
      userId: req.user.id,
      serviceType,
      bookletType: bookletType || '36 Pages',
      validity: validity || '10 Years',
      status: 'Submitted',
      appliedOn: new Date().toISOString(),
      expectedDate: expectedDate.toISOString().split('T')[0],
      office: 'Chennai Passport Office',
      paymentStatus: 'Pending',
      paymentAmount: total,
      feeBreakdown: { baseFee, dispatch, gst, total },
      personalInfo,
      familyInfo: familyInfo || {},
      addressInfo: addressInfo || {},
      timeline: [
        { step: 'Application Submitted', done: true, date: new Date().toISOString(), note: 'Online submission confirmed' },
        { step: 'Payment Pending', done: false, date: null, note: 'Awaiting payment' },
        { step: 'Appointment Booking', done: false, date: null, note: 'Pending' },
        { step: 'Document Verification', done: false, date: null, note: 'Pending' },
        { step: 'Police Verification', done: false, date: null, note: 'Pending' },
        { step: 'Passport Dispatched', done: false, date: null, note: 'Pending' },
      ],
    };
    applications.push(newApp);
    res.status(201).json({ success: true, application: newApp, message: 'Application submitted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Submission failed' });
  }
});

// POST /api/applications/:arn/pay
router.post('/:arn/pay', authMiddleware, (req, res) => {
  const app = applications.find(a => a.arn === req.params.arn && a.userId === req.user.id);
  if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
  app.paymentStatus = 'Paid';
  app.paymentRef = 'PAY' + Date.now().toString().slice(-10);
  app.status = 'Processing';
  const t = app.timeline.find(s => s.step === 'Payment Pending');
  if (t) { t.step = 'Payment Received'; t.done = true; t.date = new Date().toISOString(); t.note = `₹${app.paymentAmount} received`; }
  res.json({ success: true, paymentRef: app.paymentRef, message: 'Payment successful' });
});

// GET /api/applications/fees/calculate
router.get('/fees/calculate', (req, res) => {
  const { serviceType, dispatch = 50 } = req.query;
  const baseFee = FEE_MAP[serviceType] || 1500;
  const gst = Math.round((baseFee + Number(dispatch)) * 0.18);
  res.json({ success: true, baseFee, dispatch: Number(dispatch), gst, total: baseFee + Number(dispatch) + gst });
});

module.exports = router;
