import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  Container,
  IconButton
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  console.log('현재 사용자:', user);  // 디버깅용

  const handleLogoClick = () => {
    if (user) {
      // 사용자 역할에 따른 리다이렉트
      switch (user.role) {
        case 'ADMIN':
          navigate('/admin');
          break;
        case 'PROFESSOR':
        case 'ASSISTANT':
          navigate('/watcher');
          break;
        case 'STUDENT':
          navigate('/jcode');
          break;
        default:
          navigate('/');
      }
    } else {
      navigate('/');
    }
  };

  return (
    <AppBar position="fixed">
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ height: 80 }}>
          {/* 로고 */}
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ 
              mr: 2, 
              cursor: 'pointer',
              fontWeight: 'bold',
              color: 'black'
            }}
            onClick={handleLogoClick}
          >
            JHub
          </Typography>

          {/* 메인 메뉴 - 로그인 된 경우만 표시 */}
          {user && (
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {/* JCode - 모든 사용자 접근 가능 */}
              <Button
                component={RouterLink}
                to="/jcode"
                sx={{ 
                  my: 2, 
                  color: 'primary.main',
                  fontWeight: 600,
                  fontSize: '1rem',
                  mx: 1
                }}
              >
                JCode
              </Button>

              {/* Watcher - 교수/조교/관리자만 접근 가능 */}
              {(user.role === 'PROFESSOR' || user.role === 'ASSISTANT' || user.role === 'ADMIN') && (
                <Button
                  component={RouterLink}
                  to="/watcher"
                  sx={{ 
                    my: 2, 
                    color: 'primary.main',
                    fontWeight: 600,
                    fontSize: '1rem',
                    mx: 1
                  }}
                >
                  Watcher
                </Button>
              )}

              {/* 관리자 메뉴 */}
              {user.role === 'ADMIN' && (
                <Button
                  component={RouterLink}
                  to="/admin"
                  sx={{ 
                    my: 2, 
                    color: 'primary.main',
                    fontWeight: 600,
                    fontSize: '1rem',
                    mx: 1
                  }}
                >
                  관리자
                </Button>
              )}
            </Box>
          )}

          {/* 빈 공간을 만들어 오른쪽 정렬 */}
          <Box sx={{ flexGrow: 1 }} />

          {/* 로그인/회원가입/로그아웃 버튼 */}
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            {user ? (
              <Button
                onClick={logout}
                variant="contained"
                sx={{
                  bgcolor: 'secondary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'secondary.dark',
                  },
                }}
              >
                로그아웃
              </Button>
            ) : (
              <>
                <Button
                  component={RouterLink}
                  to="/login"
                  sx={{ 
                    color: 'primary.main',
                    fontWeight: 600,
                    mr: 2
                  }}
                >
                  로그인
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  sx={{
                    bgcolor: 'secondary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'secondary.dark',
                    },
                  }}
                >
                  회원가입
                </Button>
              </>
            )}
          </Box>

          {/* 모바일 메뉴 버튼 */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="menu"
              sx={{ color: 'primary.main' }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 