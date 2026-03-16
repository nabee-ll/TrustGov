import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [tab, setTab] = useState('password'); // 'password' | 'otp'
  const [pan, setPan] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!pan || !password) return setError('Please enter PAN and password');
    setLoading(true);
    try {
      await login(pan.toUpperCase(), password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  const handleSendOtp = async () => {
    setError('');
    if (!pan) return setError('Please enter your PAN');
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/send-otp', { pan });
      setOtpSent(true);
      setDevOtp(res.data.devOtp || '');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const handleOtpLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp) return setError('Please enter the OTP');
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/verify-otp', { pan, otp });
      const { token, user } = res.data;
      localStorage.setItem('it_token', token);
      localStorage.setItem('it_user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div style={{ fontSize: 36, marginBottom: 8 }}>🔐</div>
          <h2>Login to e-Filing Portal</h2>
          <p>Income Tax Department, Government of India</p>
        </div>
        <div className="auth-body">
          {/* Demo credentials */}
          <div className="alert alert-info" style={{ fontSize: 12 }}>
            <div>
              <strong>Demo Credentials:</strong><br />
              PAN: <code>ABCDE1234F</code> &nbsp;|&nbsp; Password: <code>Test@1234</code>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs" style={{ marginBottom: 20 }}>
            <button className={`tab${tab === 'password' ? ' active' : ''}`} onClick={() => { setTab('password'); setError(''); }}>Password</button>
            <button className={`tab${tab === 'otp' ? ' active' : ''}`} onClick={() => { setTab('otp'); setError(''); }}>OTP (Mobile/Email)</button>
          </div>

          {error && <div className="alert alert-error">⚠️ {error}</div>}

          {tab === 'password' ? (
            <form onSubmit={handlePasswordLogin}>
              <div className="form-group">
                <label className="form-label">PAN <span className="required">*</span></label>
                <input
                  className="form-control"
                  placeholder="e.g. ABCDE1234F"
                  value={pan}
                  onChange={e => setPan(e.target.value.toUpperCase())}
                  maxLength={10}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password <span className="required">*</span></label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? 'Logging in…' : 'Login'}
              </button>
            </form>
          ) : (
            <div>
              <div className="form-group">
                <label className="form-label">PAN <span className="required">*</span></label>
                <input
                  className="form-control"
                  placeholder="e.g. ABCDE1234F"
                  value={pan}
                  onChange={e => setPan(e.target.value.toUpperCase())}
                  maxLength={10}
                />
              </div>
              {!otpSent ? (
                <button className="btn btn-primary btn-full" disabled={loading} onClick={handleSendOtp}>
                  {loading ? 'Sending…' : 'Send OTP'}
                </button>
              ) : (
                <form onSubmit={handleOtpLogin}>
                  {devOtp && (
                    <div className="alert alert-warning" style={{ fontSize: 12 }}>
                      <strong>Dev Mode OTP:</strong> {devOtp}
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label">Enter OTP <span className="required">*</span></label>
                    <input
                      className="form-control"
                      placeholder="6-digit OTP"
                      value={otp}
                      onChange={e => setOtp(e.target.value)}
                      maxLength={6}
                      autoFocus
                    />
                    <p className="form-hint">OTP sent to your registered mobile number</p>
                  </div>
                  <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                    {loading ? 'Verifying…' : 'Verify & Login'}
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="divider">or</div>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
            New to e-Filing? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
