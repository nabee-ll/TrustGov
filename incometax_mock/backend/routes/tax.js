const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

// GET /api/tax/returns  — get all filed returns for logged-in user
router.get('/returns', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('returns');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, returns: user.returns });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch returns' });
  }
});

// POST /api/tax/file-return  — file a new ITR
router.post('/file-return', authMiddleware, async (req, res) => {
  try {
    const { ay, form, totalIncome, taxPayable, tdsDeducted, selfAssessmentTax, advanceTax } = req.body;
    if (!ay || !form || totalIncome === undefined)
      return res.status(400).json({ success: false, message: 'Assessment year, form and income are required' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const existing = user.returns.find(r => r.ay === ay);
    if (existing)
      return res.status(409).json({ success: false, message: `Return for AY ${ay} already filed` });

    const totalTaxPaid = (tdsDeducted || 0) + (selfAssessmentTax || 0) + (advanceTax || 0);
    const refundAmount = Math.max(0, totalTaxPaid - (taxPayable || 0));
    const taxDue = Math.max(0, (taxPayable || 0) - totalTaxPaid);

    const newReturn = {
      ay,
      form,
      filedOn: new Date().toISOString().split('T')[0],
      status: 'Filed - Pending Verification',
      ackNo: `ITR-${Date.now()}`,
      totalIncome,
      taxPayable: taxPayable || 0,
      tdsDeducted: tdsDeducted || 0,
      selfAssessmentTax: selfAssessmentTax || 0,
      advanceTax: advanceTax || 0,
      refundAmount,
      taxDue,
    };

    user.returns.unshift(newReturn); // newest first

    if (refundAmount > 0) {
      user.refunds.push({
        ay,
        amount: refundAmount,
        status: 'Initiated',
        date: new Date().toISOString().split('T')[0],
      });
    }

    await user.save();

    res.status(201).json({
      success: true,
      return: user.returns[0],
      message: `ITR filed successfully. Acknowledgement: ${newReturn.ackNo}`,
    });
  } catch (err) {
    console.error('File return error:', err);
    res.status(500).json({ success: false, message: 'Filing failed. Please try again.' });
  }
});

// POST /api/tax/calculate  — tax calculator (public, no auth needed)
router.post('/calculate', (req, res) => {
  const { income, regime, age, deductions } = req.body;
  if (!income || !regime)
    return res.status(400).json({ success: false, message: 'Income and regime are required' });

  let taxableIncome = income;
  let appliedDeductions = {};

  if (regime === 'old') {
    const std = Math.min(50000, income);
    const sec80C = Math.min(deductions?.sec80C || 0, 150000);
    const sec80D = Math.min(deductions?.sec80D || 0, age >= 60 ? 50000 : 25000);
    const hra = deductions?.hra || 0;
    const total = std + sec80C + sec80D + hra;
    taxableIncome = Math.max(0, income - total);
    appliedDeductions = { standardDeduction: std, sec80C, sec80D, hra, total };
  } else {
    const std = Math.min(75000, income);
    taxableIncome = Math.max(0, income - std);
    appliedDeductions = { standardDeduction: std, total: std };
  }

  let tax = 0;
  if (regime === 'old') {
    const limit = age >= 80 ? 500000 : age >= 60 ? 300000 : 250000;
    if (taxableIncome > limit) {
      if (taxableIncome <= 500000) tax = (taxableIncome - limit) * 0.05;
      else if (taxableIncome <= 1000000) tax = (500000 - limit) * 0.05 + (taxableIncome - 500000) * 0.20;
      else tax = (500000 - limit) * 0.05 + 500000 * 0.20 + (taxableIncome - 1000000) * 0.30;
    }
    if (taxableIncome <= 500000) tax = 0;
  } else {
    if (taxableIncome <= 300000) tax = 0;
    else if (taxableIncome <= 700000) tax = (taxableIncome - 300000) * 0.05;
    else if (taxableIncome <= 1000000) tax = 20000 + (taxableIncome - 700000) * 0.10;
    else if (taxableIncome <= 1200000) tax = 50000 + (taxableIncome - 1000000) * 0.15;
    else if (taxableIncome <= 1500000) tax = 80000 + (taxableIncome - 1200000) * 0.20;
    else tax = 140000 + (taxableIncome - 1500000) * 0.30;
    if (taxableIncome <= 700000) tax = 0;
  }

  const cess = tax * 0.04;
  const totalTax = tax + cess;

  res.json({
    success: true,
    calculation: {
      grossIncome: income,
      taxableIncome,
      tax: Math.round(tax),
      cess: Math.round(cess),
      totalTax: Math.round(totalTax),
      appliedDeductions,
      regime,
    },
  });
});

// GET /api/tax/ais  — Annual Information Statement (mock data based on real user)
router.get('/ais', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('pan name returns');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Derive AIS data from filed returns + mock other sources
    const latestReturn = user.returns[0];
    res.json({
      success: true,
      ais: {
        pan: user.pan,
        name: user.name,
        ay: '2024-25',
        salary: latestReturn?.totalIncome || 0,
        interestIncome: 12000,
        dividends: 5000,
        tdsDeducted: latestReturn?.tdsDeducted || 0,
        advanceTax: latestReturn?.advanceTax || 0,
        selfAssessmentTax: latestReturn?.selfAssessmentTax || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch AIS' });
  }
});

// POST /api/tax/pay  — pay income tax (Challan ITNS 280)
router.post('/pay', authMiddleware, async (req, res) => {
  try {
    const { pan, name, ay, taxType, payMode, bank, amounts } = req.body;

    if (!pan || !name || !ay || !taxType || !amounts?.total)
      return res.status(400).json({ success: false, message: 'PAN, name, assessment year, tax type and amount are required' });

    if (amounts.total <= 0)
      return res.status(400).json({ success: false, message: 'Amount must be greater than zero' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const ts = Date.now();
    const cin = `CIN${ts.toString().slice(-10)}`;
    const bankRef = `BNK${ts.toString().slice(-8).split('').reverse().join('')}`;
    const date = new Date().toISOString().split('T')[0];

    const challan = {
      cin,
      bankRef,
      pan: pan.toUpperCase(),
      ay,
      taxType,
      payMode,
      amounts,
      amount: amounts.total,
      date,
      status: 'SUCCESS',
    };

    user.payments.push(challan);

    // If self-assessment tax, update matching return's taxDue
    if (taxType === 'self_assessment') {
      const ret = user.returns.find(r => r.ay === ay);
      if (ret) {
        ret.selfAssessmentTax = (ret.selfAssessmentTax || 0) + amounts.total;
        ret.taxDue = Math.max(0, (ret.taxDue || 0) - amounts.total);
      }
    }

    await user.save();

    res.status(201).json({
      success: true,
      challan: user.payments[user.payments.length - 1],
      message: `Tax payment of ₹${amounts.total.toLocaleString('en-IN')} successful. CIN: ${cin}`,
    });
  } catch (err) {
    console.error('Pay tax error:', err);
    res.status(500).json({ success: false, message: 'Payment failed. Please try again.' });
  }
});

module.exports = router;
