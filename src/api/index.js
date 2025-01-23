import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

export const users = {
  getAll: () => api.get('/users'),
  update: (id, data) => api.put(`/users/${id}`, data),
  create: (userData) => api.post('/users', userData),
};

export const classes = {
  getAll: () => api.get('/classes'),
  getStudents: (classId) => api.get(`/classes/${classId}/students`),
};

export const codeServer = {
  getUrl: (userId) => api.get(`/code-server/${userId}/url`),
};

export default api; 