import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { jwtDecode } from 'jwt-decode';
import axios from '../api/axios';
import { AUTH_CONFIG } from '../config/auth';
import { logout as authLogout, login as authLogin } from '../api/auth';

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
            role: decodedToken.role || useAuthStore.getState().user?.role
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
    logout,
    login: authLogin
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