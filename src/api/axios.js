import axios from 'axios';
import keycloak from '../config/keycloak';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  async (config) => {
    if (keycloak.authenticated) {
      // 토큰이 곧 만료되면 갱신 (30초 이내로 남았을 때)
      const minValidity = 240;
      try {
        await keycloak.updateToken(minValidity);
        console.log('API 요청 중 토큰 갱신 성공');
      } catch (error) {
        console.error('API 요청 중 토큰 갱신 실패:', error);
        keycloak.login();
        return Promise.reject(error);
      }
      config.headers.Authorization = `Bearer ${keycloak.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api; 