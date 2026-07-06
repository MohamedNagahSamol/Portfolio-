import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api, { setTokenGetter, setRefreshTokenFn } from '../api';

const AuthContext = createContext(null);

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      if (data.success) {
        setAccessToken(data.data.accessToken);
        setUser({ email });
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Refresh failed');
      const data = await response.json();
      if (data.success) {
        setAccessToken(data.data.accessToken);
        return data.data.accessToken;
      }
    } catch (err) {
      console.error('Refresh token error:', err);
    }
    setAccessToken(null);
    setUser(null);
    return null;
  }, []);

  // Try silent refresh on mount
  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        await refreshToken();
      } finally {
        if (isMounted) setInitializing(false);
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, [refreshToken]);

  // Wire token getter/refresh into api.js interceptors
  useEffect(() => {
    setTokenGetter(() => accessToken);
    setRefreshTokenFn(() => refreshToken());
  }, [accessToken, refreshToken]);

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout');
    } catch { /* ignore */ }
    setAccessToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, initializing, login, logout, refreshToken, isAuthenticated: !!accessToken }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
