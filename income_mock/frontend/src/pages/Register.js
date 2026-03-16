import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ pan: '', password: '', name: '', dob: '', email: '', mobile: '', aadhaar: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const set = k => e => setForm(f => ({ ...f, [k]: k === 'pan' ? e.target.value.toUpperCase() : e.target.value }));

    const handleSubmit = async e => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            const { data } = await axios.post('/api/auth/register', form);
            login(data.token, data.user);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally { setLoading(false); }
    };

    return (
        <div style={styles.wrap}>
            <div style={styles.box}>
                <div style={styles.head}>
                    <div style={styles.logo}>IT</div>
                    <h1 style={styles.title}>Create Account</h1>
                    <p style={styles.sub}>Register on the e-Filing Portal</p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>PAN Number *</label>
                            <input value={form.pan} onChange={set('pan')} placeholder="ABCDE1234F" maxLength={10} required />
                        </div>
                        <div className="form-group">
                            <label>Full Name *</label>
                            <input value={form.name} onChange={set('name')} placeholder="As per PAN card" required />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Date of Birth *</label>
                            <input type="date" value={form.dob} onChange={set('dob')} required />
                        </div>
                        <div className="form-group">
                            <label>Mobile Number *</label>
                            <input value={form.mobile} onChange={set('mobile')} placeholder="10-digit mobile" maxLength={10} required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Email Address *</label>
                        <input type="email" value={form.email} onChange={set('email')} placeholder="your@email.com" required />
                    </div>
                    <div className="form-group">
                        <label>Aadhaar Number</label>
                        <input value={form.aadhaar} onChange={set('aadhaar')} placeholder="XXXX-XXXX-XXXX (optional)" maxLength={14} />
                    </div>
                    <div className="form-group">
                        <label>Password *</label>
                        <input type="password" value={form.password} onChange={set('password')} placeholder="Min 8 characters" required />
                    </div>
                    <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
                        {loading ? 'Registering…' : 'Create Account'}
                    </button>
                </form>

                <div style={styles.footer}>
                    <p>Already registered? <Link to="/login">Login here</Link></p>
                </div>
            </div>
        </div>
    );
}

const styles = {
    wrap: { minHeight: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' },
    box: { background: '#fff', borderRadius: 12, boxShadow: '0 4px 32px rgba(0,53,128,.12)', padding: '36px', width: '100%', maxWidth: 560, border: '1px solid #dce3f0' },
    head: { textAlign: 'center', marginBottom: 24 },
    logo: { width: 52, height: 52, background: '#003580', borderRadius: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#f7a800', fontFamily: 'Playfair Display, serif', marginBottom: 10 },
    title: { fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#002060', marginBottom: 4 },
    sub: { fontSize: 12, color: '#6b7593' },
    footer: { marginTop: 20, textAlign: 'center', fontSize: 13, color: '#6b7593' },
};