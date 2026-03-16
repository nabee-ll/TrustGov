import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function MyReturns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/tax/returns')
      .then(res => setReturns(res.data.returns))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const fmt = n => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">📄 My Returns</h1>
          <p className="page-subtitle">All your filed Income Tax Returns</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/file-return')}>+ File New Return</button>
      </div>

      {returns.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '56px 24px' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📭</div>
          <h3 style={{ fontSize: 18, marginBottom: 8 }}>No Returns Filed Yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>You haven't filed any Income Tax Return yet.</p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/file-return')}>File Your First Return</button>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="stat-grid" style={{ marginBottom: 24 }}>
            <div className="stat-card">
              <div className="stat-label">Total Returns</div>
              <div className="stat-value">{returns.length}</div>
            </div>
            <div className="stat-card green">
              <div className="stat-label">Total Refund Claimed</div>
              <div className="stat-value">{fmt(returns.reduce((s, r) => s + (r.refundAmount || 0), 0))}</div>
            </div>
            <div className="stat-card yellow">
              <div className="stat-label">Total Tax Paid</div>
              <div className="stat-value">{fmt(returns.reduce((s, r) => s + (r.taxPayable || 0), 0))}</div>
            </div>
          </div>

          {/* Table */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Filed Returns History</span>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>AY</th>
                    <th>Form</th>
                    <th>Filed On</th>
                    <th>Acknowledgement No.</th>
                    <th>Total Income</th>
                    <th>Tax Payable</th>
                    <th>TDS</th>
                    <th>Refund</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {returns.map(r => (
                    <tr key={r.id}>
                      <td><strong>{r.ay}</strong></td>
                      <td><span className="badge badge-info">{r.form}</span></td>
                      <td>{r.filedOn}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--primary)' }}>{r.ackNo}</td>
                      <td>{fmt(r.totalIncome)}</td>
                      <td>{fmt(r.taxPayable)}</td>
                      <td>{fmt(r.tdsDeducted)}</td>
                      <td style={{ color: r.refundAmount > 0 ? 'var(--success)' : 'var(--text-muted)', fontWeight: r.refundAmount > 0 ? 700 : 400 }}>
                        {r.refundAmount > 0 ? fmt(r.refundAmount) : '—'}
                      </td>
                      <td>
                        <span className={`badge ${
                          r.status === 'Processed' ? 'badge-success' :
                          r.status.includes('Filed') ? 'badge-info' : 'badge-warning'
                        }`}>{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Per return detail cards */}
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {returns.map(r => (
              <div key={r.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary-dark)' }}>AY {r.ay} — {r.form}</h3>
                      <span className={`badge ${r.status === 'Processed' ? 'badge-success' : 'badge-info'}`}>{r.status}</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Ack: <code>{r.ackNo}</code> &nbsp;|&nbsp; Filed: {r.filedOn}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 20, textAlign: 'right', flexWrap: 'wrap' }}>
                    {[
                      ['Total Income', fmt(r.totalIncome)],
                      ['Tax Payable', fmt(r.taxPayable)],
                      ['Refund', r.refundAmount > 0 ? fmt(r.refundAmount) : 'Nil'],
                    ].map(([l, v]) => (
                      <div key={l}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{l}</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: l === 'Refund' && r.refundAmount > 0 ? 'var(--success)' : 'var(--text)' }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
