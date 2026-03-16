// ── TrackAndDashboard.jsx ─────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackAPI, applicationsAPI, appointmentsAPI, authAPI } from '../api';
import { useToast, Spinner } from '../components/UI';
import { useAuth } from '../context/AuthContext';

export function Track() {
  const [arn, setArn] = useState('AP25031600001');
  const [dob, setDob] = useState('1990-01-15');
  const [office, setOffice] = useState('Chennai');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const doTrack = async () => {
    if (!arn || !dob) { toast('Please fill ARN and Date of Birth', 'error'); return; }
    setLoading(true);
    try {
      const { data } = await trackAPI.track(arn, dob);
      setResult(data.application);
    } catch (err) {
      toast(err.response?.data?.message || 'Application not found', 'error');
      setResult(null);
    } finally { setLoading(false); }
  };

  return (
    <div className="page-content">
      <div className="container">
        <h2 className="section-title">Track Application Status</h2>
        <p className="section-sub">Enter your ARN and Date of Birth to track your passport application.</p>
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header saffron">🔍 Enter Details</div>
          <div className="card-body">
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: 200 }}>
                <label>Application Reference Number (ARN) <span className="req">*</span></label>
                <input className="form-control" value={arn} onChange={e => setArn(e.target.value)} placeholder="e.g. AP25031600001" />
              </div>
              <div className="form-group" style={{ marginBottom: 0, minWidth: 160 }}>
                <label>Date of Birth <span className="req">*</span></label>
                <input className="form-control" type="date" value={dob} onChange={e => setDob(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0, minWidth: 180 }}>
                <label>Passport Office</label>
                <select className="form-control" value={office} onChange={e => setOffice(e.target.value)}>
                  {['Chennai', 'Bengaluru', 'Mumbai', 'Delhi', 'Kolkata', 'Hyderabad'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div style={{ paddingBottom: 16 }}>
                <button className="btn btn-saffron" onClick={doTrack} disabled={loading}>{loading ? 'Tracking...' : '🔍 Track Now'}</button>
              </div>
            </div>
            <div className="alert alert-info" style={{ marginBottom: 0, marginTop: 12 }}>
              <span>💡</span> Demo: Try ARN <strong>AP25031600001</strong> with DOB <strong>1990-01-15</strong>
            </div>
          </div>
        </div>

        {loading && <Spinner />}

        {result && (
          <div className="card">
            <div className="card-header navy">📍 Status — {result.arn}</div>
            <div className="card-body">
              <div className="form-row cols-3" style={{ marginBottom: 20 }}>
                {[['Service', result.serviceType], ['Applied On', new Date(result.appliedOn).toLocaleDateString('en-IN')], ['Expected Date', result.expectedDate], ['Office', result.office], ['Status', result.status], ['Payment', result.paymentStatus]].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: 11, color: '#475569', textTransform: 'uppercase', fontWeight: 600 }}>{k}</div>
                    <div style={{ fontWeight: 700, marginTop: 2 }}>{k === 'Status' ? <span className={`badge badge-${v?.toLowerCase()}`}>{v}</span> : v}</div>
                  </div>
                ))}
              </div>
              <div className="progress-bar" style={{ marginBottom: 24 }}>
                <div className="progress-fill" style={{ width: `${result.progress || 33}%` }} />
              </div>
              <div className="timeline">
                {result.timeline?.map((t, i) => {
                  const allDone = result.timeline.slice(0, i).every(x => x.done);
                  const isActive = !t.done && allDone;
                  return (
                    <div key={i} className="timeline-step">
                      <div className={`timeline-dot ${t.done ? 'done' : isActive ? 'active' : ''}`}>
                        {t.done ? '✓' : isActive ? '⚙' : i + 1}
                      </div>
                      <div className="timeline-info">
                        <h4>{t.step}</h4>
                        <p>{t.date ? new Date(t.date).toLocaleString('en-IN') : 'Pending'}{t.note ? ` — ${t.note}` : ''}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Dashboard.jsx ─────────────────────────────────────────────

export function Dashboard() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [tab, setTab] = useState('overview');
  const [apps, setApps] = useState([]);
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', mobile: user?.mobile || '' });

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    Promise.all([applicationsAPI.getAll(), appointmentsAPI.getAll()])
      .then(([a, b]) => { setApps(a.data.applications); setAppts(b.data.appointments); })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [user]);

  const saveProfile = async () => {
    try {
      const { data } = await authAPI.updateProfile(profile);
      setUser(data.user);
      toast('Profile updated!', 'success');
    } catch { toast('Update failed', 'error'); }
  };

  const cancelAppt = async (id) => {
    try {
      await appointmentsAPI.cancel(id);
      setAppts(a => a.filter(x => x.id !== id));
      toast('Appointment cancelled', 'info');
    } catch { toast('Cancel failed', 'error'); }
  };

  const TABS = [['overview', '🏠', 'Overview'], ['applications', '📋', 'My Applications'], ['appointments', '🗓️', 'Appointments'], ['documents', '📁', 'Documents'], ['profile', '⚙️', 'Profile']];

  const statusClass = s => {
    const m = { Processing: 'processing', Granted: 'granted', Submitted: 'submitted', Dispatched: 'dispatched', Pending: 'pending', Paid: 'paid' };
    return `badge badge-${m[s] || 'pending'}`;
  };

  return (
    <div className="page-content">
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 20, minHeight: 500 }}>
          {/* Sidebar */}
          <div className="card" style={{ height: 'fit-content' }}>
            <div style={{ background: 'linear-gradient(135deg,#001f4d,#003580)', padding: 20, textAlign: 'center', color: 'white' }}>
              <div style={{ width: 60, height: 60, background: 'rgba(255,255,255,0.2)', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, margin: '0 auto 10px' }}>👤</div>
              <div style={{ fontWeight: 700 }}>{user?.firstName} {user?.lastName}</div>
              <div style={{ fontSize: 11, color: '#a8c4f0' }}>{user?.email}</div>
            </div>
            <div>
              {TABS.map(([id, icon, label]) => (
                <button key={id} onClick={() => setTab(id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', background: tab === id ? '#dbeafe' : 'transparent', color: tab === id ? '#003580' : '#0f172a', border: 'none', borderBottom: '1px solid #d0d9ec', width: '100%', textAlign: 'left', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                  <span>{icon}</span> {label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            {loading ? <Spinner /> : (
              <>
                {tab === 'overview' && (
                  <>
                    <div style={{ background: 'linear-gradient(135deg,#001f4d,#1254b5)', color: 'white', borderRadius: 12, padding: '20px 24px', marginBottom: 20 }}>
                      <h3 style={{ fontFamily: 'DM Serif Display', fontSize: 20, marginBottom: 4 }}>Good day, {user?.firstName}! 👋</h3>
                      <p style={{ color: '#a8c4f0', fontSize: 13 }}>Welcome to your Passport Seva dashboard.</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
                      {[['🆕', 'Apply New', '/apply/new'], ['📍', 'Track App', '/track'], ['🗓️', 'Book Appt', '/appointment'], ['📢', 'Grievance', '/grievance']].map(([icon, label, path]) => (
                        <div key={label} onClick={() => navigate(path)} style={{ background: 'white', border: '1.5px solid #d0d9ec', borderRadius: 8, padding: '16px 12px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = '#003580'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = '#d0d9ec'; e.currentTarget.style.transform = ''; }}>
                          <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#003580' }}>{label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="card">
                      <div className="card-header navy">📋 Recent Applications</div>
                      <div className="card-body table-wrap">
                        {apps.length === 0 ? <p style={{ color: '#475569', textAlign: 'center', padding: 20 }}>No applications yet. <button className="btn btn-primary btn-sm" onClick={() => navigate('/apply/new')}>Apply Now</button></p> : (
                          <table><thead><tr><th>ARN</th><th>Type</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
                            <tbody>{apps.map(a => (
                              <tr key={a.id}><td><strong>{a.arn}</strong></td><td>{a.serviceType}</td><td>{new Date(a.appliedOn).toLocaleDateString('en-IN')}</td>
                                <td><span className={statusClass(a.status)}>{a.status}</span></td>
                                <td><button className="btn btn-outline btn-sm" onClick={() => navigate('/track')}>Track</button></td></tr>
                            ))}</tbody></table>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {tab === 'applications' && (
                  <>
                    <h2 className="section-title">My Applications</h2>
                    <p className="section-sub">All your passport applications</p>
                    <div className="card">
                      <div className="card-body table-wrap">
                        {apps.length === 0 ? <p style={{ color: '#475569', padding: 20, textAlign: 'center' }}>No applications found.</p> : (
                          <table><thead><tr><th>ARN</th><th>Service</th><th>Applied On</th><th>Office</th><th>Status</th><th>Payment</th></tr></thead>
                            <tbody>{apps.map(a => (
                              <tr key={a.id}><td><strong>{a.arn}</strong></td><td>{a.serviceType}</td><td>{new Date(a.appliedOn).toLocaleDateString('en-IN')}</td>
                                <td>{a.office}</td>
                                <td><span className={statusClass(a.status)}>{a.status}</span></td>
                                <td><span className={statusClass(a.paymentStatus)}>{a.paymentStatus}</span></td></tr>
                            ))}</tbody></table>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {tab === 'appointments' && (
                  <>
                    <h2 className="section-title">My Appointments</h2>
                    <p className="section-sub">Upcoming and past PSK appointments</p>
                    <div className="card">
                      <div className="card-body">
                        {appts.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: 20 }}>
                            <p style={{ color: '#475569', marginBottom: 12 }}>No appointments booked.</p>
                            <button className="btn btn-primary btn-sm" onClick={() => navigate('/appointment')}>Book Appointment</button>
                          </div>
                        ) : (
                          <div className="table-wrap">
                            <table><thead><tr><th>ARN</th><th>Office</th><th>Date</th><th>Time</th><th>Token</th><th>Status</th><th>Action</th></tr></thead>
                              <tbody>{appts.map(a => (
                                <tr key={a.id}><td>{a.arn || '—'}</td><td>{a.office}</td><td>{a.date}</td><td>{a.time}</td>
                                  <td>#{a.token}</td><td><span className={`badge badge-${a.status === 'Upcoming' ? 'pending' : 'granted'}`}>{a.status}</span></td>
                                  <td><button className="btn btn-sm" style={{ background: '#fee2e2', color: '#991b1b', border: 'none', cursor: 'pointer', borderRadius: 6, fontFamily: 'inherit', fontWeight: 600 }} onClick={() => cancelAppt(a.id)}>Cancel</button></td></tr>
                              ))}</tbody></table>
                          </div>
                        )}
                        <div style={{ marginTop: 14 }}>
                          <button className="btn btn-primary btn-sm" onClick={() => navigate('/appointment')}>+ Book New Appointment</button>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {tab === 'documents' && (
                  <>
                    <h2 className="section-title">My Documents</h2>
                    <p className="section-sub">Uploaded documents linked to your applications</p>
                    <div className="card"><div className="card-body table-wrap">
                      <table><thead><tr><th>Document</th><th>Type</th><th>Uploaded</th><th>Status</th></tr></thead>
                        <tbody>
                          <tr><td>Aadhaar Card</td><td>Identity Proof</td><td>16 Mar 2026</td><td><span className="badge badge-granted">✅ Verified</span></td></tr>
                          <tr><td>Birth Certificate</td><td>DOB Proof</td><td>16 Mar 2026</td><td><span className="badge badge-granted">✅ Verified</span></td></tr>
                          <tr><td>Address Proof</td><td>Residence Proof</td><td>16 Mar 2026</td><td><span className="badge badge-pending">⏳ Pending</span></td></tr>
                        </tbody>
                      </table>
                    </div></div>
                  </>
                )}

                {tab === 'profile' && (
                  <>
                    <h2 className="section-title">Profile Settings</h2>
                    <p className="section-sub">Update your personal information</p>
                    <div className="card"><div className="card-body">
                      <div className="form-row cols-2">
                        <div className="form-group"><label>Given Name</label><input className="form-control" value={profile.firstName} onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))} /></div>
                        <div className="form-group"><label>Surname</label><input className="form-control" value={profile.lastName} onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))} /></div>
                      </div>
                      <div className="form-group"><label>Email</label><input className="form-control" value={user?.email} disabled /></div>
                      <div className="form-group"><label>Mobile</label><input className="form-control" value={profile.mobile} onChange={e => setProfile(p => ({ ...p, mobile: e.target.value }))} /></div>
                      <button className="btn btn-primary" onClick={saveProfile}>Save Changes</button>
                    </div></div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
