import React from 'react';
import { Link } from 'react-router-dom';
import { Emblem } from './UI';

export default function Footer() {
  return (
    <footer style={{ background: '#001f4d', color: '#94b4d8', marginTop: 'auto' }}>
      <div className="container" style={{ padding: '36px 20px 24px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <Emblem size={36} />
            <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 16, color: 'white', fontWeight: 400 }}>Passport Seva</h3>
          </div>
          <p style={{ fontSize: 12, lineHeight: 1.8, color: '#7aa0cc', marginBottom: 12 }}>
            Passport Seva is the National Passport Service of India, managed by the Ministry of External Affairs. It delivers passport and consular services to Indian citizens with efficiency and transparency.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['ISO 9001:2015', 'Digital India'].map(t => (
              <span key={t} style={{ fontSize: 11, background: 'rgba(255,255,255,0.1)', padding: '3px 10px', borderRadius: 10, color: '#94b4d8' }}>{t}</span>
            ))}
          </div>
        </div>
        <div>
          <h4 style={{ fontSize: 12, fontWeight: 700, color: 'white', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Services</h4>
          <ul style={{ listStyle: 'none' }}>
            {[['New Passport', '/apply/new'], ['Re-issue', '/apply/reissue'], ['Track Application', '/track'], ['Book Appointment', '/appointment'], ['Fee Calculator', '/fee-calculator']].map(([l, p]) => (
              <li key={l} style={{ marginBottom: 7 }}><Link to={p} style={{ color: '#7aa0cc', textDecoration: 'none', fontSize: 12 }}>{l}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 style={{ fontSize: 12, fontWeight: 700, color: 'white', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Important</h4>
          <ul style={{ listStyle: 'none' }}>
            {['Ministry of External Affairs', 'India.gov.in', 'DigiLocker', 'UIDAI / Aadhaar', 'National Portal of India'].map(t => (
              <li key={t} style={{ marginBottom: 7 }}><a href="#" style={{ color: '#7aa0cc', textDecoration: 'none', fontSize: 12 }}>{t}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 style={{ fontSize: 12, fontWeight: 700, color: 'white', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Support</h4>
          <ul style={{ listStyle: 'none' }}>
            {[['FAQs', '/faq'], ['Grievances', '/grievance'], ['Contact Us', '/contact'], ['Photo Guidelines', '/photo-guidelines'], ['Offices', '/offices']].map(([l, p]) => (
              <li key={l} style={{ marginBottom: 7 }}><Link to={p} style={{ color: '#7aa0cc', textDecoration: 'none', fontSize: 12 }}>{l}</Link></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="tricolour" />
      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 20px', textAlign: 'center', fontSize: 11, color: '#5a78a8', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        Website Last Updated: 16 March 2026 &nbsp;|&nbsp; Best viewed in Chrome, Edge, Firefox &nbsp;|&nbsp; © 2026 Ministry of External Affairs, Government of India
      </div>
    </footer>
  );
}
