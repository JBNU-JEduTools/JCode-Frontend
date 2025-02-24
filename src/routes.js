import LoginPage from './pages/auth/LoginPage';
import WatcherPage from './pages/watcher/WatcherPage';
import AdminPage from './pages/admin/AdminPage';
import WebIDECourses from './components/webide/WebIDECourses';
import ProfileSetup from './components/auth/ProfileSetup';
import ProfileSettings from './components/profile/ProfileSettings';
//import HomePage from './pages/HomePage';

export const routes = [
  {
    path: '/',  // 홈 페이지를 로그인 페이지로 변경
    element: LoginPage,
    roles: [], // 누구나 접근 가능
    showInNav: false,
  },
  {
    path: '/login',
    element: LoginPage,
    roles: [], // 빈 배열은 누구나 접근 가능
    showInNav: false,
  },
  {
    path: '/profile-setup',
    element: ProfileSetup,
    roles: ['STUDENT', 'PROFESSOR', 'ASSISTANT', 'ADMIN'], // 인증된 사용자만 접근 가능
    showInNav: false,
    //skipProfileCheck: true, // 프로필 체크 스킵 플래그 추가
  },
  {
    path: '/profile/settings',
    element: ProfileSettings,
    roles: ['STUDENT', 'PROFESSOR', 'ASSISTANT', 'ADMIN'], // 인증된 사용자만 접근 가능
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
  if (!role) return '/login';  // 로그인하지 않은 경우 로그인 페이지로
  
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'PROFESSOR':
    case 'ASSISTANCE':
      return '/watcher';
    case 'STUDENT':
      return '/webide';
    default:
      return '/login';
  }
}; 