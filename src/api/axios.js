import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// 요청 인터셉터 - 토큰 추가
instance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    config.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000';
    config.headers['Access-Control-Allow-Credentials'] = 'true';
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // 토큰 만료 등의 인증 에러
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('userRole');
      window.location.href = '/login';
    } else if (error.response?.status === 0) {
      // CORS 에러 또는 네트워크 에러
      console.error('CORS 또는 네트워크 에러:', error);
    }
    return Promise.reject(error);
  }
);

export default instance; 