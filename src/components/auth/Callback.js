import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CircularProgress, Box, Typography } from '@mui/material';
import { getDefaultRoute } from '../../routes';
import api from '../../api/axios';

const Callback = () => {
  const navigate = useNavigate();
  const { keycloak, user } = useAuth();

  useEffect(() => {
    const processCallback = async () => {
      try {
        // keycloak이 자동으로 callback을 처리
        if (user && keycloak.token) {
          // 백엔드로 토큰 전송
          try {
            await api.get('/api/auth/login/oidc/success', {
              headers: {
                'Authorization': `Bearer ${keycloak.token}`
              }
            });
            console.log('토큰이 백엔드로 전송되었습니다.');
          } catch (error) {
            console.error('백엔드 토큰 전송 실패:', error);
            throw error;  // 에러를 상위로 전파
          }

          // 로그인 성공 후 리다이렉트
          navigate(getDefaultRoute(user.role));
        }
      } catch (error) {
        console.error('Callback processing failed:', error);
        navigate('/login', { 
          state: { 
            error: '로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.' 
          } 
        });
      }
    };

    processCallback();
  }, [navigate, user, keycloak]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
    >
      <CircularProgress />
      <Typography variant="h6" sx={{ mt: 2 }}>
        로그인 처리 중...
      </Typography>
    </Box>
  );
};

export default Callback; 