import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { mockUsers } from '../mockData/users';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // base64로 인코딩된 토큰을 디코딩
        const decoded = JSON.parse(decodeURIComponent(escape(atob(token))));
        setUser(decoded);
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // TODO: API 구현 필요 - POST /api/auth/login
    // Request: { email, password }
    // Response: { token, user }
    // 목업 데이터에서 사용자 찾기
    const foundUser = mockUsers.find(
      user => user.email === email && user.password === password
    );
    
    if (foundUser) {
      // 실제 토큰 대신 사용자 정보를 JSON 문자열로 저장
      const userInfo = {
        ...foundUser,
        exp: Date.now() + 24 * 60 * 60 * 1000 // 24시간 후 만료
      };
      // UTF-8 문자열을 base64로 안전하게 인코딩
      const mockToken = btoa(unescape(encodeURIComponent(JSON.stringify(userInfo))));
      localStorage.setItem('token', mockToken);
      setUser(userInfo);
      return { success: true };
    }
    
    return { 
      success: false, 
      message: '이메일 또는 비밀번호가 올바르지 않습니다.' 
    };
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 