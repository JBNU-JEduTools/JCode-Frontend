import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import keycloak from '../config/keycloak';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const initializingRef = useRef(false);

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
        // 세션 스토리지의 토큰 확인
        const storedToken = sessionStorage.getItem('accessToken');
        
        const authenticated = await keycloak.init({
          pkceMethod: 'S256',
          checkLoginIframe: false,
          token: storedToken, // 저장된 토큰 전달
          onLoad: storedToken ? 'check-sso' : 'check-sso', // 토큰이 있으면 SSO 체크
          silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
          silentCheckSsoFallback: false, // SSO 체크 실패시 fallback 비활성화
          enableLogging: false, // 로깅 비활성화
          iframeTarget: '_blank', // iframe 대신 새 창 사용
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

          // 토큰 저장
          saveTokens({
            access_token: keycloak.token,
            refresh_token: keycloak.refreshToken,
            id_token: keycloak.idToken
          });
        }

        setInitialized(true);
      } catch (error) {
        console.error('Keycloak initialization failed:', error);
      } finally {
        setLoading(false);
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