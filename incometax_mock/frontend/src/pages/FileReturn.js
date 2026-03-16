import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AY_OPTIONS = ['2024-25', '2023-24', '2022-23'];
const FORM_OPTIONS = [
  { value: 'ITR-1', label: 'ITR-1 (Sahaj)', desc: 'Salaried, one house property, other sources — income up to ₹50L' },
  { value: 'ITR-2', label: 'ITR-2', desc: 'Capital gains, multiple properties, foreign income' },
  { value: 'ITR-3', label: 'ITR-3', desc: 'Business or profession income' },
  { value: 'ITR-4', label: 'ITR-4 (Sugam)', desc: 'Presumptive taxation — Business/Professional' },
];

const STEPS = ['Select AY & Form', 'Income Details', 'Deductions', 'Tax Computation', 'Review & Submit'];

export default function FileReturn() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    ay: '2024-25',
    itrForm: 'ITR-1',
    regime: 'new',
    // Income
    salary: '',
    houseProperty: '',
    capitalGains: '',
    otherSources: '',
    // Deductions (old regime)
    sec80C: '',
    sec80D: '',
    hra: '',
    // Tax paid
    tdsDeducted: '',
    advanceTax: '',
    selfAssessmentTax: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const totalIncome = () => {
    return (parseFloat(form.salary) || 0)
      + (parseFloat(form.houseProperty) || 0)
      + (parseFloat(form.capitalGains) || 0)
      + (parseFloat(form.otherSources) || 0);
  };

  const calcTax = () => {
    let income = totalIncome();
    let taxable = income;
    if (form.regime === 'old') {
      const std = Math.min(50000, income);
      const c80 = Math.min(parseFloat(form.sec80C) || 0, 150000);
      const d80 = Math.min(parseFloat(form.sec80D) || 0, 25000);
      const hra = parseFloat(form.hra) || 0;
      taxable = Math.max(0, income - std - c80 - d80 - hra);
    } else {
      taxable = Math.max(0, income - 75000);
    }

    let tax = 0;
    if (form.regime === 'new') {
      if (taxable <= 300000) tax = 0;
      else if (taxable <= 700000) tax = (taxable - 300000) * 0.05;
      else if (taxable <= 1000000) tax = 20000 + (taxable - 700000) * 0.10;
      else if (taxable <= 1200000) tax = 50000 + (taxable - 1000000) * 0.15;
      else if (taxable <= 1500000) tax = 80000 + (taxable - 1200000) * 0.20;
      else tax = 140000 + (taxable - 1500000) * 0.30;
      if (taxable <= 700000) tax = 0;
    } else {
      if (taxable <= 250000) tax = 0;
      else if (taxable <= 500000) tax = (taxable - 250000) * 0.05;
      else if (taxable <= 1000000) tax = 12500 + (taxable - 500000) * 0.20;
      else tax = 112500 + (taxable - 1000000) * 0.30;
      if (taxable <= 500000) tax = 0;
    }

    const cess = tax * 0.04;
    const total = tax + cess;
    const paid = (parseFloat(form.tdsDeducted) || 0) + (parseFloat(form.advanceTax) || 0) + (parseFloat(form.selfAssessmentTax) || 0);
    const refund = Math.max(0, paid - total);
    const due = Math.max(0, total - paid);
    return { taxable: Math.round(taxable), tax: Math.round(tax), cess: Math.round(cess), total: Math.round(total), paid: Math.round(paid), refund: Math.round(refund), due: Math.round(due) };
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    const t = calcTax();
    try {
      const res = await axios.post('/api/tax/file-return', {
        ay: form.ay,
        form: form.itrForm,
        totalIncome: totalIncome(),
        taxPayable: t.total,
        tdsDeducted: parseFloat(form.tdsDeducted) || 0,
        selfAssessmentTax: parseFloat(form.selfAssessmentTax) || 0,
        advanceTax: parseFloat(form.advanceTax) || 0,
      });
      setSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to file return. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
  const tax = calcTax();

  if (success) {
    return (
      <div className="page" style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: '48px 32px' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
          <h2 style={{ color: 'var(--success)', marginBottom: 8, fontSize: 22 }}>ITR Filed Successfully!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Your Income Tax Return has been filed and submitted for processing.</p>
          <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '20px', marginBottom: 24, textAlign: 'left' }}>
            {[
              ['Acknowledgement Number', success.return?.ackNo],
              ['Assessment Year', success.return?.ay],
              ['Form', success.return?.form],
              ['Filed On', success.return?.filedOn],
              ['Status', success.return?.status],
              ['Refund Amount', success.return?.refundAmount > 0 ? fmt(success.return.refundAmount) : 'Nil'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                <strong>{v}</strong>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => navigate('/my-returns')}>View My Returns</button>
            <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page" style={{ maxWidth: 760 }}>
      <h1 className="page-title">📄 File Income Tax Return</h1>
      <p className="page-subtitle">Complete all steps to file your ITR online</p>

      {/* Steps */}
      <div className="steps" style={{ marginBottom: 32 }}>
        {STEPS.map((s, i) => (
          <React.Fragment key={i}>
            <div className={`step${step === i ? ' active' : step > i ? ' done' : ''}`}>
              <div className="step-circle">{step > i ? '✓' : i + 1}</div>
              <span className="step-label">{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className="step-line" />}
          </React.Fragment>
        ))}
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="card">
        {/* Step 0 */}
        {step === 0 && (
          <div>
            <h3 className="card-title" style={{ marginBottom: 20 }}>Select Assessment Year & ITR Form</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Assessment Year <span className="required">*</span></label>
                <select className="form-control" value={form.ay} onChange={e => set('ay', e.target.value)}>
                  {AY_OPTIONS.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tax Regime <span className="required">*</span></label>
                <select className="form-control" value={form.regime} onChange={e => set('regime', e.target.value)}>
                  <option value="new">New Tax Regime (Default)</option>
                  <option value="old">Old Tax Regime</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">ITR Form <span className="required">*</span></label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {FORM_OPTIONS.map(f => (
                  <label key={f.value} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px',
                    border: `2px solid ${form.itrForm === f.value ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: 8, cursor: 'pointer', background: form.itrForm === f.value ? '#f0f6ff' : 'white',
                    transition: 'all 0.2s'
                  }}>
                    <input type="radio" name="itrForm" value={f.value} checked={form.itrForm === f.value}
                      onChange={() => set('itrForm', f.value)} style={{ marginTop: 2 }} />
                    <div>
                      <strong style={{ fontSize: 14, color: 'var(--primary-dark)' }}>{f.label}</strong>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{f.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <div>
            <h3 className="card-title" style={{ marginBottom: 20 }}>Income Details (₹)</h3>
            <div className="alert alert-info" style={{ fontSize: 12 }}>Enter annual income amounts. Leave blank if not applicable.</div>
            {[
              { k: 'salary', label: 'Income from Salary / Pension', placeholder: 'e.g. 850000' },
              { k: 'houseProperty', label: 'Income from House Property (Net)', placeholder: 'e.g. 0 or negative for loss' },
              { k: 'capitalGains', label: 'Capital Gains', placeholder: 'e.g. 50000' },
              { k: 'otherSources', label: 'Income from Other Sources (Interest, Dividends etc.)', placeholder: 'e.g. 12000' },
            ].map(f => (
              <div className="form-group" key={f.k}>
                <label className="form-label">{f.label}</label>
                <input type="number" className="form-control" placeholder={f.placeholder} value={form[f.k]} onChange={e => set(f.k, e.target.value)} min="0" />
              </div>
            ))}
            <div style={{ background: '#f0f6ff', borderRadius: 8, padding: 16, marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700, color: 'var(--primary-dark)' }}>
                <span>Gross Total Income</span>
                <span>{fmt(totalIncome())}</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div>
            <h3 className="card-title" style={{ marginBottom: 4 }}>Deductions & Tax Paid</h3>
            {form.regime === 'new' && (
              <div className="alert alert-warning" style={{ fontSize: 12, marginBottom: 16 }}>
                Under New Tax Regime, only Standard Deduction of ₹75,000 is allowed. Other deductions (80C, 80D etc.) are not available.
              </div>
            )}
            {form.regime === 'old' && (
              <>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Enter eligible deductions under Old Tax Regime</p>
                {[
                  { k: 'sec80C', label: 'Section 80C (LIC, PPF, ELSS etc.) — Max ₹1,50,000', max: 150000 },
                  { k: 'sec80D', label: 'Section 80D (Health Insurance Premium) — Max ₹25,000', max: 25000 },
                  { k: 'hra', label: 'HRA Exemption (u/s 10(13A))', max: null },
                ].map(f => (
                  <div className="form-group" key={f.k}>
                    <label className="form-label">{f.label}</label>
                    <input type="number" className="form-control" placeholder="0" value={form[f.k]} onChange={e => set(f.k, e.target.value)} min="0" max={f.max || undefined} />
                  </div>
                ))}
              </>
            )}
            <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary-dark)', margin: '20px 0 12px' }}>Tax Already Paid</h4>
            {[
              { k: 'tdsDeducted', label: 'TDS Deducted (as per Form 16/26AS)' },
              { k: 'advanceTax', label: 'Advance Tax Paid' },
              { k: 'selfAssessmentTax', label: 'Self Assessment Tax Paid (Challan 280)' },
            ].map(f => (
              <div className="form-group" key={f.k}>
                <label className="form-label">{f.label}</label>
                <input type="number" className="form-control" placeholder="0" value={form[f.k]} onChange={e => set(f.k, e.target.value)} min="0" />
              </div>
            ))}
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div>
            <h3 className="card-title" style={{ marginBottom: 20 }}>Tax Computation Summary</h3>
            <div className="calc-result">
              <h3>Tax Computation (AY {form.ay})</h3>
              <div className="calc-breakdown">
                {[
                  ['Gross Income', fmt(totalIncome())],
                  ['Taxable Income', fmt(tax.taxable)],
                  ['Income Tax', fmt(tax.tax)],
                  ['Health & Education Cess (4%)', fmt(tax.cess)],
                ].map(([l, v]) => (
                  <div key={l} className="calc-item">
                    <label>{l}</label>
                    <div className="value" style={{ fontSize: 16 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div className="calc-total">
                <label>Total Tax Payable</label>
                <div className="value">{fmt(tax.total)}</div>
              </div>
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.2)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, opacity: 0.75 }}>Total Tax Paid</label>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#a5d6a7' }}>{fmt(tax.paid)}</div>
                </div>
                {tax.refund > 0 ? (
                  <div>
                    <label style={{ fontSize: 12, opacity: 0.75 }}>Refund Due</label>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#80cbc4' }}>{fmt(tax.refund)}</div>
                  </div>
                ) : tax.due > 0 ? (
                  <div>
                    <label style={{ fontSize: 12, opacity: 0.75 }}>Tax Due (Pay before filing)</label>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#ef9a9a' }}>{fmt(tax.due)}</div>
                  </div>
                ) : (
                  <div>
                    <label style={{ fontSize: 12, opacity: 0.75 }}>Balance</label>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#a5d6a7' }}>Nil</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div>
            <h3 className="card-title" style={{ marginBottom: 20 }}>Review & Submit</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', marginBottom: 20 }}>
              {[
                ['Assessment Year', form.ay],
                ['ITR Form', form.itrForm],
                ['Tax Regime', form.regime === 'new' ? 'New Tax Regime' : 'Old Tax Regime'],
                ['Gross Total Income', fmt(totalIncome())],
                ['Taxable Income', fmt(tax.taxable)],
                ['Total Tax Payable', fmt(tax.total)],
                ['Total Tax Paid', fmt(tax.paid)],
                ['Refund / Tax Due', tax.refund > 0 ? `Refund: ${fmt(tax.refund)}` : tax.due > 0 ? `Due: ${fmt(tax.due)}` : 'Nil'],
              ].map(([k, v], i) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: i % 2 === 0 ? 'white' : '#f8fbff', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                  <strong style={{ color: 'var(--text)' }}>{v}</strong>
                </div>
              ))}
            </div>
            <div className="alert alert-warning" style={{ fontSize: 12 }}>
              ⚠️ By submitting, you declare that the information provided is correct and complete to the best of your knowledge. False declaration is punishable under the Income Tax Act, 1961.
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border-light)' }}>
          <button className="btn btn-secondary" disabled={step === 0} onClick={() => setStep(s => s - 1)}>← Previous</button>
          {step < STEPS.length - 1 ? (
            <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}>Next →</button>
          ) : (
            <button className="btn btn-success btn-lg" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Submitting…' : '✅ Submit Return'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
