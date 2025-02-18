import axios from 'axios';
import { jwtDecode } from 'jwt-decode';  // 중괄호로 named import 사용

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true  // 키클락 인증을 위해 필요
});

// 토큰 만료 체크 (5분 전)
const isTokenExpiringSoon = (token) => {
  try {
    const decoded = jwtDecode(token);
    const expirationTime = decoded.exp * 1000;
    const currentTime = Date.now();
    const timeUntilExpiry = expirationTime - currentTime;
    const isExpiring = timeUntilExpiry < 5 * 60 * 1000;
    
    console.log('Token check:', {
      exp: new Date(expirationTime).toLocaleString(),
      now: new Date(currentTime).toLocaleString(),
      timeLeft: Math.floor(timeUntilExpiry / 1000 / 60) + '분',
      needsRefresh: isExpiring
    });
    
    return isExpiring;
  } catch (error) {
    console.error('Token decode failed:', error);
    return true;
  }
};

// 요청 인터셉터 추가
api.interceptors.request.use(async (config) => {
  // 리프레시 요청은 체크하지 않음
  if (config.url === '/api/auth/refresh') {
    return config;
  }

  console.log('\n=== Request Interceptor Start ===');
  const token = sessionStorage.getItem('jwt');
  console.log('Original request URL:', config.url);
  console.log('Initial token exists:', !!token);
  
  // 토큰이 있고 곧 만료될 예정이면 미리 갱신
  if (token && isTokenExpiringSoon(token)) {
    console.log('Token refresh needed, attempting refresh...');
    try {
      const refreshResponse = await axios.create({
        baseURL: process.env.REACT_APP_API_URL,
        withCredentials: true
      }).post('/api/auth/refresh', null, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Token refresh response status:', refreshResponse.status);
      console.log('New token received in header:', !!refreshResponse.headers['authorization']);
    } catch (error) {
      console.error('Token refresh failed in request interceptor:', error.message);
    }
  }

  // 최신 토큰으로 요청
  const currentToken = sessionStorage.getItem('jwt');
  if (currentToken) {
    config.headers.Authorization = `Bearer ${currentToken}`;
    console.log('Final token attached to request:', currentToken.substring(0, 20) + '...');
  }
  
  console.log('=== Request Interceptor End ===\n');
  return config;
}, (error) => {
  console.error('Request interceptor error:', error);
  return Promise.reject(error);
});

// 응답 인터셉터 추가
api.interceptors.response.use(
  (response) => {
    console.log('\n=== Response Interceptor ===');
    console.log('URL:', response.config.url);
    console.log('Status:', response.status);
    console.log('All Headers:', response.headers);
    console.log('Authorization Header:', response.headers['authorization']);
    
    // Authorization 헤더에서 토큰 확인
    const authHeader = response.headers['authorization'];
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      console.log('New token received:', token.substring(0, 20) + '...');
      sessionStorage.setItem('jwt', token);
    } else {
      console.log('No Authorization header in response');
    }
    
    return response;
  },
  async (error) => {
    console.log('\n=== Error Interceptor ===');
    console.log('Error Status:', error.response?.status);
    console.log('Error Message:', error.message);
    if (error.response) {
      console.log('Error Response Headers:', error.response.headers);
    }
    
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('Attempting token refresh...');
      originalRequest._retry = true;
      
      try {
        const currentToken = sessionStorage.getItem('jwt');
        console.log('Current token:', currentToken ? currentToken.substring(0, 20) + '...' : 'none');
        
        const response = await api.post('/api/auth/refresh');
        console.log('Refresh response headers:', response.headers);
        
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 