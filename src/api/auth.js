import { AUTH_CONFIG } from '../config/auth';
import { useAuthStore } from '../store/useAuthStore';
import api from './axios';
import { jwtDecode } from 'jwt-decode';

export const getLoginUrl = () => {
  const params = new URLSearchParams({
    client_id: AUTH_CONFIG.clientId,
    redirect_uri: AUTH_CONFIG.redirectUri,
    response_type: 'code',
    scope: AUTH_CONFIG.scope,
  });

  return `${AUTH_CONFIG.keycloakUrl}/auth?${params.toString()}`;
};

export const logout = async () => {
  const authState = useAuthStore.getState();
  console.log('Auth State:', authState); // 전체 상태 확인
  const idToken = authState.idToken;
  
  console.log('Logout - ID Token:', idToken); // 디버깅용
  console.log('Session Storage idToken:', sessionStorage.getItem('idToken')); // sessionStorage 확인
  
  if (idToken) {
    // ID 토큰이 있으면 자동 로그아웃 후 홈으로 리다이렉트
    const params = new URLSearchParams({
      id_token_hint: idToken,
      post_logout_redirect_uri: window.location.origin
    });
    
    const logoutUrl = `${AUTH_CONFIG.keycloakUrl}/logout?${params.toString()}`;
    console.log('Logout URL:', logoutUrl); // 디버깅용
    
    // 로컬 상태 초기화를 URL 리다이렉트 전에 수행
    useAuthStore.getState().clearAuth();
    
    window.location.href = logoutUrl;
  } else {
    // ID 토큰이 없으면 키클락 로그아웃 페이지로 리다이렉트
    // 로컬 상태 초기화
    useAuthStore.getState().clearAuth();
    window.location.href = `${AUTH_CONFIG.keycloakUrl}/logout`;
  }
};

export const fetchToken = async (code) => {
  const tokenBody = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: AUTH_CONFIG.clientId,
    code: code,
    redirect_uri: AUTH_CONFIG.redirectUri,
    scope: AUTH_CONFIG.scope
  });

  const response = await fetch(AUTH_CONFIG.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: tokenBody
  });

  if (!response.ok) {
    throw new Error(`Token request failed: ${response.status}`);
  }

  const data = await response.json();
  console.log('Received tokens:', data); // 디버깅용
  useAuthStore.getState().setTokens(data.access_token, data.refresh_token, data.id_token);
  return data;
};

export const refreshAccessToken = async (refreshToken) => {
  const tokenBody = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: AUTH_CONFIG.clientId,
    refresh_token: refreshToken
  });

  const response = await fetch(AUTH_CONFIG.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: tokenBody
  });

  if (!response.ok) {
    throw new Error(`Token refresh failed: ${response.status}`);
  }

  const data = await response.json();
  useAuthStore.getState().setTokens(data.access_token, data.refresh_token);
  return data;
};

// 백엔드로 토큰 전송
export const sendTokenToBackend = async (accessToken) => {
    const response = await fetch('http://localhost:8080/api/auth/token', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
    });
  
    if (!response.ok) {
      throw new Error('Failed to send token to backend');
    }
  
    return response.json();
  };

// 일반 로그인 함수 추가
export const login = async (email, password) => {
  try {
    const response = await api.post('/api/auth/login/basic', {
      email,
      password
    });

    const { data } = response;
    
    if (data.token) {
      useAuthStore.getState().setTokens(data.token, data.refreshToken);
      
      const tokenPayload = jwtDecode(data.token);
      const userData = {
        username: tokenPayload.preferred_username || tokenPayload.name,
        email: tokenPayload.email,
        roles: tokenPayload.realm_access?.roles || [],
        sub: tokenPayload.sub,
        role: data.role
      };
      
      useAuthStore.getState().setUser(userData);
      return { success: true, user: userData };
    }
    
    return { 
      success: false, 
      message: '로그인에 실패했습니다.' 
    };
  } catch (error) {
    console.error('로그인 에러:', error);
    return { 
      success: false, 
      message: error.response?.status === 401 
        ? '이메일 또는 비밀번호가 올바르지 않습니다.'
        : error.response?.data?.message || '로그인에 실패했습니다.'
    };
  }
}; 