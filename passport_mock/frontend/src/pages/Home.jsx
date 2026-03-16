import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HelplineCard } from '../components/UI';

const SERVICES = [
  { icon: '🆕', name: 'Fresh Passport (Normal)', fee: '₹1,500 | 30 days', path: '/apply/new' },
  { icon: '⚡', name: 'Fresh Passport (Tatkal)', fee: '₹3,500 | 7 days', path: '/apply/tatkal' },
  { icon: '🔄', name: 'Re-issue of Passport', fee: '₹1,500 | 30 days', path: '/apply/reissue' },
  { icon: '👶', name: 'Minor Passport', fee: '₹1,000 | 30 days', path: '/apply/minor' },
  { icon: '🚔', name: 'Police Clearance Certificate', fee: '₹500 | 14 days', path: '/apply/pcc' },
  { icon: '🚨', name: 'Emergency Certificate', fee: '₹250 | Same day', path: '/apply/emergency' },
  { icon: '🪪', name: 'Identity Certificate', fee: '₹500 | 30 days', path: '/apply/new' },
  { icon: '🏛️', name: 'Diplomatic Passport', fee: 'Official channel', path: '#' },
  { icon: '🧮', name: 'Fee Calculator', fee: 'Calculate your fee', path: '/fee-calculator' },
];

const NOTICES = [
  { text: 'e-Passport (chip-embedded) rollout begins in Delhi, Mumbai & Chennai', date: '14 Mar 2026', isNew: true },
  { text: 'mPassport Police App – Police verification now available digitally', date: '10 Mar 2026' },
  { text: 'Revised fee structure for Passport services effective 01 April 2026', date: '05 Mar 2026', isHot: true },
  { text: 'Tatkal passport processing time reduced to 1 working day at select PSKs', date: '28 Feb 2026' },
  { text: 'DigiLocker integration enabled – verify documents digitally', date: '20 Feb 2026' },
  { text: '500+ new Post Office PSKs operational across rural India', date: '15 Feb 2026' },
];

const STATS = [
  { num: '3.8 Cr+', label: 'Passports Issued (2025-26)' },
  { num: '560+', label: 'Passport Seva Kendras' },
  { num: '36', label: 'Regional Passport Offices' },
  { num: '1800+', label: 'Post Office PSKs' },
];

const QUICK_LINKS = [
  ['Document Advisor Tool', '/doc-advisor'],
  ['Fee Calculator', '/fee-calculator'],
  ['Appointment Availability', '/appointment'],
  ['Grievance Redressal', '/grievance'],
  ['Photo Guidelines', '/photo-guidelines'],
  ['NRI / Overseas Citizens', '#'],
  ['Indian Embassy Abroad', '#'],
];

