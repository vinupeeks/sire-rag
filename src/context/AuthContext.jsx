import { createContext, useContext, useEffect, useState } from 'react';
import { signIn } from '../services/authService';
import { useLocalStorage } from '../hooks/useLocalStorage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [storedUser, setStoredUser] = useLocalStorage('solmarine_user', null);
  const [user, setUser] = useState(storedUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setUser(storedUser);
    setLoading(false);
  }, [storedUser]);

  const login = async (credentials) => {
    setLoading(true);
    setError(null);

    try {
      const account = await signIn(credentials);
      setStoredUser(account);
      setUser(account);
      return account;
    } catch (error) {
      setError(error.message || 'Unable to sign in');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setStoredUser(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, isAuthenticated: Boolean(user) }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};
