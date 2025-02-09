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
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useTheme } from '../../contexts/ThemeContext';
import LogoutIcon from '@mui/icons-material/Logout';

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, login, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const buttonRefs = useRef([]);
  const [activeButtonPos, setActiveButtonPos] = useState({ left: 0, width: 0 });
  const { isDarkMode, toggleDarkMode } = useTheme();

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

  // 메뉴 버튼 스타일 수정
  const menuButtonStyle = {
    my: 2, 
    fontWeight: 'bold',
    fontSize: '1rem',
    mx: 1,
    color: isDarkMode ? '#ffffff' : '#1a1a1a',
    transition: 'all 0.3s ease',
    position: 'relative',
    '&:hover': {
      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',  // 다크모드에서 밝은 회색으로
      color: isDarkMode ? '#ffffff' : '#1a1a1a',  // 다크모드에서 흰색 유지
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
            sx={{ 
              mr: 2, 
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '1.8rem',
              letterSpacing: '-.05rem',
              background: isDarkMode 
                ? 'linear-gradient(45deg, #ffffff 30%, #999999 90%)'
                : 'linear-gradient(45deg, #333333 30%, #666666 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              WebkitTextStroke: isDarkMode 
                ? '1px rgba(255, 255, 255, 0.3)'
                : '1px rgba(51, 51, 51, 0.3)',
              textShadow: isDarkMode
                ? '2px 2px 4px rgba(255,255,255,0.1)'
                : '2px 2px 4px rgba(0,0,0,0.1)',
              fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
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
                  bottom: '22px',
                  left: 0,
                  height: '2px',
                  background: isDarkMode
                    ? 'linear-gradient(90deg, #ffffff, #999999)'
                    : 'linear-gradient(90deg, #333333, #666666)',
                  boxShadow: isDarkMode
                    ? '0 0 6px rgba(255, 255, 255, 0.2)'
                    : '0 0 6px rgba(0, 0, 0, 0.2)',
                  borderRadius: '4px',
                  width: `${activeButtonPos.width * 0.6}px`,
                  transform: `translateX(${activeButtonPos.left + (activeButtonPos.width * 0.2)}px)`,
                  transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: isDarkMode
                      ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)'
                      : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
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
                  ref={el => buttonRefs.current[index] = el}
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
                  <MenuItem 
                    onClick={toggleDarkMode}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      '&:hover': {
                        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                      },
                      overflow: 'hidden',
                      height: '36px',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        width: '28px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                          transform: isDarkMode 
                            ? 'translateY(0) rotate(90deg)' 
                            : 'translateY(-20px) rotate(-90deg)',
                          opacity: isDarkMode ? 1 : 0,
                        }}
                      >
                        <DarkModeIcon 
                          sx={{ 
                            color: isDarkMode ? '#ffffff' : '#666666',
                            fontSize: '20px',
                            filter: isDarkMode 
                              ? 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.6))' 
                              : 'none',
                          }} 
                        />
                      </Box>
                      <Box
                        sx={{
                          position: 'absolute',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                          transform: isDarkMode 
                            ? 'translateY(20px) rotate(90deg)'
                            : 'translateY(0) rotate(0deg)',
                          opacity: isDarkMode ? 0 : 1,
                        }}
                      >
                        <LightModeIcon 
                          sx={{ 
                            color: '#ffd700',
                            fontSize: '20px',
                            filter: 'drop-shadow(0 0 2px rgba(255, 215, 0, 0.6))',
                          }} 
                        />
                      </Box>
                    </Box>
                    <Typography
                      sx={{
                        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                        ml: 1,
                      }}
                    >
                      {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                    </Typography>
                  </MenuItem>
                  <MenuItem 
                    onClick={handleLogout}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      '&:hover': {
                        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                        '& .logout-icon': {
                          transform: 'translateX(3px)',
                        }
                      },
                    }}
                  >
                    <Box
                      className="logout-icon"
                      sx={{
                        width: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      }}
                    >
                      <LogoutIcon 
                        sx={{ 
                          fontSize: '20px',
                          color: '#ff4444',
                          filter: 'drop-shadow(0 0 1px rgba(255, 68, 68, 0.3))',
                        }} 
                      />
                    </Box>
                    <Typography
                      sx={{
                        fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                        ml: 1,
                      }}
                    >
                      Logout
                    </Typography>
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