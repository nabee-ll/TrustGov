import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const quickLinks = [
  { icon: '📄', label: 'File Income Tax Return', path: '/file-return' },
  { icon: '💰', label: 'e-Pay Tax', path: '#' },
  { icon: '🔁', label: 'Refund Status', path: '/refund-status' },
  { icon: '🧮', label: 'Tax Calculator', path: '/tax-calculator' },
  { icon: '📊', label: 'View AIS / 26AS', path: '/dashboard' },
  { icon: '✅', label: 'Verify ITR', path: '#' },
  { icon: '📋', label: 'Link Aadhaar', path: '#' },
];

const updates = [
  { text: 'Due date for filing ITR for AY 2024-25 extended to 31st December 2024', date: '15 Nov 2024' },
  { text: 'New tax regime is default from AY 2024-25 onwards', date: '01 Apr 2024' },
  { text: 'AIS (Annual Information Statement) now available for all taxpayers', date: '12 Oct 2024' },
  { text: 'e-Verification of ITR can be done within 30 days of filing', date: '05 Aug 2024' },
];

const services = [
  { icon: '🏠', title: 'ITR-1 (Sahaj)', desc: 'For salaried individuals with income up to ₹50 lakhs from salary, one house property & other sources.' },
  { icon: '🏢', title: 'ITR-2', desc: 'For individuals/HUFs with capital gains, more than one house property, or foreign income.' },
  { icon: '💼', title: 'ITR-3', desc: 'For individuals and HUFs having income from business or profession.' },
  { icon: '🏗️', title: 'ITR-4 (Sugam)', desc: 'For individuals under presumptive taxation scheme with business income.' },
  { icon: '🏦', title: 'ITR-5', desc: 'For firms, LLPs, AOPs, BOIs and other entities.' },
  { icon: '🏛️', title: 'ITR-6', desc: 'For companies other than those claiming exemption under section 11.' },
];

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div>
      {/* Announcement */}
      <div className="announcement-bar">
        <div className="announcement-inner">
          <span>🔔</span>
          <span><strong>Important:</strong> Last date to file belated ITR for AY 2024-25 is 31st December 2024. File now to avoid penalties.</span>
        </div>
      </div>

      {/* Hero */}
      <section className="hero">
        <div className="hero-inner">
          <h2>Welcome to Income Tax e-Filing Portal</h2>
          <p>File your Income Tax Return online, check refund status, pay taxes, and access all tax-related services at one place.</p>
          <div className="hero-actions">
            {isAuthenticated ? (
              <>
                <button className="btn-hero-primary" onClick={() => navigate('/file-return')}>📄 File Income Tax Return</button>
                <button className="btn-hero-outline" onClick={() => navigate('/dashboard')}>📊 My Dashboard</button>
              </>
            ) : (
              <>
                <button className="btn-hero-primary" onClick={() => navigate('/register')}>Register Now</button>
                <button className="btn-hero-outline" onClick={() => navigate('/login')}>Login to Portal</button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <div className="quick-links">
        <div className="quick-links-inner">
          {quickLinks.map((ql, i) => (
            <div key={i} className="quick-link-item" onClick={() => navigate(ql.path)}>
              <div className="quick-link-icon">{ql.icon}</div>
              <span>{ql.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="page">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 28, alignItems: 'start' }}>

          {/* Left: ITR Forms + Services */}
          <div>
            <h2 className="section-heading" style={{ marginBottom: 20 }}>ITR Forms for AY 2024-25</h2>
            <div className="info-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {services.map((s, i) => (
                <div key={i} className="info-card">
                  <div className="info-card-icon">{s.icon}</div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>

            <h2 className="section-heading" style={{ margin: '28px 0 20px' }}>Key Features</h2>
            <div className="card-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              {[
                { icon: '⚡', t: 'Pre-filled Returns', d: 'Data auto-filled from AIS, Form 26AS and employer TDS statements.' },
                { icon: '🔐', t: 'Secure Platform', d: 'Login with PAN, Aadhaar OTP or Net Banking with 2-factor authentication.' },
                { icon: '📱', t: 'Mobile Friendly', d: 'File returns on the go using any device — desktop, tablet or mobile.' },
                { icon: '🤝', t: 'Assisted Filing', d: 'Get help from CA, ERIs or use our guided filing wizard.' },
              ].map((f, i) => (
                <div key={i} className="card" style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 28 }}>{f.icon}</span>
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary-dark)', marginBottom: 4 }}>{f.t}</h4>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Updates + Contact */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* What's New */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">🆕 What's New</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {updates.map((u, i) => (
                  <div key={i} style={{ borderBottom: i < updates.length - 1 ? '1px solid var(--border-light)' : 'none', paddingBottom: i < updates.length - 1 ? 12 : 0 }}>
                    <p style={{ fontSize: 12.5, color: 'var(--text)', lineHeight: 1.5 }}>{u.text}</p>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>📅 {u.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Helpdesk */}
            <div className="card" style={{ background: 'linear-gradient(135deg, #e8f0fe, #f0f6ff)' }}>
              <div className="card-header">
                <span className="card-title">📞 Helpdesk</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                <div>
                  <strong style={{ color: 'var(--primary-dark)' }}>e-Filing &amp; CPC</strong>
                  <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>1800 103 0025 (Toll Free)</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>08:00–20:00 hrs (Mon–Fri)</p>
                </div>
                <div>
                  <strong style={{ color: 'var(--primary-dark)' }}>TIN-NSDL (PAN/TAN)</strong>
                  <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>+91-20-27218080</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>07:00–23:00 hrs (All Days)</p>
                </div>
                <div>
                  <strong style={{ color: 'var(--primary-dark)' }}>AIS &amp; Reporting Portal</strong>
                  <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>1800 103 4215</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>09:30–18:00 hrs (Mon–Fri)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
