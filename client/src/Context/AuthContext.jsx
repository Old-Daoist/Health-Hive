import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hh_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('hh_token');
    if (token) {
      authAPI.getMe()
        .then(({ data }) => setUser(data))
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('hh_token', data.token);
    localStorage.setItem('hh_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const signup = async (formData) => {
    const { data } = await authAPI.signup(formData);
    localStorage.setItem('hh_token', data.token);
    localStorage.setItem('hh_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('hh_token');
    localStorage.removeItem('hh_user');
    setUser(null);
  }, []);

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    localStorage.setItem('hh_user', JSON.stringify(updated));
    setUser(updated);
  };

  // Normalize role for UI: server uses "regular", UI expects "user"
  const normalizedUser = user ? { ...user, role: user.role === 'regular' ? 'user' : user.role } : null;

  return (
    <AuthContext.Provider value={{ user: normalizedUser, rawUser: user, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
