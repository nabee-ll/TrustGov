import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('it_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const savedUser = localStorage.getItem('it_user');
      if (savedUser) setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, [token]);

  const login = async (pan, password) => {
    const res = await axios.post('/api/auth/login', { pan, password });
    const { token: t, user: u } = res.data;
    localStorage.setItem('it_token', t);
    localStorage.setItem('it_user', JSON.stringify(u));
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    setToken(t);
    setUser(u);
    return res.data;
  };

  const register = async (data) => {
    const res = await axios.post('/api/auth/register', data);
    const { token: t, user: u } = res.data;
    localStorage.setItem('it_token', t);
    localStorage.setItem('it_user', JSON.stringify(u));
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    setToken(t);
    setUser(u);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('it_token');
    localStorage.removeItem('it_user');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
