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
        console.log('AuthContext: 토큰 없음');
        setUser(null);
        return;
      }

      try {
        const decodedToken = jwtDecode(token);
        console.log('AuthContext: 디코딩된 토큰:', decodedToken);
        console.log('AuthContext: 사용자 역할:', decodedToken.role);

        setUser({
          email: decodedToken.sub,
          role: decodedToken.role
        });
        console.log('AuthContext: 설정된 사용자:', {
          email: decodedToken.sub,
          role: decodedToken.role
        });
      } catch (error) {
        console.error('AuthContext: 토큰 검증 실패:', error);
        setUser(null);
        sessionStorage.removeItem('jwt');
      }
    } catch (error) {
      console.error('AuthContext: 인증 확인 실패:', error);
      setUser(null);
      sessionStorage.removeItem('jwt');
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
    sessionStorage.removeItem('jwt');
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