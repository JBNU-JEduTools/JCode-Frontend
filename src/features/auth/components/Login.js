import React from 'react';
import { Container, Button, Typography, Box, Fade } from '@mui/material';
import { useAuth } from '../../../contexts/AuthContext';
import SchoolIcon from '@mui/icons-material/School';
import CodeIcon from '@mui/icons-material/Code';

const Login = () => {
  const { login } = useAuth();

  return (
    <Fade in={true} timeout={300}>
      <Container
        maxWidth="md"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          minHeight: '100vh',
          position: 'relative',
          overflow: 'visible',
          pt: 18,
          pb: 4
        }}
      >
        <Box
          className="liquidGlass-wrapper"
          sx={{
            p: 5,
            width: '100%',
            maxWidth: 640,
            borderRadius: '16px',
            position: 'relative',
            zIndex: 1,
            fontWeight: 600,
            background: 'transparent',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 12px 28px rgba(0,0,0,0.55)'
                : '0 12px 28px rgba(0,0,0,0.12)'
          }}
        >
          {/* 컨텐츠 */}
          <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box 
              sx={{ 
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
                position: 'relative'
              }}
            >
              <CodeIcon 
                sx={{ 
                  fontSize: '2.2rem',
                  color: (theme) => 
                    theme.palette.mode === 'dark' 
                      ? '#BD93F9'
                      : '#6272A4',
                  mr: 1
                }} 
              />
              <Typography 
                variant="h3" 
                component="h1" 
                sx={{
                  fontWeight: 700,
                  color: (theme) => theme.palette.text.primary,
                  fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                  letterSpacing: '-0.02em',
                  fontSize: '2.2rem'
                }}
              >
                JCode
              </Typography>
            </Box>
            <Typography 
              variant="body2" 
              sx={{
                fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                fontSize: '0.85rem',
                color: (theme) => 
                  theme.palette.mode === 'dark' 
                    ? '#6272A4'
                    : 'text.disabled'
              }}
            >
              Talk is cheap. Show me the code.
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            fullWidth
            startIcon={
              <SchoolIcon sx={{ 
                fontSize: '1.3rem',
                color: '#FFFFFF'
              }} />
            }
            onClick={login}
            sx={{ 
              py: 1,
              color: '#FFFFFF',
              fontSize: '1rem',
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: '10px',
              fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? '#BD93F9'
                  : 'linear-gradient(135deg, #6272A4 0%, #44475A 100%)',
              border: '1px solid rgba(255,255,255,0.35)',
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 10px 24px rgba(255, 121, 198, 0.35)'
                  : '0 10px 24px rgba(98, 114, 164, 0.35)',
              '&:hover': {
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '#A084E8'
                    : 'linear-gradient(135deg, #4E5C8E 0%, #3A3F5A 100%)',
                boxShadow: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '0 12px 28px rgba(245, 107, 182, 0.42)'
                    : '0 12px 28px rgba(78, 92, 142, 0.42)'
              }
            }}
          >
            JEduTools Login
          </Button>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography 
              variant="caption" 
              sx={{
                color: (theme) => 
                  theme.palette.mode === 'dark' 
                    ? '#6272A4'
                    : 'text.disabled',
                fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
              }}
            >
              © {new Date().getFullYear()} JEduTools.
            </Typography>
          </Box>
          </Box>
        </Box>
      </Container>
    </Fade>
  );
};

export default Login; 