import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { clearAuth, loadAuth, saveAuth } from '../api/authStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Lazy initial state: restore the session after a page refresh.
  const [user, setUser] = useState(() => loadAuth());

  // The Axios interceptor fires this event when the token has expired.
  useEffect(() => {
    const handleExpired = () => setUser(null);
    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, []);

  const startSession = useCallback((data) => {
    saveAuth(data);
    setUser(data);
    return data;
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    return startSession(data);
  }, [startSession]);

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    return startSession(data);
  }, [startSession]);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'ADMIN',
      isCustomer: user?.role === 'CUSTOMER',
      login,
      register,
      logout,
    }),
    [user, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return context;
}
