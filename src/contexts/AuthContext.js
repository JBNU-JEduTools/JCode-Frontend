import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../api/axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('jwt');
      
      if (!token) {
        setUser(null);
        return;
      }

      try {
        const decodedToken = jwtDecode(token);
        
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp && decodedToken.exp < currentTime) {
          setUser(null);
          sessionStorage.removeItem('jwt');
          window.location.href = '/login';
          return;
        }
        
        setUser({
          email: decodedToken.sub,
          role: decodedToken.role
        });
      } catch (error) {
        setUser(null);
        sessionStorage.removeItem('jwt');
        window.location.href = '/login';
      }
    } catch (error) {
      setUser(null);
      sessionStorage.removeItem('jwt');
      window.location.href = '/login';
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = () => {
    auth.login();
  };

  const logout = () => {
    setUser(null);
    auth.logout();
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    checkAuth,
    login,
    logout
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