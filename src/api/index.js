import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true  // 키클락 인증을 위해 필요
});

// 토큰 갱신 함수
const refreshTokenIfNeeded = async () => {
  const token = sessionStorage.getItem('jwt');
  if (!token) return;

  try {
    const decoded = jwtDecode(token);
    const expirationTime = decoded.exp * 1000;
    const timeUntilExpiry = expirationTime - Date.now();
    
    // 만료 3분 전에 갱신 시도
    if (timeUntilExpiry < 3 * 60 * 1000) {
      console.log('Token refresh needed (periodic check)');
      const response = await axios.create({
        baseURL: process.env.REACT_APP_API_URL,
        withCredentials: true
      }).post('/api/auth/refresh', null, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const authHeader = response.headers['authorization'];
      if (authHeader?.startsWith('Bearer ')) {
        const newToken = authHeader.substring(7);
        sessionStorage.setItem('jwt', newToken);
        console.log('Token refreshed successfully');
      }
    }
  } catch (error) {
    console.error('Periodic token refresh failed:', error);
  }
};

// 2분마다 토큰 체크 및 갱신
setInterval(refreshTokenIfNeeded, 2 * 60 * 1000);  // 2분 = 120000ms

export const auth = {
  login: () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/oauth2/authorization/keycloak`;
  },
  getAccessToken: async () => {
    console.log('\n=== Getting Initial Access Token ===');
    try {
      console.log('Requesting token from /api/auth/token');
      const response = await api.post('/api/auth/token');
      
      console.log('Token Response Status:', response.status);
      console.log('Token Response Headers:', response.headers);
      console.log('Authorization Header:', response.headers['authorization']);

      const authHeader = response.headers['authorization'];
      if (!authHeader?.startsWith('Bearer ')) {
        console.error('No Bearer token in Authorization header');
        throw new Error('토큰이 응답 헤더에 없습니다');
      }

      const token = authHeader.substring(7);
      console.log('Token received:', token.substring(0, 20) + '...');
      sessionStorage.setItem('jwt', token);
      console.log('Token saved to sessionStorage');
      
      return token;
    } catch (error) {
      console.error('Token request failed:', error);
      console.error('Error details:', {
        status: error.response?.status,
        headers: error.response?.headers,
        data: error.response?.data
      });
      throw error;
    }
  },
  refreshToken: async () => {
    try {
      const currentToken = sessionStorage.getItem('jwt');
      if (!currentToken) {
        throw new Error('현재 토큰이 없습니다');
      }

      const response = await api.post('/api/auth/refresh', null, {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });

      const authHeader = response.headers['authorization'];  // 'accesstoken'이 아닌 'authorization'
      if (authHeader?.startsWith('Bearer ')) {
        const newToken = authHeader.substring(7);
        sessionStorage.setItem('jwt', newToken);
        return newToken;
      } else {
        throw new Error('새로운 액세스 토큰이 없습니다');
      }
    } catch (error) {
      console.error('토큰 갱신 실패:', error);
      auth.logout();
      throw error;
    }
  },
  logout: () => {
    sessionStorage.removeItem('jwt');
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `${process.env.REACT_APP_API_URL}/logout`;
    document.body.appendChild(form);
    form.submit();
  }
};

// axios 인터셉터에 리프레시 토큰 로직 추가
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고 리프레시 시도하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // 토큰 리프레시 시도
        const newToken = await auth.refreshToken();
        
        // 새 토큰으로 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // 리프레시 실패시 로그인 페이지로
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 