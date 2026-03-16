import React, { useState } from 'react';
import { Modal, useToast } from './UI';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';
import { useNavigate } from 'react-router-dom';

export function LoginModal({ open, onClose, onSwitchRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpMode, setOtpMode] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) { toast('Please fill all fields', 'error'); return; }
    setLoading(true);
    try {
      await login(email, password);
      toast('Welcome back! 🎉', 'success');
      onClose();
      navigate('/dashboard');
    } catch (err) {
      toast(err.response?.data?.message || 'Invalid credentials', 'error');
    } finally { setLoading(false); }
  };

  const handleAadhaar = () => setOtpMode(true);

  const handleOtp = async () => {
    const code = otp.join('');
    if (code.length < 6) { toast('Enter complete OTP', 'error'); return; }
    try {
      await authAPI.verifyOtp({ otp: code });
      await login('demo@passport.gov.in', 'Demo@1234');
      toast('OTP verified! Welcome 🎉', 'success');
      onClose(); setOtpMode(false);
      navigate('/dashboard');
    } catch { toast('Invalid OTP. Use 123456', 'error'); }
  };

  const handleOtpInput = (val, idx) => {
    const next = [...otp]; next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
  };

  return (
    <Modal open={open} onClose={onClose} title="🔐 Citizen Login">
      {!otpMode ? (
        <>
          <div className="alert alert-info" style={{ marginBottom: 16 }}>
            <span>ℹ️</span> Demo: <strong>demo@passport.gov.in</strong> / <strong>Demo@1234</strong>
          </div>
          <div className="form-group">
            <label>Email ID <span className="req">*</span></label>
            <input className="form-control" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Registered email" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </div>
          <div className="form-group">
            <label>Password <span className="req">*</span></label>
            <input className="form-control" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </div>
          <button className="btn btn-primary btn-full" onClick={handleLogin} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <div style={{ textAlign: 'center', margin: '14px 0', fontSize: 12, color: '#475569' }}>— OR —</div>
          <button className="btn btn-outline btn-full" onClick={handleAadhaar}>🪪 Login with Aadhaar OTP</button>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, fontSize: 12 }}>
            <a href="#" style={{ color: '#003580' }}>Forgot Password?</a>
            <a href="#" style={{ color: '#003580' }} onClick={e => { e.preventDefault(); onClose(); onSwitchRegister(); }}>New Registration</a>
          </div>
        </>
      ) : (
        <>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>📱</div>
            <p style={{ fontSize: 13, color: '#475569' }}>OTP sent to your registered mobile. <strong>Use: 123456</strong></p>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
            {otp.map((v, i) => (
              <input key={i} id={`otp-${i}`} value={v} onChange={e => handleOtpInput(e.target.value, i)}
                maxLength={1} style={{ width: 44, height: 44, textAlign: 'center', fontSize: 20, fontWeight: 700, border: '1.5px solid #d0d9ec', borderRadius: 6, outline: 'none' }}
                onFocus={e => e.target.style.borderColor = '#003580'} onBlur={e => e.target.style.borderColor = '#d0d9ec'} />
            ))}
          </div>
          <button className="btn btn-primary btn-full" onClick={handleOtp}>Verify OTP</button>
          <button className="btn btn-outline btn-full" style={{ marginTop: 10 }} onClick={() => setOtpMode(false)}>← Back to Login</button>
        </>
      )}
    </Modal>
  );
}

export function RegisterModal({ open, onClose, onSwitchLogin }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', mobile: '', dob: '', passportOffice: '' });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleRegister = async () => {
    if (form.password !== form.confirmPassword) { toast('Passwords do not match', 'error'); return; }
    setLoading(true);
    try {
      await authAPI.register(form);
      setStep(2);
      toast('OTP sent to your mobile!', 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Registration failed', 'error');
    } finally { setLoading(false); }
  };

  const offices = ['Chennai Passport Office', 'Bengaluru Passport Office', 'Mumbai Passport Office', 'Delhi Passport Office', 'Kolkata Passport Office', 'Hyderabad Passport Office', 'Pune Passport Office', 'Ahmedabad Passport Office'];

  return (
    <Modal open={open} onClose={onClose} title="📝 New User Registration" size="lg">
      {step === 1 ? (
        <>
          <div className="form-row cols-2">
            <div className="form-group"><label>Given Name <span className="req">*</span></label><input className="form-control" value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="First name" /></div>
            <div className="form-group"><label>Surname <span className="req">*</span></label><input className="form-control" value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Last name" /></div>
          </div>
          <div className="form-group"><label>Email <span className="req">*</span></label><input className="form-control" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="Valid email" /></div>
          <div className="form-row cols-2">
            <div className="form-group"><label>Password <span className="req">*</span></label><input className="form-control" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min 8 chars" /></div>
            <div className="form-group"><label>Confirm Password <span className="req">*</span></label><input className="form-control" type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} placeholder="Re-enter" /></div>
          </div>
          <div className="form-row cols-2">
            <div className="form-group"><label>Mobile <span className="req">*</span></label><input className="form-control" type="tel" value={form.mobile} onChange={e => set('mobile', e.target.value)} placeholder="10-digit" maxLength={10} /></div>
            <div className="form-group"><label>Date of Birth</label><input className="form-control" type="date" value={form.dob} onChange={e => set('dob', e.target.value)} /></div>
          </div>
          <div className="form-group">
            <label>Nearest Passport Office <span className="req">*</span></label>
            <select className="form-control" value={form.passportOffice} onChange={e => set('passportOffice', e.target.value)}>
              <option value="">-- Select --</option>
              {offices.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <button className="btn btn-primary btn-full" onClick={handleRegister} disabled={loading}>{loading ? 'Registering...' : 'Register & Send OTP'}</button>
          <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12 }}>
            Already registered? <a href="#" style={{ color: '#003580' }} onClick={e => { e.preventDefault(); onClose(); onSwitchLogin(); }}>Login here</a>
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
          <h4 style={{ color: '#15803d', fontSize: 18, marginBottom: 8 }}>Registration Successful!</h4>
          <p style={{ fontSize: 13, color: '#475569', marginBottom: 20 }}>Your account has been created. Use OTP <strong>123456</strong> to verify.</p>
          <button className="btn btn-primary" onClick={() => { onClose(); onSwitchLogin(); setStep(1); }}>Proceed to Login</button>
        </div>
      )}
    </Modal>
  );
}
