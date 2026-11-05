import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const DEMO_ACCOUNTS = [
  { label: 'Admin Commander', email: 'admin@example.com', password: 'ChangeThisStrongPassword1', role: 'admin' },
  { label: 'Verified Medic', email: 'medic@demo.lifeline', password: 'DemoPass123', role: 'medical_responder' },
  { label: 'Civilian Citizen', email: 'citizen@demo.lifeline', password: 'DemoPass123', role: 'citizen' },
  { label: 'Volunteer Responder', email: 'volunteer@demo.lifeline', password: 'DemoPass123', role: 'volunteer' },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('lifeline_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('lifeline_token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('lifeline_token', token);
    } else {
      localStorage.removeItem('lifeline_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('lifeline_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('lifeline_user');
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      setUser(res.data.user);
      setToken(res.data.token);
      return { success: true, user: res.data.user };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role = 'citizen', skills = []) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password, role, skills });
      setUser(res.data.user);
      setToken(res.data.token);
      return { success: true, user: res.data.user };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('lifeline_token');
    localStorage.removeItem('lifeline_user');
  };

  const switchDemoPersona = async (demoAccount) => {
    return await login(demoAccount.email, demoAccount.password);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, switchDemoPersona }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
