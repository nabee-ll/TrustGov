import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <h3>Income Tax Department</h3>
          <p>
            e-Filing of Income Tax Return or Forms and other value added services &amp;
            Intimation, Rectification, Refund and other Income Tax Processing Related Queries.
          </p>
          <div style={{ marginTop: 14 }}>
            <p style={{ fontSize: 12, marginTop: 8 }}>📞 1800 103 0025 (Toll Free)</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>📞 +91-80-46122000</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>⏰ 08:00 – 20:00 hrs (Mon–Fri)</p>
          </div>
        </div>
        <div className="footer-col">
          <h4>Quick Links</h4>
          <Link to="/" className="footer-link">Home</Link>
          <Link to="/login" className="footer-link">Login</Link>
          <Link to="/register" className="footer-link">Register</Link>
          <Link to="/tax-calculator" className="footer-link">Tax Calculator</Link>
          <Link to="/refund-status" className="footer-link">Refund Status</Link>
        </div>
        <div className="footer-col">
          <h4>Services</h4>
          <span className="footer-link">e-Filing of ITR</span>
          <span className="footer-link">AIS / TIS</span>
          <span className="footer-link">Form 26AS</span>
          <span className="footer-link">Verify ITR</span>
          <span className="footer-link">e-Pay Tax</span>
        </div>
        <div className="footer-col">
          <h4>Important Links</h4>
          <span className="footer-link">CBDT</span>
          <span className="footer-link">Tax Information Network</span>
          <span className="footer-link">National Portal of India</span>
          <span className="footer-link">Digital India</span>
          <span className="footer-link">Grievance Portal</span>
        </div>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} Income Tax Department, Government of India. All Rights Reserved. &nbsp;|&nbsp;
        <span style={{ color: 'rgba(255,255,255,0.4)' }}>Demo Clone for Educational Purposes</span>
      </div>
    </footer>
  );
}
