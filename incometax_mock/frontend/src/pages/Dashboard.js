import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [returns, setReturns] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [ais, setAis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [profileRes, returnsRes, refundsRes, aisRes] = await Promise.all([
          axios.get('/api/user/profile'),
          axios.get('/api/tax/returns'),
          axios.get('/api/refund/status'),
          axios.get('/api/tax/ais'),
        ]);
        setProfile(profileRes.data.user);
        setReturns(returnsRes.data.returns);
        setRefunds(refundsRes.data.refunds);
        setAis(aisRes.data.ais);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

  const latestReturn = returns[0];
  const pendingRefund = refunds.find(r => r.status !== 'Credited');

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">👋 Welcome, {profile?.name}</h1>
          <p className="page-subtitle">PAN: {profile?.pan} &nbsp;|&nbsp; Last login: Today</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/file-return')}>
          + File New Return
        </button>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Total Returns Filed</div>
          <div className="stat-value">{returns.length}</div>
          <div className="stat-sub">Since registration</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Latest AY</div>
          <div className="stat-value">{latestReturn?.ay || '—'}</div>
          <div className="stat-sub">{latestReturn?.status || 'No return filed'}</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-label">Pending Refund</div>
          <div className="stat-value">₹{pendingRefund ? pendingRefund.amount.toLocaleString('en-IN') : '0'}</div>
          <div className="stat-sub">{pendingRefund?.status || 'No pending refund'}</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-label">TDS Deducted (AY 24-25)</div>
          <div className="stat-value">₹{ais?.tdsDeducted?.toLocaleString('en-IN') || '0'}</div>
          <div className="stat-sub">As per Form 26AS</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        {/* Left col */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Quick actions */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">⚡ Quick Actions</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { icon: '📄', label: 'File Return', action: () => navigate('/file-return') },
                { icon: '📊', label: 'My Returns', action: () => navigate('/my-returns') },
                { icon: '💰', label: 'Refund Status', action: () => navigate('/refund-status') },
                { icon: '🧮', label: 'Tax Calculator', action: () => navigate('/tax-calculator') },
                { icon: '👤', label: 'My Profile', action: () => navigate('/profile') },
                { icon: '📋', label: 'AIS / 26AS', action: () => {} },
              ].map((a, i) => (
                <button key={i} onClick={a.action} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  padding: '16px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                  background: 'var(--bg)', cursor: 'pointer', transition: 'all 0.2s', fontSize: 12, fontWeight: 500
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)'; }}
                >
                  <span style={{ fontSize: 24 }}>{a.icon}</span>
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recent returns */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">📄 Recent Returns</span>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/my-returns')}>View All</button>
            </div>
            {returns.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                <p>No returns filed yet.</p>
                <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => navigate('/file-return')}>File Your First Return</button>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>AY</th><th>Form</th><th>Filed On</th><th>Ack No.</th><th>Status</th><th>Refund</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returns.map(r => (
                      <tr key={r.id}>
                        <td><strong>{r.ay}</strong></td>
                        <td>{r.form}</td>
                        <td>{r.filedOn}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.ackNo}</td>
                        <td>
                          <span className={`badge ${r.status.includes('Processed') ? 'badge-success' : r.status.includes('Filed') ? 'badge-info' : 'badge-warning'}`}>
                            {r.status}
                          </span>
                        </td>
                        <td>{r.refundAmount > 0 ? `₹${r.refundAmount.toLocaleString('en-IN')}` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right col */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* AIS Summary */}
          {ais && (
            <div className="card">
              <div className="card-header">
                <span className="card-title">📊 AIS Summary (AY {ais.ay})</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Salary Income', value: ais.salary },
                  { label: 'Interest Income', value: ais.interestIncome },
                  { label: 'Dividend Income', value: ais.dividends },
                  { label: 'TDS Deducted', value: ais.tdsDeducted },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 3 ? '1px solid var(--border-light)' : 'none', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                    <strong style={{ color: 'var(--primary-dark)' }}>₹{item.value?.toLocaleString('en-IN')}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Profile summary */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">👤 Profile Summary</span>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/profile')}>Edit</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
              {[
                ['Name', profile?.name],
                ['PAN', profile?.pan],
                ['Email', profile?.email],
                ['Mobile', profile?.mobile],
                ['DOB', profile?.dob],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                  <strong style={{ color: 'var(--text)' }}>{v || '—'}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Refund tracker */}
          {refunds.length > 0 && (
            <div className="card">
              <div className="card-header">
                <span className="card-title">💰 Refund Status</span>
              </div>
              {refunds.slice(0, 2).map(r => (
                <div key={r.id} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                    <span>AY {r.ay}</span>
                    <strong style={{ color: 'var(--primary)' }}>₹{r.amount.toLocaleString('en-IN')}</strong>
                  </div>
                  <span className={`badge ${r.status === 'Credited' ? 'badge-success' : r.status === 'Initiated' ? 'badge-info' : 'badge-warning'}`}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
