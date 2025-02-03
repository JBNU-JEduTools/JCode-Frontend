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

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
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

  const handleSSOLogin = () => {
    // 전체 URL로 수정
    window.location.href = 'http://localhost:8080/api/auth/login/oidc/success';
  };

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
        <Typography variant="h5" component="h1" gutterBottom>
          로그인
        </Typography>
        
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
          onClick={handleSSOLogin}
          sx={{ 
            mt: 2, 
            mb: 3,
            py: 1.5,
            backgroundColor: '#004C9C', // 전북대 메인 컬러
            '&:hover': {
              backgroundColor: '#003870'
            }
          }}
        >
          전북대 통합 로그인으로 계속하기
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