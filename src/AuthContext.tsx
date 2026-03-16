import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from './lib/utils';

type LoginMethod = 'userId' | 'phone';

interface AuthContextType {
  user: User | null;
  register: (payload: { name: string; email: string; phone: string; password: string }) => Promise<{ success: boolean; message: string; userId?: string }>;
  sendOtp: (loginMethod: LoginMethod, identifier: string) => Promise<{ success: boolean; message: string; userId?: string; debugOtp?: string }>;
  verifyOtp: (loginMethod: LoginMethod, identifier: string, otp: string) => Promise<{ success: boolean; message: string; user?: User }>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const bootstrapSession = async () => {
    try {
      let response = await fetch('/api/auth/me', { credentials: 'include' });
      if (!response.ok) {
        const refreshed = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        if (refreshed.ok) {
          response = await fetch('/api/auth/me', { credentials: 'include' });
        }
      }

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
          localStorage.setItem('trustgov_user', JSON.stringify(data.user));
          return;
        }
      }

      setUser(null);
      localStorage.removeItem('trustgov_user');
    } catch (error) {
      const savedUser = localStorage.getItem('trustgov_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    bootstrapSession();
  }, []);

  const register = async (payload: { name: string; email: string; phone: string; password: string }) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  };

  const sendOtp = async (loginMethod: LoginMethod, identifier: string) => {
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginMethod, identifier }),
    });
    return await res.json();
  };

  const verifyOtp = async (loginMethod: LoginMethod, identifier: string, otp: string) => {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginMethod, identifier, otp }),
    });

    const data = await res.json();
    if (data.success && data.user) {
      setUser(data.user);
      localStorage.setItem('trustgov_user', JSON.stringify(data.user));
    }
    return data;
  };

  const logout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    setUser(null);
    localStorage.removeItem('trustgov_user');
  };

  return (
    <AuthContext.Provider value={{ user, register, sendOtp, verifyOtp, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