export default function Home() {
  const navigate = useNavigate();
  const [trackArn, setTrackArn] = React.useState('');
  const [trackDob, setTrackDob] = React.useState('');
  const [trackOffice, setTrackOffice] = React.useState('');

  return (
    <>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg,#001f4d 0%,#00398a 50%,#1254b5 100%)', color: 'white', padding: '48px 0 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%,rgba(255,100,0,0.08),transparent 50%),radial-gradient(circle at 80% 50%,rgba(19,136,8,0.08),transparent 50%)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '5px 14px', borderRadius: 20, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
            🌏 Official Government Portal
          </div>
          <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 36, lineHeight: 1.2, marginBottom: 12, fontWeight: 400 }}>Your Passport to the <em style={{ fontStyle: 'italic', color: '#fbbf24' }}>World</em><br />Starts Here</h2>
          <p style={{ color: '#a8c4f0', fontSize: 15, marginBottom: 28, maxWidth: 560 }}>Apply for a new passport, track your application, book appointments, and access all passport-related services — quickly, securely, and online.</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 36 }}>
            <button className="btn btn-saffron btn-lg" onClick={() => navigate('/apply/new')}>🚀 Apply Now</button>
            <button className="btn btn-lg" style={{ background: 'transparent', color: 'white', border: '2px solid rgba(255,255,255,0.4)' }} onClick={() => navigate('/track')}>🔍 Track Application</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12 }}>
            {[['🆕','New Passport','/apply/new'],['🔄','Re-issue','/apply/reissue'],['📍','Track Status','/track'],['🗓️','Book Appointment','/appointment'],['🚔','PCC','/apply/pcc']].map(([icon,label,path]) => (
              <div key={label} onClick={() => navigate(path)} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '16px 12px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.25s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#e8520a'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = ''; }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Track */}
      <div style={{ background: 'white', borderBottom: '1px solid #d0d9ec', padding: '18px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: 200 }}>
              <label>File / ARN Number</label>
              <input className="form-control" value={trackArn} onChange={e => setTrackArn(e.target.value)} placeholder="e.g. AP25031600001" />
            </div>
            <div className="form-group" style={{ marginBottom: 0, minWidth: 160 }}>
              <label>Date of Birth</label>
              <input className="form-control" type="date" value={trackDob} onChange={e => setTrackDob(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0, minWidth: 180 }}>
              <label>Passport Office</label>
              <select className="form-control" value={trackOffice} onChange={e => setTrackOffice(e.target.value)}>
                <option value="">Select Office</option>
                {['Chennai','Bengaluru','Mumbai','Delhi','Kolkata','Hyderabad'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <button className="btn btn-saffron" onClick={() => navigate('/track')}>🔍 Track Status</button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, margin: '28px 0' }}>
          {STATS.map(s => (
            <div key={s.num} className="card" style={{ padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#003580', fontFamily: 'DM Serif Display, serif' }}>{s.num}</div>
              <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="two-col">
          <div>
            {/* Services */}
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="card-header navy">🛂 Our Services</div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                  {SERVICES.map(s => (
                    <div key={s.name} onClick={() => navigate(s.path)} style={{ border: '1.5px solid #d0d9ec', borderRadius: 8, padding: '14px 12px', textAlign: 'center', cursor: 'pointer', background: '#f8f9fc', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor='#003580'; e.currentTarget.style.background='#dbeafe'; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 4px 12px rgba(0,53,128,0.1)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor='#d0d9ec'; e.currentTarget.style.background='#f8f9fc'; e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}>
                      <div style={{ fontSize: 26, marginBottom: 6 }}>{s.icon}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#003580', lineHeight: 1.3 }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{s.fee}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Notices */}
            <div className="card">
              <div className="card-header green">📢 Latest Notifications</div>
              <div className="card-body">
                {NOTICES.map((n, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: i < NOTICES.length - 1 ? '1px dashed #d0d9ec' : 'none', fontSize: 13 }}>
                    <span style={{ color: '#e8520a', flexShrink: 0, marginTop: 2 }}>▸</span>
                    <div>
                      <span>{n.text} </span>
                      {n.isNew && <span className="chip chip-new" style={{ marginLeft: 4 }}>NEW</span>}
                      {n.isHot && <span className="chip chip-hot" style={{ marginLeft: 4 }}>HOT</span>}
                      <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>{n.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <HelplineCard />
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-header navy">🔗 Quick Links</div>
              <div className="card-body quick-links" style={{ padding: '8px 20px' }}>
                {QUICK_LINKS.map(([label, path]) => (
                  <a key={label} href={path.startsWith('/') ? undefined : '#'} onClick={path.startsWith('/') ? () => navigate(path) : undefined} style={{ cursor: 'pointer' }}>{label}</a>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="card-header saffron">📱 Download mPassport Seva App</div>
              <div className="card-body" style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 12, color: '#475569', marginBottom: 14 }}>Track status, book appointments & pay fees on the go</p>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                  <button className="btn btn-primary btn-sm">▶ Google Play</button>
                  <button className="btn btn-primary btn-sm">🍎 App Store</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
