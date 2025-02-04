import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography,
  Box,
  Divider
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import { AUTH_CONFIG } from '../../config/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');

  // 컴포넌트가 언마운트될 때 location state 초기화
  useEffect(() => {
    return () => {
      if (location.state?.message) {
        navigate(location.pathname, { replace: true, state: {} });
      }
    };
  }, [location, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      // 사용자 역할에 따른 리다이렉션
      const roles = user?.roles || [];
      if (roles.includes('admin')) {
        navigate('/admin');
      } else if (roles.includes('professor') || roles.includes('assistant')) {
        navigate('/watcher');
      } else {
        navigate('/jcode');
      }
    }
  }, [isAuthenticated, navigate, user]);

  const params = new URLSearchParams({
    client_id: AUTH_CONFIG.clientId,
    redirect_uri: AUTH_CONFIG.redirectUri,
    response_type: "code",
    scope: AUTH_CONFIG.scope
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 비밀번호 최소 요구사항 검증
    if (password.length < 8) {
      setError('비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }

    if (!email.endsWith('@jbnu.ac.kr')) {
      setError('전북대학교 이메일(@jbnu.ac.kr)만 사용 가능합니다.');
      return;
    }

    try {
      console.log('로그인 요청');
      const result = await login(email, password);
      console.log('로그인 결과:', result);
    
      if (result.success) {
        console.log('로그인 성공, 리다이렉트:', result.user.role);
        const role = result.user.role;
        console.log('리다이렉트 시도:', role);
        if (role === 'ADMIN') {
          navigate('/admin', { replace: true });
        } else if (role === 'PROFESSOR' || role === 'ASSISTANT') {
          navigate('/watcher', { replace: true });
        } else if (role === 'STUDENT') {
          navigate('/jcode', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            JCodeHub 로그인
          </Typography>
          <Typography variant="body2" color="text.secondary">
            전북대학교 통합계정으로 로그인하세요
          </Typography>
        </Box>
        
        {successMessage && (
          <Typography 
            color="success.main" 
            sx={{ 
              mb: 3,
              p: 2,
              bgcolor: 'success.light',
              borderRadius: 1,
              color: 'success.dark',
              fontWeight: 'medium'
            }}
          >
            {successMessage}
          </Typography>
        )}
        
        <Button
          variant="contained"
          fullWidth
          startIcon={<SchoolIcon />}
          href={`${AUTH_CONFIG.keycloakUrl}/auth?${params.toString()}`}
          sx={{ 
            mt: 2, 
            mb: 3,
            py: 1.5,
            backgroundColor: '#004C9C',
            '&:hover': {
              backgroundColor: '#003870'
            }
          }}
        >
          전북대학교 통합로그인
        </Button>
        
        <Divider sx={{ my: 3 }}>
          <Typography color="text.secondary" variant="body2">
            또는
          </Typography>
        </Divider>
        
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="이메일"
            type="email"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <TextField
            fullWidth
            label="비밀번호"
            type="password"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
          
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3 }}
          >
            이메일로 로그인
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login; 