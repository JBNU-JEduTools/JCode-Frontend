import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
});

// 요청 인터셉터 추가
api.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 추가 (토큰 만료 처리)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // 토큰이 만료되었고, 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        const { refreshAccessToken } = await import('./auth');
        const response = await refreshAccessToken(refreshToken);
        
        useAuthStore.getState().setTokens(response.access_token, response.refresh_token);
        
        originalRequest.headers.Authorization = `Bearer ${response.access_token}`;
        return api(originalRequest);
      } catch (error) {
        // 리프레시 토큰도 만료된 경우
        useAuthStore.getState().clearTokens();
        window.location.href = '/';
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 