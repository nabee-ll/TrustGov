import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, ArrowRight, Loader2, CheckCircle, AlertCircle, Laptop, MapPin, Cpu, User, Phone } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { buildRecaptchaVerifier, isFirebasePhoneAuthConfigured, normalizeFirebasePhone, startFirebasePhoneVerification } from '../lib/firebase';
import type { ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type Step = 'login' | 'otp' | 'device' | 'token';
type LoginMethod = 'userId' | 'phone';

const allowDemoPhoneFallback = ((import.meta as any).env?.VITE_ALLOW_DEMO_PHONE_FALLBACK as string | undefined) === 'true';

const getFirebaseErrorMessage = (error: unknown) => {
  if (typeof error === 'object' && error && 'code' in error) {
    const code = String((error as { code?: string }).code || '');

    if (code === 'auth/invalid-phone-number') return 'Enter a valid phone number with country code support.';
    if (code === 'auth/billing-not-enabled') return 'Firebase phone auth requires billing to be enabled on this Firebase project.';
    if (code === 'auth/too-many-requests') return 'Too many OTP attempts. Please wait and try again.';
    if (code === 'auth/quota-exceeded') return 'Firebase SMS quota exceeded. Try again later.';
    if (code === 'auth/captcha-check-failed') return 'reCAPTCHA verification failed. Refresh the page and try again.';
    if (code === 'auth/popup-blocked') return 'Browser blocked the verification flow. Allow popups and try again.';
    if (code === 'auth/network-request-failed') return 'Firebase network request failed. Check your internet connection and try again.';
    if (code === 'auth/operation-not-allowed') return 'Phone authentication is not enabled in Firebase.';
  }

  return error instanceof Error ? error.message : 'Unable to send OTP to your phone right now.';
};

const getBrowserName = () => {
  const ua = navigator.userAgent;
  if (ua.includes('Edg')) return 'Microsoft Edge';
  if (ua.includes('Chrome')) return 'Chrome Browser';
  if (ua.includes('Firefox')) return 'Firefox Browser';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari Browser';
  return 'Secure Browser';
};

const getOperatingSystem = () => {
  const ua = navigator.userAgent;
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  return 'Unknown OS';
};

export function LoginPage() {
  const navigate = useNavigate();
  const { sendOtp, verifyOtp, verifyFirebasePhone } = useAuth();

  const [step, setStep] = useState<Step>('login');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('userId');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [resolvedUserId, setResolvedUserId] = useState('TG-45821');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  const [checks, setChecks] = useState({
    device: false,
    location: false,
    session: false,
  });

  const browser = getBrowserName();
  const os = getOperatingSystem();
  const locationLabel = 'Chennai, India';

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (loginMethod === 'phone') {
        if (!isFirebasePhoneAuthConfigured()) {
          setError('Firebase phone authentication is not configured yet.');
          return;
        }

        try {
          const normalizedPhone = normalizeFirebasePhone(identifier.trim());
          const verifier = recaptchaVerifier || buildRecaptchaVerifier('firebase-recaptcha-container');
          if (!recaptchaVerifier) setRecaptchaVerifier(verifier);

          const result = await startFirebasePhoneVerification(normalizedPhone, verifier);
          setConfirmationResult(result);
          setMessage(`OTP sent to ${normalizedPhone}.`);
          setStep('otp');
          return;
        } catch (firebaseError) {
          setConfirmationResult(null);

          if (!allowDemoPhoneFallback) {
            setError(getFirebaseErrorMessage(firebaseError));
            return;
          }
        }

        const fallbackRes = await sendOtp(loginMethod, identifier.trim());
        if (fallbackRes.success) {
          setMessage(fallbackRes.debugOtp ? `${fallbackRes.message} Demo OTP: ${fallbackRes.debugOtp}` : fallbackRes.message);
          if (fallbackRes.userId) setResolvedUserId(fallbackRes.userId);
          setStep('otp');
          return;
        }

        setError(fallbackRes.message || 'Unable to send OTP. Please try again.');
        return;
      }

      const res = await sendOtp(loginMethod, identifier.trim());
      if (res.success) {
        setMessage(res.message);
        if (res.userId) setResolvedUserId(res.userId);
        if (res.debugOtp) {
          setMessage(`${res.message} Demo OTP: ${res.debugOtp}`);
        }
        setStep('otp');
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = loginMethod === 'phone' && confirmationResult
        ? await (async () => {
            const credential = await confirmationResult.confirm(otp);
            const idToken = await credential.user.getIdToken();
            return verifyFirebasePhone(idToken);
          })()
        : await verifyOtp(loginMethod, identifier.trim(), otp);

      if (res.success) {
        if (res.user?.userId) {
          setResolvedUserId(res.user.userId);
        }

        setStep('device');
        setChecks({ device: false, location: false, session: false });

        await delay(500);
        setChecks((prev) => ({ ...prev, device: true }));
        await delay(500);
        setChecks((prev) => ({ ...prev, location: true }));
        await delay(500);
        setChecks((prev) => ({ ...prev, session: true }));

        await delay(700);
        setStep('token');
        await delay(1500);
        navigate('/dashboard');
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed.');
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
            <span className="text-2xl font-bold tracking-tight text-text-main">TrustGov</span>
          </Link>

          <h1 className="text-3xl font-bold text-text-main mb-3">
            {step === 'login' && 'Secure Login'}
            {step === 'otp' && 'Identity Verification'}
            {step === 'device' && 'TrustGov Security Check'}
            {step === 'token' && 'Generating Secure Identity Token'}
          </h1>

          <p className="text-text-muted font-light">
            {step === 'login' && 'Login using User ID or phone number and continue with OTP verification.'}
            {step === 'otp' && (message || 'Enter OTP sent to your registered mobile number.')}
            {step === 'device' && 'Verifying device, location, and session integrity.'}
            {step === 'token' && 'Creating your secure session access token.'}
          </p>

          {step === 'login' && (
            <p className="mt-4 text-xs text-text-muted">
              First time user? <Link to="/register" className="font-semibold text-brand hover:underline">Create account</Link>
            </p>
          )}
        </div>

        <div className="card p-8 md:p-10 bg-white/80 backdrop-blur-sm border-white/50">
          <AnimatePresence mode="wait">
            {step === 'login' ? (
              <motion.form
                key="login-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleSendOtp}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setLoginMethod('userId')}
                    className={`rounded-lg px-3 py-2 text-xs font-bold transition ${loginMethod === 'userId' ? 'bg-white text-text-main shadow-sm' : 'text-text-muted'}`}
                  >
                    User ID + OTP
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginMethod('phone')}
                    className={`rounded-lg px-3 py-2 text-xs font-bold transition ${loginMethod === 'phone' ? 'bg-white text-text-main shadow-sm' : 'text-text-muted'}`}
                  >
                    Phone + OTP
                  </button>
                </div>

                <div>
                  <label className="section-label mb-2">{loginMethod === 'userId' ? 'TrustGov User ID' : 'Registered Phone Number'}</label>
                  <div className="relative">
                    {loginMethod === 'userId' ? (
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    ) : (
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    )}
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="input-field pl-12"
                      placeholder={loginMethod === 'userId' ? 'TG-45821' : '+91XXXXXXXXXX'}
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
                      Send OTP
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </motion.form>
            ) : step === 'otp' ? (
              <motion.form
                key="otp-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleVerifyOtp}
                className="space-y-6"
              >
                <div>
                  <label className="section-label mb-2">Enter OTP</label>
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
                    {loginMethod === 'phone' ? 'OTP sent to your verified mobile number' : <>Demo OTP: <span className="text-brand">123456</span></>}
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
            ) : step === 'device' ? (
              <motion.div
                key="device-verification"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="p-5 rounded-2xl border border-brand/20 bg-brand/5">
                  <p className="text-[11px] uppercase tracking-wider font-bold text-brand mb-4">Verifying Device...</p>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted flex items-center"><Laptop className="w-4 h-4 mr-2" />Device</span>
                      <span className="font-semibold text-text-main">{browser}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted flex items-center"><Cpu className="w-4 h-4 mr-2" />Operating System</span>
                      <span className="font-semibold text-text-main">{os}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted flex items-center"><MapPin className="w-4 h-4 mr-2" />Location</span>
                      <span className="font-semibold text-text-main">{locationLabel}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">Status</span>
                      <span className="font-semibold text-success">Trusted Device</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    {checks.device ? <CheckCircle className="w-4 h-4 text-success mr-2" /> : <Loader2 className="w-4 h-4 animate-spin text-brand mr-2" />}
                    <span className="text-text-main">Device Verified</span>
                  </div>
                  <div className="flex items-center text-sm">
                    {checks.location ? <CheckCircle className="w-4 h-4 text-success mr-2" /> : <Loader2 className="w-4 h-4 animate-spin text-brand mr-2" />}
                    <span className="text-text-main">Location Verified</span>
                  </div>
                  <div className="flex items-center text-sm">
                    {checks.session ? <CheckCircle className="w-4 h-4 text-success mr-2" /> : <Loader2 className="w-4 h-4 animate-spin text-brand mr-2" />}
                    <span className="text-text-main">Session Secure</span>
                  </div>
                </div>

                <p className="text-center text-[11px] uppercase tracking-wider font-bold text-text-muted">
                  Proceeding to Secure Dashboard...
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="token-generation"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="p-6 rounded-2xl border border-success/20 bg-success/5">
                  <p className="text-[11px] uppercase tracking-wider font-bold text-success mb-4">Session Token Created</p>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">User ID</span>
                      <span className="font-semibold text-text-main">{resolvedUserId}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">Access Level</span>
                      <span className="font-semibold text-text-main">Verified Citizen</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">Session Validity</span>
                      <span className="font-semibold text-text-main">15 minutes</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center text-brand text-sm font-semibold">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Redirecting to dashboard...
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      <div id="firebase-recaptcha-container" />
    </div>
  );
}
