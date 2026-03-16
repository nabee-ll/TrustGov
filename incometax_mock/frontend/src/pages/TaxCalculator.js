import React, { useState } from 'react';
import axios from 'axios';

export default function TaxCalculator() {
  const [form, setForm] = useState({
    income: '',
    regime: 'new',
    age: '30',
    sec80C: '',
    sec80D: '',
    hra: '',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCalculate = async () => {
    if (!form.income) return setError('Please enter your annual income');
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/tax/calculate', {
        income: parseFloat(form.income),
        regime: form.regime,
        age: parseInt(form.age),
        deductions: {
          sec80C: parseFloat(form.sec80C) || 0,
          sec80D: parseFloat(form.sec80D) || 0,
          hra: parseFloat(form.hra) || 0,
        },
      });
      setResult(res.data.calculation);
    } catch (err) {
      setError(err.response?.data?.message || 'Calculation failed');
    } finally {
      setLoading(false);
    }
  };

  const fmt = n => `₹${Number(n || 0).toLocaleString('en-IN')}`;
  const effectiveRate = result ? ((result.totalTax / result.grossIncome) * 100).toFixed(2) : null;

  return (
    <div className="page" style={{ maxWidth: 900 }}>
      <h1 className="page-title">🧮 Income Tax Calculator</h1>
      <p className="page-subtitle">Calculate your income tax liability for AY 2024-25 (FY 2023-24)</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Input */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Enter Your Details</span>
          </div>

          {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>⚠️ {error}</div>}

          <div className="form-group">
            <label className="form-label">Annual Income (₹) <span className="required">*</span></label>
            <input
              type="number"
              className="form-control"
              placeholder="e.g. 850000"
              value={form.income}
              onChange={e => set('income', e.target.value)}
              min="0"
            />
            <p className="form-hint">Enter gross total income before deductions</p>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Tax Regime</label>
              <select className="form-control" value={form.regime} onChange={e => set('regime', e.target.value)}>
                <option value="new">New Regime</option>
                <option value="old">Old Regime</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Age</label>
              <select className="form-control" value={form.age} onChange={e => set('age', e.target.value)}>
                <option value="30">Below 60</option>
                <option value="65">60–79 (Senior Citizen)</option>
                <option value="82">80+ (Super Senior)</option>
              </select>
            </div>
          </div>

          {form.regime === 'old' && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary-dark)', margin: '12px 0 12px', paddingBottom: 8, borderBottom: '1px solid var(--border-light)' }}>
                Deductions (Old Regime)
              </div>
              {[
                { k: 'sec80C', label: '80C — PF, LIC, ELSS, etc. (Max ₹1.5L)', max: 150000 },
                { k: 'sec80D', label: '80D — Health Insurance (Max ₹25,000)', max: 25000 },
                { k: 'hra', label: 'HRA Exemption (u/s 10(13A))', max: null },
              ].map(f => (
                <div className="form-group" key={f.k}>
                  <label className="form-label">{f.label}</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="0"
                    value={form[f.k]}
                    onChange={e => set(f.k, e.target.value)}
                    min="0"
                    max={f.max || undefined}
                  />
                </div>
              ))}
            </div>
          )}

          {form.regime === 'new' && (
            <div className="alert alert-info" style={{ fontSize: 12 }}>
              Under New Regime, standard deduction of ₹75,000 is automatically applied. Section 80C/80D deductions are not available.
            </div>
          )}

          <button className="btn btn-primary btn-full btn-lg" onClick={handleCalculate} disabled={loading}>
            {loading ? 'Calculating…' : '🧮 Calculate Tax'}
          </button>
        </div>

        {/* Result */}
        <div>
          {!result ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🧮</div>
              <h3 style={{ fontSize: 16, marginBottom: 8, color: 'var(--text)' }}>Enter your income details</h3>
              <p style={{ fontSize: 13 }}>Your tax computation will appear here</p>
            </div>
          ) : (
            <div>
              <div className="calc-result">
                <h3>Tax Summary — AY 2024-25</h3>
                <div className="calc-breakdown">
                  {[
                    ['Gross Income', fmt(result.grossIncome)],
                    ['Taxable Income', fmt(result.taxableIncome)],
                    ['Income Tax', fmt(result.tax)],
                    ['Cess (4%)', fmt(result.cess)],
                  ].map(([l, v]) => (
                    <div key={l} className="calc-item">
                      <label>{l}</label>
                      <div className="value" style={{ fontSize: 16 }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div className="calc-total">
                  <label>Total Tax Payable</label>
                  <div className="value">{fmt(result.totalTax)}</div>
                </div>
                <div style={{ marginTop: 12, padding: '10px 0 0', borderTop: '1px solid rgba(255,255,255,0.2)', display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ opacity: 0.8 }}>Effective Tax Rate</span>
                  <strong style={{ color: 'var(--accent)', fontSize: 16 }}>{effectiveRate}%</strong>
                </div>
              </div>

              {/* Deduction breakdown */}
              {result.appliedDeductions && (
                <div className="card" style={{ marginTop: 16 }}>
                  <div className="card-header">
                    <span className="card-title">📋 Deductions Applied</span>
                  </div>
                  <div style={{ fontSize: 13 }}>
                    {Object.entries(result.appliedDeductions)
                      .filter(([k]) => k !== 'total')
                      .map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                          <span style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1')}</span>
                          <strong>{fmt(v)}</strong>
                        </div>
                      ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', fontWeight: 700, color: 'var(--primary-dark)' }}>
                      <span>Total Deductions</span>
                      <span>{fmt(result.appliedDeductions.total)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Regime comparison hint */}
              <div className="alert alert-info" style={{ marginTop: 16, fontSize: 12 }}>
                💡 Tip: Switch between <strong>New</strong> and <strong>Old</strong> regime to compare which gives you lower tax liability.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slab Table */}
      <div className="card" style={{ marginTop: 28 }}>
        <div className="card-header">
          <span className="card-title">📊 Tax Slabs — AY 2024-25</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)', marginBottom: 10 }}>New Tax Regime</h4>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Income Slab</th><th>Rate</th></tr></thead>
                <tbody>
                  {[
                    ['Up to ₹3,00,000', 'Nil'],
                    ['₹3,00,001 – ₹7,00,000', '5%'],
                    ['₹7,00,001 – ₹10,00,000', '10%'],
                    ['₹10,00,001 – ₹12,00,000', '15%'],
                    ['₹12,00,001 – ₹15,00,000', '20%'],
                    ['Above ₹15,00,000', '30%'],
                  ].map(([s, r]) => (
                    <tr key={s}><td>{s}</td><td><span className="badge badge-info">{r}</span></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>* Rebate u/s 87A for income ≤ ₹7L — tax = Nil</p>
          </div>
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)', marginBottom: 10 }}>Old Tax Regime (Below 60 years)</h4>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Income Slab</th><th>Rate</th></tr></thead>
                <tbody>
                  {[
                    ['Up to ₹2,50,000', 'Nil'],
                    ['₹2,50,001 – ₹5,00,000', '5%'],
                    ['₹5,00,001 – ₹10,00,000', '20%'],
                    ['Above ₹10,00,000', '30%'],
                  ].map(([s, r]) => (
                    <tr key={s}><td>{s}</td><td><span className="badge badge-warning">{r}</span></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>* Plus 4% Health & Education Cess on tax</p>
          </div>
        </div>
      </div>
    </div>
  );
}
