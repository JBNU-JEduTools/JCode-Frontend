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
    const now = new Date().toISOString();
    if (tokens.access_token) {
      sessionStorage.setItem('accessToken', tokens.access_token);
      console.log(`[${now}] 액세스 토큰 저장됨`);
    }
    if (tokens.refresh_token) {
      sessionStorage.setItem('refreshToken', tokens.refresh_token);
      console.log(`[${now}] 리프레시 토큰 저장됨`);
    }
    if (tokens.id_token) {
      sessionStorage.setItem('idToken', tokens.id_token);
      console.log(`[${now}] ID 토큰 저장됨`);
    }
  };

  useEffect(() => {
    const initKeycloak = async () => {
      if (initializingRef.current) {
        return;
      }
      initializingRef.current = true;

      try {
        const storedToken = sessionStorage.getItem('accessToken');
        console.log('초기화 시작 - 저장된 토큰 존재:', !!storedToken);
        
        const authenticated = await keycloak.init({
          pkceMethod: 'S256',
          checkLoginIframe: false,
          token: storedToken,
          onLoad: 'check-sso',
          silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
          silentCheckSsoFallback: false,
          enableLogging: true,
          iframeTarget: '_blank',
          onTokenExpired: () => {
            console.log('토큰 만료 감지:', new Date().toISOString());
          },
          onAuthSuccess: () => {
            console.log('인증 성공:', new Date().toISOString());
          },
          onAuthError: (error) => {
            console.error('인증 에러:', error);
          }
        });

        console.log('Keycloak 초기화 결과:', authenticated);

        if (authenticated) {
          console.log('인증 성공 - 토큰 정보 로드 시작');
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
        console.error('Keycloak 초기화 실패:', error);
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
      keycloak.onTokenExpired = async () => {
        try {
          const refreshed = await keycloak.updateToken(240); // 30초 남았을 때 갱신 시도
          if (refreshed) {
            saveTokens({
              access_token: keycloak.token,
              refresh_token: keycloak.refreshToken,
              id_token: keycloak.idToken
            });
            console.log('토큰이 성공적으로 갱신되었습니다.');
          }
        } catch (error) {
          console.error('토큰 갱신 실패:', error);
          //logout();
        }
      };

      // 2분마다 토큰 유효성 검사 (토큰 수명 5분의 40% 주기)
      const tokenCheckInterval = setInterval(async () => {
        if (keycloak.token) {
          try {
            await keycloak.updateToken(30);
          } catch (error) {
            console.error('주기적 토큰 갱신 실패:', error);
            logout();
          }
        }
      }, 120000); // 2분 = 120000ms

      return () => {
        clearInterval(tokenCheckInterval);
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