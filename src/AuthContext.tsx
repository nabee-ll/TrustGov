import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from './lib/utils';

interface AuthContextType {
  user: User | null;
  login: (citizenId: string, password: string) => Promise<{ success: boolean; message: string }>;
  verify: (citizenId: string, otp: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('trustgov_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (citizenId: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ citizenId, password }),
    });
    return await res.json();
  };

  const verify = async (citizenId: string, otp: string) => {
    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ citizenId, otp }),
    });
    const data = await res.json();
    if (data.success) {
      setUser(data.user);
      localStorage.setItem('trustgov_user', JSON.stringify(data.user));
    }
    return data;
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    localStorage.removeItem('trustgov_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, verify, logout, isLoading }}>
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
