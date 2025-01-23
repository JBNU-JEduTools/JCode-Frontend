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
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <AppBar position="fixed">
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ height: 80 }}>
          {/* 로고 */}
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              mr: 4,
              display: 'flex',
              fontWeight: 700,
              color: 'primary.main',
              textDecoration: 'none',
              alignItems: 'center',
            }}
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
              {(user.role === 'professor' || user.role === 'assistant' || user.role === 'admin') && (
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

              {/* Admin 전용 메뉴 */}
              {user.role === 'admin' && (
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