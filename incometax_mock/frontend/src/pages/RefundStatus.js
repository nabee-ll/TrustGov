import React, { useState } from 'react';
import axios from 'axios';

const REFUND_STEPS = ['Return Filed', 'ITR Verified', 'Processing', 'Refund Initiated', 'Credited to Bank'];

const statusStepMap = {
  'Initiated': 3,
  'Processing': 2,
  'Credited': 4,
};

export default function RefundStatus() {
  const [pan, setPan] = useState('');
  const [ay, setAy] = useState('2024-25');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!pan) return setError('Please enter your PAN');
    setError('');
    setLoading(true);
    setSearched(false);
    try {
      const res = await axios.post('/api/refund/check', { pan: pan.toUpperCase(), ay });
      setResult(res.data);
      setSearched(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch refund status');
    } finally {
      setLoading(false);
    }
  };

  const currentStep = result?.refund ? (statusStepMap[result.refund.status] ?? 2) : 0;

  return (
    <div className="page" style={{ maxWidth: 800 }}>
      <h1 className="page-title">💰 Refund Status</h1>
      <p className="page-subtitle">Check the status of your Income Tax refund</p>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <span className="card-title">Track Your Refund</span>
        </div>
        <form onSubmit={handleCheck}>
          {error && <div className="alert alert-error">⚠️ {error}</div>}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">PAN <span className="required">*</span></label>
              <input
                className="form-control"
                placeholder="e.g. ABCDE1234F"
                value={pan}
                onChange={e => setPan(e.target.value.toUpperCase())}
                maxLength={10}
              />
              <p className="form-hint">Demo PAN: ABCDE1234F</p>
            </div>
            <div className="form-group">
              <label className="form-label">Assessment Year <span className="required">*</span></label>
              <select className="form-control" value={ay} onChange={e => setAy(e.target.value)}>
                {['2024-25', '2023-24', '2022-23', '2021-22'].map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'Checking…' : '🔍 Check Refund Status'}
          </button>
        </form>
      </div>

      {/* Results */}
      {searched && (
        <div className="card">
          {!result?.refund ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <h3 style={{ fontSize: 16, marginBottom: 8, color: 'var(--text)' }}>No Refund Record Found</h3>
              <p style={{ fontSize: 13 }}>No refund record found for PAN <strong>{pan}</strong> for AY {ay}.</p>
              <p style={{ fontSize: 12, marginTop: 8 }}>This could mean no refund is due, or the return is still being processed.</p>
            </div>
          ) : (
            <div>
              <div className="card-header">
                <span className="card-title">Refund Status — AY {ay}</span>
                <span className={`badge ${result.refund.status === 'Credited' ? 'badge-success' : result.refund.status === 'Initiated' ? 'badge-info' : 'badge-warning'}`}>
                  {result.refund.status}
                </span>
              </div>

              {/* Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
                {[
                  { label: 'Refund Amount', value: `₹${result.refund.amount.toLocaleString('en-IN')}`, color: 'var(--success)' },
                  { label: 'Assessment Year', value: result.refund.ay },
                  { label: 'Status Date', value: result.refund.date },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ background: 'var(--bg)', borderRadius: 8, padding: '14px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{label}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: color || 'var(--primary-dark)' }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Timeline */}
              <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Refund Processing Timeline</h4>
              <div className="refund-timeline">
                {REFUND_STEPS.map((step, i) => (
                  <div key={i} className={`refund-step${i <= currentStep ? ' done' : i === currentStep + 1 ? ' active' : ''}`}>
                    <div className="refund-dot">
                      {i <= currentStep ? '✓' : i + 1}
                    </div>
                    <div className="refund-step-label">{step}</div>
                  </div>
                ))}
              </div>

              {result.refund.status === 'Credited' && (
                <div className="alert alert-success" style={{ marginTop: 20 }}>
                  ✅ Your refund of <strong>₹{result.refund.amount.toLocaleString('en-IN')}</strong> has been successfully credited to your registered bank account.
                </div>
              )}
              {result.refund.status === 'Initiated' && (
                <div className="alert alert-info" style={{ marginTop: 20 }}>
                  ℹ️ Your refund has been initiated. It will be credited to your bank account within 5–7 working days via ECS/NEFT.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Info section */}
      <div className="card" style={{ marginTop: 24, background: '#f0f6ff' }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary-dark)', marginBottom: 12 }}>📌 Important Information</h4>
        <ul style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 2, paddingLeft: 18 }}>
          <li>Refund is processed only after successful e-Verification of ITR.</li>
          <li>Refund amount is directly credited to your pre-validated bank account via ECS/NEFT.</li>
          <li>In case of any discrepancy, refund may be adjusted against outstanding tax demand.</li>
          <li>For queries, contact CPC Bangalore at 1800 103 4455 (Toll Free).</li>
          <li>Refund tracking is updated every 24 hours on this portal.</li>
        </ul>
      </div>
    </div>
  );
}
