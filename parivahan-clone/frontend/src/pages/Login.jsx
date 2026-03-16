import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api.js';
import { useAuth } from '../App.jsx';

// ⚠️ Defined OUTSIDE Login so React doesn't recreate the component type on every render,
// which would cause inputs to unmount/remount and lose focus after each keystroke.
const InputField = ({ name, label, type = 'text', placeholder, value, onChange, error }) => (
  <div>
    <label className="form-label">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`form-input ${error ? 'border-red-400 bg-red-50' : ''}`}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

export default function Login() {
  const [mode, setMode]           = useState('login'); // 'login' | 'register'
  const [form, setForm]           = useState({ name: '', email: '', password: '', phone: '', confirmPassword: '' });
  const [errors, setErrors]       = useState({});
  const [loading, setLoading]     = useState(false);
  const [apiError, setApiError]   = useState('');
  const { login }                 = useAuth();
  const navigate                  = useNavigate();

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: '' }));
    setApiError('');
  };

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Min 6 characters';
    if (mode === 'register') {
      if (!form.name.trim()) errs.name = 'Full name is required';
      if (!form.phone.trim()) errs.phone = 'Phone number is required';
      else if (!/^\d{10}$/.test(form.phone)) errs.phone = 'Enter a valid 10-digit phone number';
      if (form.confirmPassword !== form.password) errs.confirmPassword = 'Passwords do not match';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const { data } = mode === 'login'
        ? await authAPI.login({ email: form.email, password: form.password })
        : await authAPI.register({ name: form.name, email: form.email, password: form.password, phone: form.phone });

      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode((m) => (m === 'login' ? 'register' : 'login'));
    setErrors({});
    setApiError('');
    setForm({ name: '', email: '', password: '', phone: '', confirmPassword: '' });
  };

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-100 flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-[#003580] text-white px-6 py-5 text-center">
            <div className="text-3xl mb-2">🇮🇳</div>
            <h2 className="text-lg font-bold">Parivahan Sewa</h2>
            <p className="text-blue-200 text-xs mt-1">Ministry of Road Transport &amp; Highways</p>
          </div>

          {/* Tab toggle */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => mode !== 'login' && toggleMode()}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                mode === 'login' ? 'text-blue-700 border-b-2 border-blue-700 bg-blue-50' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => mode !== 'register' && toggleMode()}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                mode === 'register' ? 'text-blue-700 border-b-2 border-blue-700 bg-blue-50' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              New Registration
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded flex items-center gap-2">
                <span>⚠️</span> {apiError}
              </div>
            )}

            {mode === 'register' && (
              <InputField name="name" label="Full Name *" placeholder="Enter your full name" value={form.name} onChange={handleChange} error={errors.name} />
            )}

            <InputField name="email" label="Email Address *" type="email" placeholder="Enter your email" value={form.email} onChange={handleChange} error={errors.email} />

            {mode === 'register' && (
              <InputField name="phone" label="Mobile Number *" placeholder="10-digit mobile number" value={form.phone} onChange={handleChange} error={errors.phone} />
            )}

            <InputField name="password" label="Password *" type="password" placeholder="Enter password (min 6 chars)" value={form.password} onChange={handleChange} error={errors.password} />

            {mode === 'register' && (
              <InputField name="confirmPassword" label="Confirm Password *" type="password" placeholder="Re-enter password" value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} />
            )}

            {mode === 'login' && (
              <div className="text-right">
                <a href="#" className="text-xs text-blue-600 hover:underline">Forgot Password?</a>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded transition-colors text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>

            {mode === 'register' && (
              <p className="text-xs text-gray-500 text-center leading-relaxed">
                By registering, you agree to the{' '}
                <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>{' '}
                and{' '}
                <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>{' '}
                of Ministry of Road Transport &amp; Highways, GoI.
              </p>
            )}
          </form>
        </div>

        {/* Help text */}
        <div className="mt-4 text-center text-xs text-gray-500">
          <p>🔒 Your data is secured by Government of India standards</p>
          <p className="mt-1">
            Need help?{' '}
            <a href="tel:18001801212" className="text-blue-600 hover:underline">1800-180-1212</a> (Toll Free)
          </p>
        </div>
      </div>
    </div>
  );
}
