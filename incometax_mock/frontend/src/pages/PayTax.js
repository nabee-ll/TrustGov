import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TAX_TYPES = [
  { value: 'self_assessment', label: 'Self-Assessment Tax (300)', description: 'Tax paid after filing return if tax is still due' },
  { value: 'advance', label: 'Advance Tax (100)', description: 'Tax paid in instalments before year-end' },
  { value: 'tds_tcs', label: 'TDS / TCS (200)', description: 'Tax deducted/collected at source' },
  { value: 'tax_on_regular_assessment', label: 'Tax on Regular Assessment (400)', description: 'Tax payable after an ITD assessment order' },
];

const PAY_MODES = [
  { value: 'net_banking', label: '🌐 Net Banking' },
  { value: 'upi', label: '📱 UPI' },
  { value: 'debit_card', label: '💳 Debit Card' },
  { value: 'credit_card', label: '💳 Credit Card' },
  { value: 'neft_rtgs', label: '🏦 NEFT / RTGS' },
];

const BANKS = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Punjab National Bank', 'Bank of Baroda', 'Kotak Mahindra Bank', 'IndusInd Bank'];

const AY_OPTIONS = ['2025-26', '2024-25', '2023-24', '2022-23', '2021-22'];

export default function PayTax() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [challan, setChallan] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    pan: '',
    name: '',
    ay: '2025-26',
    taxType: 'self_assessment',
    payMode: 'upi',
    bank: '',
    upiId: '',
    // Amount breakup
    incomeTax: '',
    surcharge: '',
    educationCess: '',
    interest234A: '',
    interest234B: '',
    interest234C: '',
    penalty: '',
    others: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const total = () => {
    const fields = ['incomeTax', 'surcharge', 'educationCess', 'interest234A', 'interest234B', 'interest234C', 'penalty', 'others'];
    return fields.reduce((sum, f) => sum + (parseFloat(form[f]) || 0), 0);
  };

  const handleProceed = () => {
    if (!form.pan || !form.name || !form.ay || !form.taxType) {
      setError('Please fill all required fields.'); return;
    }
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.pan.toUpperCase())) {
      setError('Please enter a valid 10-character PAN (e.g. ABCDE1234F).'); return;
    }
    if (total() <= 0) {
      setError('Please enter at least one tax amount.'); return;
    }
    if (form.payMode === 'net_banking' && !form.bank) {
      setError('Please select a bank for Net Banking.'); return;
    }
    if (form.payMode === 'upi' && !form.upiId) {
      setError('Please enter your UPI ID.'); return;
    }
    setError('');
    setStep(2);
  };

  const handlePay = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        pan: form.pan.toUpperCase(),
        name: form.name,
        ay: form.ay,
        taxType: form.taxType,
        payMode: form.payMode,
        bank: form.bank,
        amounts: {
          incomeTax: parseFloat(form.incomeTax) || 0,
          surcharge: parseFloat(form.surcharge) || 0,
          educationCess: parseFloat(form.educationCess) || 0,
          interest234A: parseFloat(form.interest234A) || 0,
          interest234B: parseFloat(form.interest234B) || 0,
          interest234C: parseFloat(form.interest234C) || 0,
          penalty: parseFloat(form.penalty) || 0,
          others: parseFloat(form.others) || 0,
          total: total(),
        },
      };
      const res = await axios.post('/api/tax/pay', payload);
      setChallan(res.data.challan);
      setSuccess(true);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n) => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <div className="page">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">💳 Pay Income Tax</h1>
        <p className="page-subtitle">Create and pay your challan online — Self-Assessment, Advance Tax, TDS &amp; more</p>
      </div>

      {/* Steps bar */}
      <div className="steps" style={{ marginBottom: 32 }}>
        {[
          { n: 1, label: 'Enter Details' },
          { n: 2, label: 'Review & Pay' },
          { n: 3, label: 'Challan Receipt' },
        ].map((s, i, arr) => (
          <React.Fragment key={s.n}>
            <div className={`step ${step === s.n ? 'active' : step > s.n ? 'done' : ''}`}>
              <div className="step-circle">{step > s.n ? '✓' : s.n}</div>
              <span className="step-label">{s.label}</span>
            </div>
            {i < arr.length - 1 && <div className="step-line" />}
          </React.Fragment>
        ))}
      </div>

      {/* ── STEP 1: FORM ── */}
      {step === 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Taxpayer Info */}
            <div className="card">
              <div className="card-header"><span className="card-title">👤 Taxpayer Details</span></div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">PAN <span className="required">*</span></label>
                  <input className="form-control" value={form.pan} onChange={e => set('pan', e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F" maxLength={10} style={{ textTransform: 'uppercase', letterSpacing: 2 }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Full Name (as per PAN) <span className="required">*</span></label>
                  <input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Ramesh Kumar" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Assessment Year <span className="required">*</span></label>
                  <select className="form-control" value={form.ay} onChange={e => set('ay', e.target.value)}>
                    {AY_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Tax Type <span className="required">*</span></label>
                  <select className="form-control" value={form.taxType} onChange={e => set('taxType', e.target.value)}>
                    {TAX_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <p className="form-hint">{TAX_TYPES.find(t => t.value === form.taxType)?.description}</p>
                </div>
              </div>
            </div>

            {/* Amount Breakup */}
            <div className="card">
              <div className="card-header"><span className="card-title">₹ Tax Amount Breakup</span></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { key: 'incomeTax', label: 'Income Tax' },
                  { key: 'surcharge', label: 'Surcharge' },
                  { key: 'educationCess', label: 'Education Cess (4%)' },
                  { key: 'interest234A', label: 'Interest u/s 234A' },
                  { key: 'interest234B', label: 'Interest u/s 234B' },
                  { key: 'interest234C', label: 'Interest u/s 234C' },
                  { key: 'penalty', label: 'Penalty' },
                  { key: 'others', label: 'Others' },
                ].map(({ key, label }) => (
                  <div className="form-group" key={key} style={{ marginBottom: 12 }}>
                    <label className="form-label">{label} (₹)</label>
                    <input className="form-control" type="number" min="0" value={form[key]}
                      onChange={e => set(key, e.target.value)} placeholder="0" />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8, padding: '12px 0', borderTop: '2px solid var(--border)' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>TOTAL AMOUNT PAYABLE</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)' }}>{fmt(total())}</div>
                </div>
              </div>
            </div>

            {/* Payment Mode */}
            <div className="card">
              <div className="card-header"><span className="card-title">🏧 Payment Mode</span></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
                {PAY_MODES.map(m => (
                  <button key={m.value} onClick={() => set('payMode', m.value)} style={{
                    padding: '12px 8px', border: `2px solid ${form.payMode === m.value ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius)', background: form.payMode === m.value ? '#e8f0fe' : 'white',
                    color: form.payMode === m.value ? 'var(--primary)' : 'var(--text)',
                    fontWeight: form.payMode === m.value ? 700 : 500, fontSize: 12, cursor: 'pointer', transition: 'all 0.2s'
                  }}>{m.label}</button>
                ))}
              </div>

              {form.payMode === 'net_banking' && (
                <div className="form-group">
                  <label className="form-label">Select Bank <span className="required">*</span></label>
                  <select className="form-control" value={form.bank} onChange={e => set('bank', e.target.value)}>
                    <option value="">-- Select Bank --</option>
                    {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              )}
              {form.payMode === 'upi' && (
                <div className="form-group">
                  <label className="form-label">UPI ID <span className="required">*</span></label>
                  <input className="form-control" value={form.upiId} onChange={e => set('upiId', e.target.value)} placeholder="yourname@upi" />
                  <p className="form-hint">e.g. demo@okaxis, 9876543210@paytm</p>
                </div>
              )}
            </div>

            {error && <div className="alert alert-error">⚠️ {error}</div>}

            <button className="btn btn-primary btn-lg" onClick={handleProceed} style={{ alignSelf: 'flex-start' }}>
              Proceed to Review →
            </button>
          </div>

          {/* Right sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div className="card-header"><span className="card-title">ℹ️ Important Notes</span></div>
              <ul style={{ paddingLeft: 18, fontSize: 13, color: 'var(--text-muted)', lineHeight: 2 }}>
                <li>Use <strong>Challan ITNS 280</strong> for paying income tax</li>
                <li>Keep the Challan Identification Number (CIN) safe</li>
                <li>Advance tax due dates: Jun 15, Sep 15, Dec 15, Mar 15</li>
                <li>Self-assessment tax must be paid before filing return</li>
                <li>Interest u/s 234B/C applies if advance tax is insufficient</li>
              </ul>
            </div>
            <div className="card" style={{ background: 'linear-gradient(135deg,var(--primary-dark),var(--primary))', color: 'white', border: 'none' }}>
              <div style={{ fontSize: 13, lineHeight: 1.8 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>📞 Helpdesk</div>
                <div>Toll Free: <strong>1800-103-0025</strong></div>
                <div>Email: <strong>efiling@incometax.gov.in</strong></div>
                <div style={{ marginTop: 8, opacity: 0.8, fontSize: 12 }}>Mon–Sat: 8 AM – 8 PM</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2: REVIEW ── */}
      {step === 2 && (
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div className="card">
            <div className="card-header">
              <span className="card-title">🔍 Review Payment Details</span>
              <button className="btn btn-secondary btn-sm" onClick={() => setStep(1)}>← Edit</button>
            </div>

            <div className="alert alert-warning">⚠️ Please verify all details carefully. Tax payments cannot be reversed once submitted.</div>

            <table style={{ width: '100%', marginBottom: 20 }}>
              <tbody>
                {[
                  ['PAN', form.pan.toUpperCase()],
                  ['Name', form.name],
                  ['Assessment Year', form.ay],
                  ['Tax Type', TAX_TYPES.find(t => t.value === form.taxType)?.label],
                  ['Payment Mode', PAY_MODES.find(m => m.value === form.payMode)?.label],
                  form.payMode === 'net_banking' ? ['Bank', form.bank] : null,
                  form.payMode === 'upi' ? ['UPI ID', form.upiId] : null,
                ].filter(Boolean).map(([k, v]) => (
                  <tr key={k} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '10px 4px', color: 'var(--text-muted)', fontSize: 13, width: '40%' }}>{k}</td>
                    <td style={{ padding: '10px 4px', fontWeight: 600, fontSize: 13 }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius)', padding: 16, marginBottom: 20 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10, color: 'var(--primary-dark)' }}>Amount Breakup</div>
              {[
                ['Income Tax', form.incomeTax],
                ['Surcharge', form.surcharge],
                ['Education Cess', form.educationCess],
                ['Interest u/s 234A', form.interest234A],
                ['Interest u/s 234B', form.interest234B],
                ['Interest u/s 234C', form.interest234C],
                ['Penalty', form.penalty],
                ['Others', form.others],
              ].filter(([, v]) => parseFloat(v) > 0).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                  <span>{fmt(v)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 18, padding: '12px 0 4px', color: 'var(--primary)', marginTop: 6 }}>
                <span>Total Payable</span>
                <span>{fmt(total())}</span>
              </div>
            </div>

            {error && <div className="alert alert-error">⚠️ {error}</div>}

            <button className="btn btn-success btn-lg btn-full" onClick={handlePay} disabled={loading}>
              {loading ? '⏳ Processing Payment...' : `✅ Pay ${fmt(total())} Now`}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: SUCCESS + CHALLAN ── */}
      {step === 3 && challan && (
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div className="card">
            <div style={{ textAlign: 'center', padding: '20px 0 28px' }}>
              <div style={{ fontSize: 64, marginBottom: 12 }}>🎉</div>
              <h2 style={{ color: 'var(--success)', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Payment Successful!</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Your tax payment has been recorded. Save the challan below for your records.</p>
            </div>

            {/* Challan receipt */}
            <div style={{ border: '2px solid var(--primary)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <div style={{ background: 'var(--primary-dark)', color: 'white', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>CHALLAN ITNS 280</div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Income Tax Department – Government of India</div>
                </div>
                <div style={{ textAlign: 'right', fontSize: 12 }}>
                  <div style={{ opacity: 0.8 }}>Challan Date</div>
                  <div style={{ fontWeight: 700 }}>{challan.date}</div>
                </div>
              </div>

              <div style={{ padding: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                  {[
                    ['CIN (Challan ID)', challan.cin],
                    ['PAN', challan.pan],
                    ['Name', challan.name],
                    ['Assessment Year', challan.ay],
                    ['Tax Type', TAX_TYPES.find(t => t.value === challan.taxType)?.label],
                    ['Bank Reference', challan.bankRef],
                    ['Payment Mode', PAY_MODES.find(m => m.value === challan.payMode)?.label],
                    ['Status', '✅ SUCCESS'],
                  ].map(([k, v]) => (
                    <div key={k} style={{ padding: '10px 14px', background: 'var(--bg)', borderRadius: 'var(--radius)' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4 }}>{k}</div>
                      <div style={{ fontWeight: 700, fontSize: 13, wordBreak: 'break-all', color: k === 'Status' ? 'var(--success)' : 'var(--text)' }}>{v}</div>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '2px dashed var(--border)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>AMOUNT PAID</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--primary)' }}>{fmt(challan.amount)}</div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-muted)' }}>
                    <div>This is a computer-generated receipt</div>
                    <div>No signature required</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button className="btn btn-primary" onClick={() => window.print()}>🖨️ Print Challan</button>
              <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
              <button className="btn btn-secondary" onClick={() => { setStep(1); setChallan(null); setForm({ pan:'',name:'',ay:'2025-26',taxType:'self_assessment',payMode:'upi',bank:'',upiId:'',incomeTax:'',surcharge:'',educationCess:'',interest234A:'',interest234B:'',interest234C:'',penalty:'',others:'' }); }}>
                Pay Another Tax
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
