import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('tabrescue_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('tabrescue_token'));
  const [loading, setLoading] = useState(true);
  const { error: toastError, success: toastSuccess } = useToast();

  // Validate token on mount
  useEffect(() => {
    const verifyUser = async () => {
      const savedToken = localStorage.getItem('tabrescue_token');
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await authApi.getMe();
        if (res.success && res.user) {
          setUser(res.user);
          localStorage.setItem('tabrescue_user', JSON.stringify(res.user));
        }
      } catch (err) {
        console.warn('Authentication token verification failed:', err.message);
        logout(false);
      } finally {
        setLoading(false);
      }
    };

    verifyUser();

    // Listen for unauthorized events from api.js
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('tabrescue:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('tabrescue:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authApi.login(email, password);
      if (res.success && res.token) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('tabrescue_token', res.token);
        localStorage.setItem('tabrescue_user', JSON.stringify(res.user));
        toastSuccess(`Welcome back, ${res.user.name}!`);
        return { success: true };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err) {
      toastError(err.message || 'Login failed');
      return { success: false, message: err.message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await authApi.register(name, email, password);
      if (res.success && res.token) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('tabrescue_token', res.token);
        localStorage.setItem('tabrescue_user', JSON.stringify(res.user));
        toastSuccess('Account created successfully! Welcome to TabRescue.');
        return { success: true };
      }
      return { success: false, message: res.message || 'Registration failed' };
    } catch (err) {
      toastError(err.message || 'Registration failed');
      return { success: false, message: err.message };
    }
  };

  const logout = (notify = true) => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('tabrescue_token');
    localStorage.removeItem('tabrescue_user');
    if (notify) {
      toastSuccess('You have been signed out.');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await authApi.updateProfile(profileData);
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('tabrescue_user', JSON.stringify(res.user));
        toastSuccess('Profile updated successfully!');
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      toastError(err.message || 'Could not update profile');
      return { success: false, message: err.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        logout,
        updateProfile,
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
