// frontend/src/context/AuthContext.jsx
// Centralized authentication state management wired to HTTP-only cookie backend.

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accountNotice, setAccountNotice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate user session from /auth/me on initial mount
  const checkAuth = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      if (res?.data?.user) {
        setUser(res.data.user);
        setAccountNotice(res.data.accountNotice || null);
      } else {
        setUser(null);
        setAccountNotice(null);
      }
    } catch {
      setUser(null);
      setAccountNotice(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res?.data?.user) {
      setUser(res.data.user);
      setAccountNotice(res.data.accountNotice || null);
    }
    return res;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    if (res?.data?.user) {
      setUser(res.data.user);
      setAccountNotice(null);
    }
    return res;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Clear client state even if logout request fails
    } finally {
      setUser(null);
      setAccountNotice(null);
    }
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  const value = {
    user,
    accountNotice,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isActive: user?.status === 'active',
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
