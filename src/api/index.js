import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true  // 쿠키 전송을 위해 필요
});

export const auth = {
  login: () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/oauth2/authorization/keycloak`;
  },
  logout: () => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `${process.env.REACT_APP_API_URL}/logout`;
    document.body.appendChild(form);
    form.submit();
  },
  getUser: () => api.get('/api/users/me')
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