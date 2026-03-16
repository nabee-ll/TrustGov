import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Emblem } from './UI';

export default function Header({ onLoginClick, onRegisterClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(null);

  const navItems = [
    { label: '🏠 Home', path: '/' },
    {
      label: '📋 Apply Online', children: [
        { label: '🆕 New Passport', path: '/apply/new' },
        { label: '🔄 Re-issue', path: '/apply/reissue' },
        { label: '⚡ Tatkal', path: '/apply/tatkal' },
        { label: '👶 Minor Passport', path: '/apply/minor' },
        { label: '🚔 PCC', path: '/apply/pcc' },
        { label: '🚨 Emergency Certificate', path: '/apply/emergency' },
      ]
    },
    {
      label: '🔍 Track Status', children: [
        { label: '📍 Track Application', path: '/track' },
        { label: '🗓️ Appointment Availability', path: '/appointment' },
      ]
    },
    { label: '🗓️ Book Appointment', path: '/appointment' },
    { label: '🏢 Offices', path: '/offices' },
    {
      label: '❓ Help', children: [
        { label: '❓ FAQs', path: '/faq' },
        { label: '📄 Document Advisor', path: '/doc-advisor' },
        { label: '🧮 Fee Calculator', path: '/fee-calculator' },
        { label: '📢 Grievance', path: '/grievance' },
        { label: '📞 Contact Us', path: '/contact' },
      ]
    },
    { label: '📷 Photo Guidelines', path: '/photo-guidelines' },
  ];

  return (
    <>
      {/* Top Strip */}
      <div style={{ background: '#001f4d', color: '#94b4d8', fontSize: 11, padding: '5px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>🇮🇳 Government of India | Ministry of External Affairs</span>
          <span style={{ display: 'flex', gap: 14 }}>
            {['A-', 'A', 'A+', 'हिन्दी', 'Screen Reader'].map(t => (
              <a key={t} href="#" style={{ color: '#7aa0cc', textDecoration: 'none' }}>{t}</a>
            ))}
          </span>
        </div>
      </div>

      {/* Header */}
      <header style={{ background: 'white', borderBottom: '3px solid #e8520a', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 200 }}>
        <div className="container" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none' }}>
            <Emblem size={60} />
            <div>
              <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 21, color: '#003580', lineHeight: 1.1, fontWeight: 400 }}>Passport Seva</h1>
              <p style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>Ministry of External Affairs | Government of India</p>
            </div>
          </Link>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
            {user ? (
              <>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#003580', display: 'flex', alignItems: 'center' }}>
                  👤 {user.firstName}
                </span>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/dashboard')}>Dashboard</button>
                <button className="btn btn-outline btn-sm" onClick={() => { logout(); navigate('/'); }}>Logout</button>
              </>
            ) : (
              <>
                <button className="btn btn-outline btn-sm" onClick={onRegisterClick}>Register</button>
                <button className="btn btn-primary btn-sm" onClick={onLoginClick}>🔐 Login</button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Nav */}
      <nav style={{ background: '#003580', position: 'sticky', top: 91, zIndex: 190, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
        <div className="container" style={{ display: 'flex', overflowX: 'auto' }}>
          {navItems.map((item, i) => (
            <div key={i} style={{ position: 'relative' }}
              onMouseEnter={() => item.children && setMenuOpen(i)}
              onMouseLeave={() => setMenuOpen(null)}>
              {item.path ? (
                <Link to={item.path} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '12px 16px', color: '#c8d8f8', textDecoration: 'none', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#e8520a'; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = '#c8d8f8'; }}>
                  {item.label}
                </Link>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '12px 16px', color: '#c8d8f8', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', cursor: 'default' }}>
                  {item.label} <span style={{ fontSize: 9, opacity: 0.7 }}>▾</span>
                </div>
              )}
              {item.children && menuOpen === i && (
                <div style={{ position: 'absolute', top: '100%', left: 0, background: 'white', minWidth: 220, borderTop: '3px solid #e8520a', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 999, borderRadius: '0 0 8px 8px' }}>
                  {item.children.map((c, j) => (
                    <Link key={j} to={c.path} onClick={() => setMenuOpen(null)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', color: '#0f172a', textDecoration: 'none', fontSize: 13, borderBottom: '1px solid #f0f4ff', transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#dbeafe'; e.currentTarget.style.paddingLeft = '20px'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.paddingLeft = '16px'; }}>
                      {c.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Ticker */}
      <div style={{ background: '#001f4d', color: '#94b4d8', fontSize: 12, padding: '7px 0', overflow: 'hidden' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ background: '#e8520a', color: 'white', padding: '2px 10px', borderRadius: 3, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>NOTICE</span>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ whiteSpace: 'nowrap', animation: 'ticker 30s linear infinite' }}>
              📢 e-Passport rollout begins in Delhi, Mumbai & Chennai &nbsp;|&nbsp; ✅ 500+ Post Office PSKs operational &nbsp;|&nbsp; ⚡ Tatkal processing reduced to 1 working day &nbsp;|&nbsp; 📱 mPassport Seva App updated &nbsp;|&nbsp; 📋 Revised fee structure effective 01 April 2026
            </div>
          </div>
        </div>
        <style>{`@keyframes ticker { 0%{transform:translateX(100%)} 100%{transform:translateX(-100%)} }`}</style>
      </div>
    </>
  );
}
