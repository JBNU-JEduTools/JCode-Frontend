import React, { useState, useRef, useEffect, useMemo } from 'react';
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
import { useAvatar } from '../../contexts/AvatarContext';
import { routes, getDefaultRoute } from '../../routes';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useTheme } from '../../contexts/ThemeContext';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import { auth } from '../../api/axios';
import { getAvatarUrl } from '../../utils/avatar';

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, login, logout, loading } = useAuth();
  const { currentStyle } = useAvatar();
  const navigate = useNavigate();
  const location = useLocation();
  const buttonRefs = useRef([]);
  const [activeButtonPos, setActiveButtonPos] = useState({ left: 0, width: 0 });
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isProfileSet, setIsProfileSet] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const checkProfile = async () => {
      if (!user) {
        setProfileLoading(false);
        return;
      }
      
      try {
        const response = await auth.getUserProfile();
        console.log('response.data: ', response.data);
        const { studentNum, name } = response.data;
        setIsProfileSet(Boolean(studentNum && name));
        setProfileData({ studentNum, name });
      } catch (error) {
        console.error('프로필 확인 실패:', error);
        setIsProfileSet(false);
      } finally {
        setProfileLoading(false);
      }
    };

    checkProfile();
  }, [user]);

  const navItems = useMemo(() => {
    if (!user || !isProfileSet) return [];
    
    return routes
      .filter(route => 
        route.showInNav && 
        (!route.roles.length || route.roles.includes(user.role))
      )
      .sort((a, b) => a.order - b.order);
  }, [user, isProfileSet]);

  const isCurrentPath = (path) => {
    if (path.includes('/*')) {
      const basePath = path.replace('/*', '');
      return location.pathname.startsWith(basePath);
    }
    return location.pathname === path;
  };

  useEffect(() => {
    const activeIndex = navItems.findIndex(route => 
      isCurrentPath(route.path)
    );
    
    if (activeIndex >= 0 && buttonRefs.current[activeIndex]) {
      const button = buttonRefs.current[activeIndex];
      const rect = button.getBoundingClientRect();
      const parentRect = button.parentElement.getBoundingClientRect();
      
      setActiveButtonPos({
        left: rect.left - parentRect.left,
        width: rect.width
      });
    } else {
      setActiveButtonPos({ left: 0, width: 0 });
    }
  }, [location.pathname, navItems]);

  if (loading || profileLoading) {
    return null;
  }

  const handleLogoClick = () => {
    const defaultRoute = getDefaultRoute(user?.role);
    navigate(defaultRoute);
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

  const handleProfileSettings = () => {
    handleClose();
    navigate('/profile/settings');
  };

  const menuButtonStyle = {
    my: 2, 
    fontWeight: 'bold',
    fontSize: '1rem',
    mx: 1,
    color: 'text.primary',
    transition: 'all 0.3s ease',
    position: 'relative',
    '&:hover': {
      backgroundColor: (theme) => theme.palette.action.hover,
      color: (theme) => theme.palette.primary.main
    }
  };

  return (
    <AppBar position="fixed">
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ height: 80 }}>
          <Box 
            component="div" 
            onClick={handleLogoClick}
            sx={{ 
              cursor: 'pointer',
              display: 'flex', 
              alignItems: 'center' 
            }}
          >
            <Typography
              variant="h5"
              noWrap
              component="div"
              sx={{ 
                mr: 2, 
                fontWeight: 700,
                fontSize: '1.8rem',
                letterSpacing: '-.05rem',
                background: (theme) => 
                  theme.palette.mode === 'dark'
                    ? 'linear-gradient(45deg, #FF79C6 30%, #BD93F9 90%)'
                    : `linear-gradient(45deg, ${theme.palette.text.primary} 30%, ${theme.palette.text.secondary} 90%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                WebkitTextStroke: (theme) => 
                  theme.palette.mode === 'dark'
                    ? 'none'
                    : `1px ${theme.palette.text.disabled}`,
                textShadow: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '2px 2px 4px rgba(189, 147, 249, 0.3)'
                    : `2px 2px 4px ${theme.palette.text.disabled}`,
                fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
              }}
            >
              JCode
            </Typography>
          </Box>

          {user && (
            <Box 
              sx={{ 
                flexGrow: 1, 
                display: { xs: 'none', md: 'flex' },
                position: 'relative',
                alignItems: 'center'
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  bottom: '22px',
                  left: 0,
                  height: '2px',
                  background: isDarkMode
                    ? 'linear-gradient(90deg, #FF79C6, #BD93F9)'
                    : 'linear-gradient(90deg, #333333, #666666)',
                  boxShadow: isDarkMode
                    ? '0 0 6px rgba(189, 147, 249, 0.3)'
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
                      ? 'linear-gradient(90deg, transparent, rgba(189, 147, 249, 0.2), transparent)'
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

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            {user ? (
              <>
                <IconButton
                  onClick={handleProfileClick}
                  sx={{ p: 0.5 }}
                >
                  <Avatar 
                    src={getAvatarUrl(user.email)}
                    sx={{ 
                      width: 32, 
                      height: 32, 
                      background: 'transparent',
                      border: (theme) => `2px solid ${theme.palette.divider}`,
                      fontSize: '0.875rem',
                      fontWeight: 'bold',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        border: (theme) => `2px solid ${theme.palette.primary.main}`
                      }
                    }}
                  >
                    {user.email[0].toUpperCase()}
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
                  <Box sx={{ 
                    px: 2.5, 
                    py: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}>
                    <Avatar 
                      src={getAvatarUrl(user.email)}
                      sx={{ 
                        width: 40, 
                        height: 40,
                        background: 'transparent',
                        border: (theme) => 
                          theme.palette.mode === 'dark' 
                            ? '2px solid #6272A4' 
                            : '2px solid rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      {user.email[0].toUpperCase()}
                    </Avatar>
                    <Box>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 0.8,
                        mb: 0.3
                      }}>
                        <Typography 
                          sx={{ 
                            fontWeight: 600,
                            color: 'text.primary',
                            fontSize: '0.95rem',
                            letterSpacing: '-0.01em'
                          }}
                        >
                          {profileData?.name || user.email.split('@')[0]}
                        </Typography>
                        <Typography 
                          component="span"
                          sx={{ 
                            px: 0.8,
                            py: 0.2,
                            borderRadius: '12px',
                            backgroundColor: (theme) => 
                              theme.palette.mode === 'dark' 
                                ? 'rgba(189, 147, 249, 0.1)' 
                                : 'rgba(33, 150, 243, 0.08)',
                            color: (theme) =>
                              theme.palette.mode === 'dark'
                                ? '#FF79C6'
                                : '#1976D2',
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.02em'
                          }}
                        >
                          {user.role === 'STUDENT' ? '학생' :
                           user.role === 'PROFESSOR' ? '교수' :
                           user.role === 'ASSISTANT' ? '조교' :
                           user.role === 'ADMIN' ? '관리자' : ''}
                        </Typography>
                      </Box>
                      <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.2
                      }}>
                        <Typography 
                          sx={{ 
                            color: 'text.secondary',
                            fontSize: '0.75rem',
                            letterSpacing: '-0.01em'
                          }}
                        >
                          {user.email}
                        </Typography>
                        <Typography 
                          sx={{ 
                            color: 'text.secondary',
                            fontSize: '0.75rem',
                            opacity: 0.8
                          }}
                        >
                          {profileData?.studentNum}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Divider />
                  <MenuItem 
                    onClick={handleProfileSettings}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      '&:hover': {
                        backgroundColor: (theme) => theme.palette.action.hover
                      }
                    }}
                  >
                    <Box
                      className="profile-icon"
                      sx={{
                        width: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      }}
                    >
                      <PersonIcon 
                        sx={{ 
                          fontSize: '20px',
                          color: (theme) => theme.palette.primary.main,
                          filter: (theme) => theme.palette.mode === 'dark'
                            ? 'drop-shadow(0 0 1px rgba(255, 121, 198, 0.3))'
                            : 'drop-shadow(0 0 1px rgba(25, 118, 210, 0.3))',
                        }} 
                      />
                    </Box>
                    <Typography
                      sx={{
                        fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                        ml: 1,
                      }}
                    >
                      프로필 설정
                    </Typography>
                  </MenuItem>
                  <MenuItem 
                    onClick={toggleDarkMode}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      '&:hover': {
                        backgroundColor: (theme) => theme.palette.action.hover
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
                            color: (theme) => theme.palette.primary.main,
                            fontSize: '20px',
                            filter: (theme) => theme.palette.mode === 'dark'
                              ? 'drop-shadow(0 0 2px rgba(189, 147, 249, 0.6))'
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
                            color: (theme) => theme.palette.warning.main,
                            fontSize: '20px',
                            filter: (theme) => `drop-shadow(0 0 2px ${theme.palette.warning.light})`,
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
                        backgroundColor: (theme) => theme.palette.action.hover
                      }
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
                          color: (theme) => theme.palette.error.main
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
                Login
              </Button>
            )}
          </Box>

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