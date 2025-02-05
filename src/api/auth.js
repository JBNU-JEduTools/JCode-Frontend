import { AUTH_CONFIG } from '../config/auth';
import { useAuthStore } from '../store/useAuthStore';

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
  const idToken = useAuthStore.getState().idToken;
  
  if (!idToken) {
    console.warn('ID 토큰이 없습니다. 기본 로그아웃을 진행합니다.');
    window.location.href = '/';
    return;
  }
  
  // Keycloak 로그아웃 URL로 리다이렉트
  const params = new URLSearchParams({
    id_token_hint: idToken,
    post_logout_redirect_uri: window.location.origin
  });
  
  const logoutUrl = `${AUTH_CONFIG.keycloakUrl}/logout?${params.toString()}`;
  window.location.href = logoutUrl;
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