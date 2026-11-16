import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../api/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('lifelink_token') || null);
  const [loading, setLoading] = useState(true);

  // Load user profile on mount if token exists
  const loadUser = useCallback(async () => {
    const savedToken = localStorage.getItem('lifelink_token');
    if (!savedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await authService.getMe();
      if (data?.success && data?.user) {
        setUser(data.user);
        localStorage.setItem('lifelink_user', JSON.stringify(data.user));
      }
    } catch (err) {
      console.warn('Session expired or invalid token:', err.message);
      localStorage.removeItem('lifelink_token');
      localStorage.removeItem('lifelink_user');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Login handler
  const login = async (credentials) => {
    const data = await authService.login(credentials);
    if (data.success && data.token) {
      localStorage.setItem('lifelink_token', data.token);
      localStorage.setItem('lifelink_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data;
    }
    throw new Error(data.message || 'Login failed');
  };

  // Register handler
  const register = async (userData) => {
    const data = await authService.register(userData);
    if (data.success && data.token) {
      localStorage.setItem('lifelink_token', data.token);
      localStorage.setItem('lifelink_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data;
    }
    throw new Error(data.message || 'Registration failed');
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('lifelink_token');
    localStorage.removeItem('lifelink_user');
    setToken(null);
    setUser(null);
  };

  // Refresh user data (e.g. after profile edit or availability toggle)
  const refreshUser = async () => {
    try {
      const data = await authService.getMe();
      if (data?.success && data?.user) {
        setUser(data.user);
        localStorage.setItem('lifelink_user', JSON.stringify(data.user));
        return data.user;
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
    return null;
  };

  const updateLocalUser = (updatedData) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedData };
      localStorage.setItem('lifelink_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        refreshUser,
        updateLocalUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
