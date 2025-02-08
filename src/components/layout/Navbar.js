import React, { useState, useRef, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  Container,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { routes, getDefaultRoute } from '../../routes';

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, login, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const buttonRefs = useRef([]);
  const [activeButtonPos, setActiveButtonPos] = useState({ left: 0, width: 0 });

  // useEffect를 조건문 이전으로 이동
  useEffect(() => {
    const activeIndex = navItems.findIndex(route => 
      location.pathname === route.path.replace('/*', '')
    );
    
    if (activeIndex >= 0 && buttonRefs.current[activeIndex]) {
      const button = buttonRefs.current[activeIndex];
      const rect = button.getBoundingClientRect();
      const parentRect = button.parentElement.getBoundingClientRect();
      
      setActiveButtonPos({
        left: rect.left - parentRect.left,
        width: rect.width
      });
    }
  }, [location.pathname]);  // navItems 의존성 제거

  if (loading) {
    return null;
  }

  const handleLogoClick = () => {
    if (user) {
      navigate(getDefaultRoute(user.role));
    } else {
      navigate('/');
    }
  };

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  // 현재 경로와 메뉴 경로 비교 함수
  const isCurrentPath = (path) => {
    return location.pathname === path.replace('/*', '');
  };

  // 공통 스타일을 변수로 정의
  const menuButtonStyle = {
    my: 2, 
    fontWeight: 600,
    fontSize: '1rem',
    mx: 1,
    background: 'linear-gradient(45deg, #333333 30%, #666666 90%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    WebkitTextStroke: '0.5px rgba(51, 51, 51, 0.2)',
    textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      height: '2px',
      backgroundColor: 'primary.main',
      transform: 'scaleX(0)',
      transformOrigin: 'right',
      transition: 'transform 0.3s ease'
    },
    '&:hover': {
      transform: 'translateY(-2px)',
      textShadow: '4px 4px 8px rgba(0,0,0,0.2)',
      background: 'linear-gradient(45deg, #444444 30%, #777777 90%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      '&::after': {
        transform: 'scaleX(1)',
        transformOrigin: 'left'
      }
    },
    '&.active::after': {
      transform: 'scaleX(1)'
    }
  };

  // navItems 정의를 useEffect 이전으로 이동
  const navItems = routes
    .filter(route => 
      route.showInNav && 
      (!route.roles.length || route.roles.includes(user?.role))
    )
    .sort((a, b) => a.order - b.order);

  return (
    <AppBar position="fixed">
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ height: 80 }}>
          {/* 로고 */}
          <Typography
            variant="h5"
            noWrap
            component="div"
            className="logo-font-comfortaa"
            sx={{ 
              mr: 2, 
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '1.8rem',
              letterSpacing: '-.05rem',
              background: 'linear-gradient(45deg, #333333 30%, #666666 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              WebkitTextStroke: '1px rgba(51, 51, 51, 0.3)',
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                textShadow: '4px 4px 8px rgba(0,0,0,0.2)',
                background: 'linear-gradient(45deg, #444444 30%, #777777 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }
            }}
            onClick={handleLogoClick}
          >
            J-Code
          </Typography>

          {/* 메인 메뉴 - 로그인 된 경우만 표시 */}
          {user && (
            <Box 
              sx={{ 
                flexGrow: 1, 
                display: { xs: 'none', md: 'flex' },
                position: 'relative',
                alignItems: 'center'
              }}
            >
              {/* 움직이는 바 */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: '15px',
                  left: 0,
                  height: '3px',
                  background: 'linear-gradient(90deg, #333333, #666666)',  // 검정 그라데이션으로 변경
                  boxShadow: '0 0 8px rgba(0, 0, 0, 0.3)',  // 그림자 효과 수정
                  borderRadius: '4px',
                  width: activeButtonPos.width,
                  transform: `translateX(${activeButtonPos.left}px)`,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',  // 반짝임 효과 투명도 조정
                    animation: 'shimmer 2.5s infinite',  // 애니메이션 속도 조정
                  },
                  '@keyframes shimmer': {
                    '0%': {
                      transform: 'translateX(-100%)',
                    },
                    '100%': {
                      transform: 'translateX(100%)',
                    },
                  }
                }}
              />
              
              {navItems.map((route, index) => (
                <Button
                  key={route.path}
                  ref={el => buttonRefs.current[index] = el}  // ref 추가
                  component={RouterLink}
                  to={route.path.replace('/*', '')}
                  sx={{
                    ...menuButtonStyle,
                    px: 2,
                    mx: 1,
                    '&::after': {
                      content: 'none'
                    }
                  }}
                >
                  {route.label}
                </Button>
              ))}
            </Box>
          )}

          {/* 빈 공간을 만들어 오른쪽 정렬 */}
          <Box sx={{ flexGrow: 1 }} />

          {/* 프로필 메뉴 */}
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            {user ? (
              <>
                <IconButton
                  onClick={handleProfileClick}
                  sx={{ p: 0.5 }}
                >
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32, 
                      background: 'linear-gradient(-45deg, #1a1a1a, #4a4a4a, #7a7a7a, #ffffff)',
                      backgroundSize: '400% 400%',
                      animation: 'gradient 15s ease infinite',
                      border: '2px solid rgba(255,255,255,0.3)',
                      fontSize: '0.875rem',
                      fontWeight: 'bold',
                      boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
                      transition: 'all 0.3s ease',
                      '@keyframes gradient': {
                        '0%': {
                          backgroundPosition: '0% 50%'
                        },
                        '50%': {
                          backgroundPosition: '100% 50%'
                        },
                        '100%': {
                          backgroundPosition: '0% 50%'
                        }
                      },
                      '&:hover': {
                        transform: 'translateY(-2px) scale(1.05)',
                        boxShadow: '0 8px 15px rgba(0,0,0,0.2)',
                        cursor: 'pointer',
                        border: '2px solid rgba(255,255,255,0.5)'
                      }
                    }}
                  >
                    {user.email.split('@')[0][0].toUpperCase()}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      minWidth: 200,
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                    }
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      {user.email.split('@')[0]}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                  <Divider />
                  <MenuItem onClick={handleLogout} sx={{ mt: 1 }}>
                    logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                onClick={login}
                sx={menuButtonStyle}
              >
                login
              </Button>
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