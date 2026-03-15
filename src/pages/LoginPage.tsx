import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Lock, User, ArrowRight, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, verify } = useAuth();
  const [step, setStep] = useState<'login' | 'otp'>('login');
  const [citizenId, setCitizenId] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await login(citizenId, password);
      if (res.success) {
        setMessage(res.message);
        setStep('otp');
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await verify(citizenId, otp);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('Verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.02),transparent_70%)]" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center space-x-3 group mb-8">
            <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center shadow-lg shadow-brand/20 group-hover:scale-110 transition-transform duration-300">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-text-main">
              TrustGov
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-text-main mb-3">
            {step === 'login' ? 'Welcome Back' : 'Identity Verification'}
          </h1>
          <p className="text-text-muted font-light">
            {step === 'login' 
              ? 'Enter your government-issued credentials to continue.' 
              : message || 'A secure verification code has been sent to your device.'}
          </p>
        </div>

        <div className="card p-8 md:p-10 bg-white/80 backdrop-blur-sm border-white/50">
          <AnimatePresence mode="wait">
            {step === 'login' ? (
              <motion.form
                key="login-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleLogin}
                className="space-y-6"
              >
                <div>
                  <label className="section-label mb-2">Citizen ID Number</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <input
                      type="text"
                      required
                      value={citizenId}
                      onChange={(e) => setCitizenId(e.target.value)}
                      className="input-field pl-12"
                      placeholder="12 digit ID"
                    />
                  </div>
                </div>
                <div>
                  <label className="section-label mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field pl-12"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center space-x-2 text-error text-xs bg-error/5 p-4 rounded-xl border border-error/10">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="btn-primary w-full py-4 flex items-center justify-center group"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="otp-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleVerify}
                className="space-y-6"
              >
                <div>
                  <label className="section-label mb-2">Verification Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="000000"
                    className="w-full bg-slate-50 border border-border rounded-xl py-4 text-center text-3xl font-bold tracking-[0.4em] text-text-main focus:outline-none focus:ring-4 focus:ring-brand/5 focus:border-brand focus:bg-white transition-all"
                  />
                  <p className="mt-4 text-[11px] text-text-muted text-center font-medium uppercase tracking-wider">
                    Demo OTP: <span className="text-brand">123456</span>
                  </p>
                </div>

                {error && (
                  <div className="flex items-center space-x-2 text-error text-xs bg-error/5 p-4 rounded-xl border border-error/10">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="btn-primary w-full py-4"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify Identity'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep('login')}
                  className="w-full text-sm font-bold text-text-muted hover:text-text-main transition-colors"
                >
                  Back to Login
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-12 text-center">
          <p className="text-[11px] uppercase tracking-widest font-bold text-text-muted mb-6">
            Protected by National Cyber Security Center
          </p>
          <div className="flex justify-center items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-brand/40" />
              <span className="text-[10px] font-bold text-text-muted">AES-256</span>
            </div>
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-brand/40" />
              <span className="text-[10px] font-bold text-text-muted">SSL SECURE</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
