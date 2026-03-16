import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div>
            {/* Hero */}
            <div style={styles.hero}>
                <div className="container" style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={styles.heroBadge}>🇮🇳 Government of India</div>
                    <h1 style={styles.heroTitle}>Income Tax e-Filing Portal</h1>
                    <p style={styles.heroSub}>File your Income Tax Returns quickly, securely and accurately. Trusted by crores of taxpayers.</p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 28 }}>
                        <Link to="/login" className="btn btn-gold" style={{ fontSize: 15, padding: '12px 28px' }}>Login to e-File</Link>
                        <Link to="/register" className="btn btn-secondary" style={{ fontSize: 15, padding: '12px 28px', color: '#fff', borderColor: 'rgba(255,255,255,.4)' }}>New Registration</Link>
                    </div>
                </div>
            </div>

            {/* Features */}
            <div className="container" style={{ padding: '48px 20px' }}>
                <h2 style={{ fontFamily: 'Playfair Display,serif', textAlign: 'center', color: '#002060', fontSize: 26, marginBottom: 32 }}>Portal Services</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 20 }}>
                    {[
                        { icon: '📋', title: 'File ITR', desc: 'File returns for AY 2024-25 and previous years with guided wizard' },
                        { icon: '🧮', title: 'Tax Calculator', desc: 'Estimate your tax under New & Old regime instantly' },
                        { icon: '💰', title: 'Refund Status', desc: 'Track your income tax refund step by step' },
                        { icon: '📊', title: 'AIS Summary', desc: 'View your Annual Information Statement for all transactions' },
                        { icon: '🔐', title: 'Secure Login', desc: 'Login with PAN + Password or OTP-based authentication' },
                        { icon: '👤', title: 'Profile Management', desc: 'Update your contact details and personal information' },
                    ].map(f => (
                        <div key={f.title} style={styles.featureCard}>
                            <div style={styles.featureIcon}>{f.icon}</div>
                            <h3 style={styles.featureTitle}>{f.title}</h3>
                            <p style={styles.featureDesc}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Demo credentials */}
            <div style={{ background: '#f4f6fb', borderTop: '1px solid #dce3f0', padding: '28px 0' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <p style={{ fontWeight: 700, color: '#002060', marginBottom: 8 }}>Demo Credentials</p>
                    <p style={{ color: '#6b7593', fontSize: 14 }}>PAN: <strong>ABCDE1234F</strong> &nbsp;|&nbsp; Password: <strong>Test@1234</strong></p>
                </div>
            </div>
        </div>
    );
}

const styles = {
    hero: { background: 'linear-gradient(135deg, #002060 0%, #003580 60%, #0050b3 100%)', color: '#fff' },
    heroBadge: { display: 'inline-block', background: 'rgba(247,168,0,.2)', color: '#f7a800', padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, marginBottom: 16, border: '1px solid rgba(247,168,0,.3)' },
    heroTitle: { fontFamily: 'Playfair Display,serif', fontSize: 42, fontWeight: 700, marginBottom: 12, lineHeight: 1.2 },
    heroSub: { fontSize: 16, color: 'rgba(255,255,255,.75)', maxWidth: 560, margin: '0 auto' },
    featureCard: { background: '#fff', borderRadius: 10, padding: '24px 20px', border: '1px solid #dce3f0', boxShadow: '0 2px 12px rgba(0,53,128,.06)', transition: 'transform .18s, box-shadow .18s' },
    featureIcon: { fontSize: 32, marginBottom: 12 },
    featureTitle: { fontFamily: 'Playfair Display,serif', fontSize: 17, color: '#002060', marginBottom: 8 },
    featureDesc: { fontSize: 13, color: '#6b7593', lineHeight: 1.6 },
};