import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { ThemeProvider } from './contexts/ThemeContext';
import { useTheme } from './contexts/ThemeContext';
import { useLocation } from 'react-router-dom';
import { getTheme } from './theme';
import PrivateRoute from './components/layout/PrivateRoute';
import { routes } from './routes';
import { Box } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LoginCallback } from './features/auth';
import { getDefaultRoute } from './routes';

const AppRoutes = () => {
  const { loading, isAuthenticated, user } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <Routes>
      {/* routes.js에 정의된 모든 라우트 사용 */}
      {routes.map(({ path, element: Element, roles }) => (
        <Route
          key={path}
          path={path}
          element={
            roles.length > 0 ? (
              <PrivateRoute roles={roles}>
                <Element />
              </PrivateRoute>
            ) : (
              <Element />
            )
          }
        />
      ))}
      
      {/* 로그인 콜백 라우트 추가 */}
      <Route path="/login/success" element={<LoginCallback />} />

      {/* 정의되지 않은 경로는 홈으로 리다이렉트 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const ThemedApp = () => {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const location = useLocation();
  const isLoginRoute = location.pathname === '/' || location.pathname.startsWith('/login');

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: '100vh',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: (theme) => theme.palette.background.default,
          // 라이트 모드 기본: 로그인 화면이 아닐 땐 순수 흰색 배경 유지 (보케 제거)
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            background: 'transparent',
            backgroundRepeat: 'no-repeat, no-repeat, no-repeat',
            backgroundSize: '160% 160%, 200% 200%, 100% 100%',
            backgroundPosition: '12% 8%, 88% 90%, 0 0'
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            width: 800,
            height: 800,
            right: -160,
            top: -160,
            zIndex: 0,
            background: 'transparent',
            filter: 'blur(16px)'
          },
          // 전체 페이지 배경: 로그인 화면에서만 글래스 보케 적용
          ...(isLoginRoute ? {
            '@keyframes moveLoginBg': {
              '0%': {
                backgroundPosition: '12% 8%, 88% 90%, 0 0'
              },
              '25%': {
                backgroundPosition: '18% 12%, 82% 88%, 0 0'
              },
              '50%': {
                backgroundPosition: '24% 18%, 76% 84%, 0 0'
              },
              '75%': {
                backgroundPosition: '18% 24%, 82% 78%, 0 0'
              },
              '100%': {
                backgroundPosition: '12% 8%, 88% 90%, 0 0'
              }
            },
            '@keyframes floatLoginBlob': {
              '0%': {
                transform: 'translate(0px, 0px) scale(1)'
              },
              '25%': {
                transform: 'translate(-120px, 60px) scale(1.04)'
              },
              '50%': {
                transform: 'translate(-40px, 120px) scale(1.08)'
              },
              '75%': {
                transform: 'translate(80px, 40px) scale(1.04)'
              },
              '100%': {
                transform: 'translate(0px, 0px) scale(1)'
              }
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              zIndex: 0,
              background: isDarkMode
                ? 'radial-gradient(900px 700px at 10% 5%, rgba(189,147,249,0.32), transparent 60%),\
                   radial-gradient(1000px 900px at 90% 95%, rgba(255,121,198,0.30), transparent 60%),\
                   linear-gradient(180deg, rgba(10,10,14,0.96) 0%, rgba(10,10,14,0.96) 100%)'
                : 'radial-gradient(900px 700px at 10% 5%, rgba(98,114,164,0.6), transparent 60%),\
                   radial-gradient(1000px 900px at 90% 95%, rgba(68,71,90,0.6), transparent 60%),\
                   linear-gradient(180deg, rgba(245,247,255,0.90) 0%, rgba(245,247,255,0.90) 100%)',
              backgroundRepeat: 'no-repeat, no-repeat, no-repeat',
              backgroundSize: '160% 160%, 200% 200%, 100% 100%',
              backgroundPosition: '12% 8%, 88% 90%, 0 0',
              willChange: 'background-position',
              animation: 'moveLoginBg 30s linear infinite'
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              width: 800,
              height: 800,
              right: -160,
              top: -160,
              zIndex: 0,
              background: isDarkMode
                ? 'radial-gradient(closest-side, rgba(189,147,249,0.26), transparent)'
                : 'radial-gradient(closest-side, rgba(98,114,164,0.25), transparent)',
              filter: 'blur(16px)',
              animation: 'floatLoginBlob 36s linear infinite',
              willChange: 'transform'
            }
          } : {})
        }}
      >
        <Navbar />
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            pt: isLoginRoute ? 0 : 10,
            pb: 4,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            zIndex: 1
          }}
        >
          <AppRoutes />
        </Box>
        <Footer />
      </Box>
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        theme={isDarkMode ? "dark" : "light"}
        limit={1}
        style={{
          fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
        }}
      />
    </MuiThemeProvider>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <ThemedApp />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
