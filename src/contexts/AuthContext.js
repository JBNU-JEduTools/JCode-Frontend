import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import keycloak from '../config/keycloak';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const initializingRef = useRef(false);  // 초기화 상태를 추적하기 위한 ref

  // 토큰을 세션 스토리지에 저장하는 함수
  const saveTokens = (tokens) => {
    if (tokens.access_token) {
      sessionStorage.setItem('accessToken', tokens.access_token);
    }
    if (tokens.refresh_token) {
      sessionStorage.setItem('refreshToken', tokens.refresh_token);
    }
    if (tokens.id_token) {
      sessionStorage.setItem('idToken', tokens.id_token);
    }
  };

  useEffect(() => {
    const initKeycloak = async () => {
      if (initializingRef.current) {
        return;
      }
      initializingRef.current = true;

      try {
        if (!keycloak.authenticated) {
          const authenticated = await keycloak.init({
            pkceMethod: 'S256',
            checkLoginIframe: false,
            onAuthSuccess: () => {
              saveTokens({
                access_token: keycloak.token,
                refresh_token: keycloak.refreshToken,
                id_token: keycloak.idToken
              });
            }
          });

          if (authenticated) {
            const userProfile = await keycloak.loadUserProfile();
            const roles = (keycloak.tokenParsed.resource_access?.jcodehub?.roles || [])
              .map(role => role.toUpperCase());
            
            setUser({
              ...userProfile,
              roles: roles,
              role: roles.includes('ADMIN') ? 'ADMIN' :
                    roles.includes('PROFESSOR') ? 'PROFESSOR' :
                    roles.includes('ASSISTANCE') ? 'ASSISTANCE' : 'STUDENT'
            });

            saveTokens({
              access_token: keycloak.token,
              refresh_token: keycloak.refreshToken,
              id_token: keycloak.idToken
            });
          }
        }

        setInitialized(true);
        setLoading(false);
      } catch (error) {
        console.error('Keycloak initialization failed:', error);
        setLoading(false);
      } finally {
        initializingRef.current = false;
      }
    };

    initKeycloak();
  }, []);

  // 토큰 갱신 시에도 세션 스토리지 업데이트
  useEffect(() => {
    if (initialized && keycloak.authenticated) {
      keycloak.onTokenExpired = () => {
        keycloak.updateToken(70).then(() => {
          // 새로운 토큰을 세션 스토리지에 저장
          saveTokens({
            access_token: keycloak.token,
            refresh_token: keycloak.refreshToken,
            id_token: keycloak.idToken
          });
        }).catch(() => {
          console.error('Failed to refresh token');
        });
      };
    }
  }, [initialized]);

  const login = () => {
    keycloak.login();
  };

  const logout = () => {
    // id_token_hint를 사용한 로그아웃을 먼저 실행
    const idToken = keycloak.idToken;  // 미리 저장
    
    keycloak.logout({
      redirectUri: window.location.origin,
      idToken: idToken  // 저장된 idToken 사용
    });

    // 그 다음 세션 스토리지 클리어
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('idToken');
  };

  const value = {
    initialized,
    loading,
    user,
    login,
    logout,
    keycloak
  };

  if (!initialized) {
    return <div>Loading...</div>;
  }

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