import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../api';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 쿠키에서 JWT 토큰을 파싱하여 사용자 정보 설정
  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await auth.getUser();
        console.log('사용자 정보:', response.data);  // 데이터 구조 확인
        
        const { roles, ...userData } = response.data;
        
        setUser({
          ...userData,
          roles: [userData.role],  // 단일 role을 배열로 변환
          role: userData.role      // 원래 role 유지
        });
      } catch (error) {
        console.error('사용자 정보 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = () => {
    auth.login();
  };

  const logout = () => {
    auth.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
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