import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth';

let firebaseApp: FirebaseApp | null = null;

const getFirebaseConfig = () => ({
  apiKey: ((import.meta as any).env?.VITE_FIREBASE_API_KEY as string | undefined) || '',
  authDomain: ((import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN as string | undefined) || '',
  projectId: ((import.meta as any).env?.VITE_FIREBASE_PROJECT_ID as string | undefined) || '',
  storageBucket: ((import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET as string | undefined) || '',
  messagingSenderId: ((import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined) || '',
  appId: ((import.meta as any).env?.VITE_FIREBASE_APP_ID as string | undefined) || '',
});

export const isFirebasePhoneAuthConfigured = () => {
  const config = getFirebaseConfig();
  return Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);
};

export const getFirebaseApp = () => {
  if (firebaseApp) return firebaseApp;
  if (getApps().length > 0) {
    firebaseApp = getApps()[0]!;
    return firebaseApp;
  }

  const config = getFirebaseConfig();
  firebaseApp = initializeApp(config);
  return firebaseApp;
};

export const getFirebaseAuthInstance = () => getAuth(getFirebaseApp());

export const buildRecaptchaVerifier = (containerId: string) => new RecaptchaVerifier(getFirebaseAuthInstance(), containerId, {
  size: 'invisible',
});

export const startFirebasePhoneVerification = async (
  phoneNumber: string,
  verifier: RecaptchaVerifier,
): Promise<ConfirmationResult> => signInWithPhoneNumber(getFirebaseAuthInstance(), phoneNumber, verifier);

export const normalizeFirebasePhone = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length === 12) {
    return `+${digits}`;
  }
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  return value.startsWith('+') ? value : `+${digits}`;
};
