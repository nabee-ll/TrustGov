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

// ── Tax Computation Helper ────────────────────────────────────────────────────
function computeTax(taxableIncome, regime, age = 'below60') {
  let tax = 0;

  if (regime === 'new') {
    if (taxableIncome <= 300000) tax = 0;
    else if (taxableIncome <= 600000) tax = (taxableIncome - 300000) * 0.05;
    else if (taxableIncome <= 900000) tax = 15000 + (taxableIncome - 600000) * 0.10;
    else if (taxableIncome <= 1200000) tax = 45000 + (taxableIncome - 900000) * 0.15;
    else if (taxableIncome <= 1500000) tax = 90000 + (taxableIncome - 1200000) * 0.20;
    else tax = 150000 + (taxableIncome - 1500000) * 0.30;
    if (taxableIncome <= 700000) tax = 0; // Rebate u/s 87A
  } else {
    const exemption = age === 'super_senior' ? 500000 : age === 'senior' ? 300000 : 250000;
    if (taxableIncome <= exemption) tax = 0;
    else if (taxableIncome <= 500000) tax = (taxableIncome - exemption) * 0.05;
    else if (taxableIncome <= 1000000) tax = (500000 - exemption) * 0.05 + (taxableIncome - 500000) * 0.20;
    else tax = (500000 - exemption) * 0.05 + 500000 * 0.20 + (taxableIncome - 1000000) * 0.30;
    if (taxableIncome <= 500000) tax = 0; // Rebate u/s 87A
  }

  let surcharge = 0;
  if (taxableIncome > 20000000) surcharge = tax * 0.25;
  else if (taxableIncome > 10000000) surcharge = tax * 0.15;
  else if (taxableIncome > 5000000) surcharge = tax * 0.10;

  const base = tax + surcharge;
  const cess = base * 0.04;
  const total = Math.round(base + cess);
  return { tax: Math.round(tax), surcharge: Math.round(surcharge), cess: Math.round(cess), total };
}

function generateAckNumber() {
  return `ACK${new Date().getFullYear()}${Math.floor(1000000000 + Math.random() * 9000000000)}`;
}

// ── GET /api/tax/returns ──────────────────────────────────────────────────────
router.get('/returns', auth, async (req, res) => {
  try {
    const returns = await TaxReturn.find({ userId: req.user.id })
      .select('-__v -incomeDetails -deductionDetails')
      .sort({ createdAt: -1 });
    return res.json(returns);
  } catch (err) {
    console.error('Get returns error:', err);
    return res.status(500).json({ error: 'Server error fetching returns' });
  }
});

// ── POST /api/tax/file-return ─────────────────────────────────────────────────
router.post('/file-return', auth, async (req, res) => {
  try {
    const { assessment_year, itr_form, regime, age, income_details, deduction_details, tds_deducted = 0 } = req.body;

    if (!assessment_year || !itr_form || !regime || !income_details)
      return res.status(400).json({ error: 'Missing required fields' });

    const existing = await TaxReturn.findOne({ userId: req.user.id, assessmentYear: assessment_year });
    if (existing)
      return res.status(409).json({ error: `Return for ${assessment_year} already filed` });

    const inc = income_details;
    const grossIncome =
      (Number(inc.salary) || 0) +
      (Number(inc.house_property) || 0) +
      (Number(inc.capital_gains) || 0) +
      (Number(inc.other_sources) || 0) +
      (Number(inc.business_income) || 0);

    let totalDeductions = 0;
    if (regime === 'old' && deduction_details) {
      const d = deduction_details;
      totalDeductions =
        Math.min(Number(d.section_80c) || 0, 150000) +
        Math.min(Number(d.section_80d) || 0, 75000) +
        (Number(d.hra) || 0) +
        (Number(d.standard_deduction) || 50000) +
        (Number(d.other_deductions) || 0);
    } else if (regime === 'new') {
      totalDeductions = 75000;
    }

    const taxableIncome = Math.max(0, grossIncome - totalDeductions);
    const { total: taxPayable } = computeTax(taxableIncome, regime, age || 'below60');
    const tds = Number(tds_deducted) || 0;
    const refund = Math.max(0, tds - taxPayable);
    const ackNumber = generateAckNumber();

    const newReturn = await TaxReturn.create({
      userId: req.user.id,
      ackNumber,
      assessmentYear: assessment_year,
      itrForm: itr_form,
      regime,
      grossIncome,
      totalDeductions,
      taxableIncome,
      taxPayable,
      tdsDeducted: tds,
      refundAmount: refund,
      status: 'Filed',
      refundStep: 1,
      incomeDetails: income_details,
      deductionDetails: deduction_details || {},
    });

    return res.status(201).json({
      message: 'Return filed successfully',
      ack_number: ackNumber,
      return: newReturn,
    });
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ error: 'Return for this Assessment Year already filed' });
    console.error('File return error:', err);
    return res.status(500).json({ error: 'Server error filing return' });
  }
});

// ── POST /api/tax/calculate (public) ─────────────────────────────────────────
router.post('/calculate', async (req, res) => {
  try {
    const { gross_income, regime, age, deduction_details } = req.body;
    if (!gross_income || !regime)
      return res.status(400).json({ error: 'gross_income and regime are required' });

    let totalDeductions = 0;
    if (regime === 'old' && deduction_details) {
      const d = deduction_details;
      totalDeductions =
        Math.min(Number(d.section_80c) || 0, 150000) +
        Math.min(Number(d.section_80d) || 0, 75000) +
        (Number(d.hra) || 0) +
        (Number(d.standard_deduction) || 50000) +
        (Number(d.other_deductions) || 0);
    } else if (regime === 'new') {
      totalDeductions = 75000;
    }

    const taxableIncome = Math.max(0, Number(gross_income) - totalDeductions);
    const breakdown = computeTax(taxableIncome, regime, age || 'below60');

    return res.json({
      gross_income: Number(gross_income),
      total_deductions: totalDeductions,
      taxable_income: taxableIncome,
      tax_breakdown: breakdown,
      effective_rate: taxableIncome > 0
        ? ((breakdown.total / Number(gross_income)) * 100).toFixed(2)
        : '0.00',
    });
  } catch (err) {
    console.error('Calculate error:', err);
    return res.status(500).json({ error: 'Server error calculating tax' });
  }
});

// ── GET /api/tax/ais ──────────────────────────────────────────────────────────
router.get('/ais', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('name pan');
    const returns = await TaxReturn.find({ userId: req.user.id })
      .select('assessmentYear grossIncome tdsDeducted')
      .sort({ createdAt: -1 })
      .limit(3);

    const totalTds = returns.reduce((sum, r) => sum + r.tdsDeducted, 0);

    return res.json({
      pan: user.pan,
      name: user.name,
      financial_year: 'FY 2024-25',
      salary_income: returns[0]?.grossIncome || 0,
      tds_deducted: totalTds,
      advance_tax: 0,
      high_value_txns: [],
      last_updated: new Date().toISOString(),
    });
  } catch (err) {
    console.error('AIS error:', err);
    return res.status(500).json({ error: 'Server error fetching AIS' });
  }
});

module.exports = router;