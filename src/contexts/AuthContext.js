import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { jwtDecode } from 'jwt-decode';
import { mockUsers } from '../mockData/users';
import axios from '../api/axios';
import { AUTH_CONFIG } from '../config/auth';
import { logout as authLogout } from '../api/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const setTokens = useAuthStore((state) => state.setTokens);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    if (accessToken) {
      try {
        const decodedToken = jwtDecode(accessToken);
        console.log('디코딩된 토큰:', decodedToken);

        if (decodedToken.exp * 1000 < Date.now()) {
          console.log('토큰이 만료되었습니다.');
          clearAuth();
        } else {
          const userData = {
            username: decodedToken.preferred_username || decodedToken.name,
            email: decodedToken.email,
            roles: decodedToken.realm_access?.roles || [],
            sub: decodedToken.sub,
            role: 'STUDENT'
          };
          console.log('설정된 사용자 정보:', userData);
          setUser(userData);
        }
      } catch (error) {
        console.error('토큰 디코딩 실패:', error);
        clearAuth();
      }
    }
    setLoading(false);
  }, [accessToken, setUser, clearAuth]);

  const logout = () => {
    clearAuth();
    authLogout();
  };

  const value = {
    user,
    isAuthenticated: !!accessToken && !!user,
    loading,
    logout
  };

  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const AuthProviderOld = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // OIDC 로그인 성공 후 처리
    const handleOidcSuccess = async () => {
      try {
        const response = await axios.get('/api/auth/login/oidc/success');
        const { data } = response;
        
        if (data.token) {
          console.log('OIDC 로그인 성공:', data);
          sessionStorage.setItem('token', data.token);
          sessionStorage.setItem('userRole', data.role.toUpperCase());
          
          const tokenPayload = jwtDecode(data.token);
          const userData = {
            id: tokenPayload.sub,
            email: tokenPayload.sub,
            role: data.role.toUpperCase()
          };
          
          setUser(userData);
          window.location.href = '/jcode';  // 학생은 JCode로 리다이렉트
        }
      } catch (error) {
        console.error('OIDC 로그인 처리 실패:', error);
      }
    };

    // URL이 OIDC 성공 경로인 경우 처리
    if (window.location.pathname === '/api/auth/login/oidc/success') {
      handleOidcSuccess();
    }

    const token = sessionStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // 토큰 만료 확인
        if (decoded.exp * 1000 < Date.now()) {
          sessionStorage.removeItem('token');
          setUser(null);
          setLoading(false);
          return;
        }
        
        // 토큰에서 사용자 정보 복원
        const userData = {
          id: decoded.sub,
          email: decoded.sub,
          role: decoded.role || sessionStorage.getItem('userRole') || 'STUDENT'  // 저장된 role 사용
        };
        setUser(userData);

        // 자동 로그아웃 타이머 설정
        const timeUntilExpiry = decoded.exp * 1000 - Date.now();
        const logoutTimer = setTimeout(() => {
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('userRole');
          setUser(null);
        }, timeUntilExpiry);
        
        setLoading(false);
        
        return () => clearTimeout(logoutTimer);
      } catch (error) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('userRole');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      console.log('로그인 시도:', { email });

      // 개발 환경에서는 목업 데이터 사용
      if (false && process.env.NODE_ENV === 'development') {
        const foundUser = mockUsers.find(
          user => user.email === email && user.password === password
        );
        
        if (foundUser) {
          const userInfo = {
            ...foundUser,
            exp: Date.now() + 24 * 60 * 60 * 1000 // 24시간 후 만료
          };
          const mockToken = btoa(unescape(encodeURIComponent(JSON.stringify(userInfo))));
          sessionStorage.setItem('token', mockToken);
          sessionStorage.setItem('userRole', userInfo.role.toUpperCase());
          setUser(userInfo);
          return { success: true, user: userInfo };
        }
        return {
          success: false,
          message: '이메일 또는 비밀번호가 올바르지 않습니다.'
        };
      }

      // 운영 환경에서는 실제 API 호출
      const response = await axios.post('/api/auth/login/basic', {
        email,
        password
      });

      console.log('로그인 응답:', response.data);

      const { data } = response;
      
      if (data.token) {
        console.log('토큰 저장:', data.token);
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('userRole', data.role.toUpperCase());

        // JWT 토큰에서 사용자 정보 디코딩
        try {
          const tokenPayload = jwtDecode(data.token);
          console.log('토큰 페이로드:', tokenPayload);
          
          const userData = {
            id: tokenPayload.sub,  // JWT의 subject는 보통 사용자 식별자
            email: tokenPayload.sub,  // 이메일을 subject로 사용
            role: data.role.toUpperCase()  // 응답에서 role을 가져와서 대문자로 변환
          };
          
          console.log('사용자 정보:', userData);
          setUser(userData);
          return { success: true, user: userData };
        } catch (error) {
          console.error('토큰 디코딩 실패:', error);
          return {
            success: false,
            message: '사용자 정보를 가져오는데 실패했습니다.'
          };
        }
      }
      return { 
        success: false, 
        message: '로그인에 실패했습니다.' 
      };
    } catch (error) {
      console.error('로그인 에러:', error);
      console.error('에러 응답:', error.response?.data);
      return { 
        success: false, 
        message: error.response?.status === 401 
          ? '이메일 또는 비밀번호가 올바르지 않습니다.'
          : error.response?.data?.message || '로그인에 실패했습니다.'
      };
    }
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userRole');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 