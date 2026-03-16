import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/api/user/profile')
      .then(res => { setProfile(res.data.user); setForm(res.data.user); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      const res = await axios.put('/api/user/profile', { email: form.email, mobile: form.mobile, address: form.address });
      setProfile(res.data.user);
      setEditMode(false);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="page" style={{ maxWidth: 760 }}>
      <h1 className="page-title">👤 My Profile</h1>
      <p className="page-subtitle">View and update your registered details</p>

      {success && <div className="alert alert-success">✅ {success}</div>}
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Personal Details (read-only) */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🪪 Personal Details</span>
            <span className="badge badge-info">Verified</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              ['PAN', profile?.pan],
              ['Full Name', profile?.name],
              ['Date of Birth', profile?.dob],
              ['Aadhaar', profile?.aadhaar ? `XXXX-XXXX-${profile.aadhaar.slice(-4)}` : 'Not linked'],
            ].map(([k, v], i) => (
              <div key={k} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 0', borderBottom: i < 3 ? '1px solid var(--border-light)' : 'none', fontSize: 13
              }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{k}</span>
                <strong>{v || '—'}</strong>
              </div>
            ))}
          </div>
          <div className="alert alert-info" style={{ marginTop: 16, fontSize: 12 }}>
            Personal details (PAN, Name, DOB) can only be updated via PAN correction with NSDL/UTIITSL.
          </div>
        </div>

        {/* Contact Details (editable) */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📞 Contact Details</span>
            {!editMode
              ? <button className="btn btn-secondary btn-sm" onClick={() => setEditMode(true)}>✏️ Edit</button>
              : <button className="btn btn-secondary btn-sm" onClick={() => { setEditMode(false); setForm(profile); }}>Cancel</button>
            }
          </div>

          {!editMode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                ['Email', profile?.email],
                ['Mobile', profile?.mobile],
                ['Address', profile?.address || 'Not provided'],
              ].map(([k, v], i) => (
                <div key={k} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '12px 0', borderBottom: i < 2 ? '1px solid var(--border-light)' : 'none', fontSize: 13, gap: 12
                }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 500, flexShrink: 0 }}>{k}</span>
                  <strong style={{ textAlign: 'right' }}>{v}</strong>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-control" value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <input type="tel" className="form-control" value={form.mobile || ''} maxLength={10} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea className="form-control" rows={3} value={form.address || ''} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
              </div>
              <button className="btn btn-primary btn-full" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : '💾 Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Account Security */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-header">
          <span className="card-title">🔐 Account Security</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { icon: '🔑', label: 'Change Password', desc: 'Update your login password', btn: 'Change' },
            { icon: '📱', label: 'Two-Factor Auth', desc: 'Login via OTP on mobile', btn: 'Manage' },
            { icon: '📋', label: 'Login Activity', desc: 'View recent login history', btn: 'View' },
          ].map(item => (
            <div key={item.label} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
              <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{item.label}</h4>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>{item.desc}</p>
              <button className="btn btn-secondary btn-sm">{item.btn}</button>
            </div>
          ))}
        </div>
      </div>

      {/* Registered bank accounts */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-header">
          <span className="card-title">🏦 Pre-validated Bank Accounts</span>
          <button className="btn btn-primary btn-sm">+ Add Account</button>
        </div>
        <div className="alert alert-warning" style={{ fontSize: 12 }}>
          ⚠️ Refund will be credited only to a pre-validated bank account. Please ensure your account is active and linked to your PAN.
        </div>
        <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🏦</div>
          <p style={{ fontSize: 13 }}>No bank accounts added. Add a pre-validated account to receive refunds.</p>
        </div>
      </div>
    </div>
  );
}
