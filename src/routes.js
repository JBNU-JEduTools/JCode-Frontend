import LoginPage from './pages/auth/LoginPage';
import WatcherPage from './pages/watcher/WatcherPage';
import AdminPage from './pages/admin/AdminPage';
import WebIDECourses from './components/webide/WebIDECourses';

export const routes = [
  {
    path: '/login',
    element: LoginPage,
    roles: [], // 빈 배열은 누구나 접근 가능
    showInNav: false,
  },
  {
    path: '/webide/*',
    element: WebIDECourses,
    roles: ['STUDENT', 'PROFESSOR', 'ASSISTANT', 'ADMIN'],
    showInNav: true,
    label: 'Web-IDE',
    order: 1,
  },
  {
    path: '/watcher/*',
    element: WatcherPage,
    roles: ['PROFESSOR', 'ASSISTANT', 'ADMIN'],
    showInNav: true,
    label: 'Watcher',
    order: 2,
  },
  {
    path: '/admin/*',
    element: AdminPage,
    roles: ['ADMIN'],
    showInNav: true,
    label: 'Admin',
    order: 3,
  }
];

// 사용자 역할에 따른 기본 리다이렉트 경로
export const getDefaultRoute = (role) => {
  switch (role) {
    case 'ADMIN': return '/admin';
    case 'PROFESSOR':
    case 'ASSISTANT': return '/watcher';
    case 'STUDENT': return '/webide';
    default: return '/login';
  }
}; 