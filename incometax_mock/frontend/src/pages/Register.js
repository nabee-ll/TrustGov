import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Defined OUTSIDE Register so React doesn't treat it as a new component on each render
const FormField = ({ k, label, type = 'text', placeholder, maxLength, hint, form, errors, onChange }) => (
  <div className="form-group">
    <label className="form-label">{label} <span className="required">*</span></label>
    <input
      type={type}
      className={`form-control${errors[k] ? ' error' : ''}`}
      placeholder={placeholder}
      value={form[k]}
      onChange={e => onChange(k, type === 'text' && k === 'pan' ? e.target.value.toUpperCase() : e.target.value)}
      maxLength={maxLength}
    />
    {errors[k] && <p className="form-error">{errors[k]}</p>}
    {hint && !errors[k] && <p className="form-hint">{hint}</p>}
  </div>
);

export default function Register() {
  const [form, setForm] = useState({ pan: '', name: '', dob: '', email: '', mobile: '', aadhaar: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.pan || !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.pan.toUpperCase())) e.pan = 'Enter valid PAN (e.g. ABCDE1234F)';
    if (!form.name || form.name.trim().length < 3) e.name = 'Full name is required (min 3 chars)';
    if (!form.dob) e.dob = 'Date of birth is required';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email is required';
    if (!form.mobile || !/^\d{10}$/.test(form.mobile)) e.mobile = 'Valid 10-digit mobile number required';
    if (!form.password || form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleChange = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setApiError('');
    setLoading(true);
    try {
      await register({ pan: form.pan.toUpperCase(), name: form.name, dob: form.dob, email: form.email, mobile: form.mobile, aadhaar: form.aadhaar, password: form.password });
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page" style={{ alignItems: 'flex-start', paddingTop: 32 }}>
      <div className="auth-card" style={{ maxWidth: 560 }}>
        <div className="auth-header">
          <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
          <h2>New User Registration</h2>
          <p>Create your e-Filing account — Income Tax Department</p>
        </div>
        <div className="auth-body">
          {apiError && <div className="alert alert-error">⚠️ {apiError}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <FormField k="pan" label="PAN" placeholder="ABCDE1234F" maxLength={10} hint="10-character Permanent Account Number" form={form} errors={errors} onChange={handleChange} />
              <FormField k="name" label="Full Name" placeholder="As per PAN card" form={form} errors={errors} onChange={handleChange} />
            </div>
            <div className="form-row">
              <FormField k="dob" label="Date of Birth" type="date" form={form} errors={errors} onChange={handleChange} />
              <FormField k="mobile" label="Mobile Number" placeholder="10-digit mobile" maxLength={10} form={form} errors={errors} onChange={handleChange} />
            </div>
            <FormField k="email" label="Email Address" type="email" placeholder="your@email.com" form={form} errors={errors} onChange={handleChange} />
            <div className="form-group">
              <label className="form-label">Aadhaar Number (Optional)</label>
              <input
                className="form-control"
                placeholder="12-digit Aadhaar"
                value={form.aadhaar}
                onChange={e => handleChange('aadhaar', e.target.value)}
                maxLength={12}
              />
            </div>
            <div className="form-row">
              <FormField k="password" label="Password" type="password" placeholder="Min. 8 characters" hint="Use uppercase, numbers, symbols" form={form} errors={errors} onChange={handleChange} />
              <FormField k="confirm" label="Confirm Password" type="password" placeholder="Re-enter password" form={form} errors={errors} onChange={handleChange} />
            </div>

            <div className="alert alert-info" style={{ fontSize: 12, marginTop: 4 }}>
              By registering, you agree to the Terms of Service of Income Tax e-Filing Portal.
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? 'Registering…' : 'Register'}
            </button>
          </form>

          <div className="divider">Already registered?</div>
          <p style={{ textAlign: 'center', fontSize: 13 }}>
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Login to your account →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
