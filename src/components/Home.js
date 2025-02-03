import React from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Box,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (user) {
    // 로그인된 사용자는 역할에 따른 페이지로 리다이렉트
    switch (user.role) {
      case 'admin':
        navigate('/admin');
        break;
      case 'professor':
      case 'assistant':
        navigate('/watcher');
        break;
      case 'student':
        navigate('/jcode');
        break;
      default:
        break;
    }
    return null;
  }

  return (
    <Container maxWidth="md">
      <Box 
        sx={{ 
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: 4
        }}
      >
        <Typography 
          variant="h1" 
          component="h1" 
          sx={{ 
            fontSize: { xs: '3rem', md: '4rem' },
            fontWeight: 'bold',
            color: 'primary.main'
          }}
        >
          JHub
        </Typography>

        <Typography 
          variant="h5" 
          sx={{ 
            mb: 4,
            color: 'text.secondary'
          }}
        >
          전북대학교 프로그래밍 학습 플랫폼
        </Typography>

        <Paper 
          elevation={3} 
          sx={{ 
            p: 4,
            width: '100%',
            maxWidth: 400,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/login')}
            sx={{ py: 1.5 }}
          >
            로그인
          </Button>

          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/register')}
            sx={{ py: 1.5 }}
          >
            회원가입
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default Home; 