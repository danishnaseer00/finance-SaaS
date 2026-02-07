import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { signInWithGoogle } from '../config/firebase';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const response = await api.get('/auth/profile');
          setUser(response.data.user);
        } catch (error) {
          console.error('Auth init error:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { user, token } = response.data;
    
    localStorage.setItem('token', token);
    setToken(token);
    setUser(user);
    
    return user;
  };

  const register = async (email, password, name) => {
    const response = await api.post('/auth/register', { email, password, name });
    const { user, token } = response.data;
    
    localStorage.setItem('token', token);
    setToken(token);
    setUser(user);
    
    return user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const googleLogin = async () => {
    const { idToken } = await signInWithGoogle();
    const response = await api.post('/auth/google', { idToken });
    const { user, token } = response.data;
    
    localStorage.setItem('token', token);
    setToken(token);
    setUser(user);
    
    return user;
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    googleLogin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
