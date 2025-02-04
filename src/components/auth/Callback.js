import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { fetchToken, sendTokenToBackend } from '../../api/auth';
import { CircularProgress, Box, Typography } from '@mui/material';
import { jwtDecode } from 'jwt-decode';

const Callback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      
      if (!code) {
        console.error('인증 코드가 없습니다.');
        navigate('/login');
        return;
      }

      try {
        // Keycloak에서 토큰 받기
        const data = await fetchToken(code);
        
        if (data.access_token) {
          // 백엔드로 토큰 전송
          try {
            await sendTokenToBackend(data.access_token);
            console.log('토큰이 백엔드로 전송되었습니다.');
          } catch (error) {
            console.error('백엔드 토큰 전송 실패:', error);
          }

          // 토큰에서 사용자 정보 추출
          const decodedToken = jwtDecode(data.access_token);
          const roles = decodedToken.realm_access?.roles || [];
          
          // 사용자 정보 설정
          const userData = {
            username: decodedToken.preferred_username || decodedToken.name,
            email: decodedToken.email,
            roles: roles,
            sub: decodedToken.sub,
            role: 'STUDENT'
          };
          setUser(userData);
          
          // 역할에 따른 리다이렉션
          if (roles.includes('admin')) {
            navigate('/admin');
          } else if (roles.includes('professor') || roles.includes('assistant')) {
            navigate('/watcher');
          } else {
            navigate('/jcode');
          }
        } else {
          throw new Error('No access token received');
        }
      } catch (error) {
        console.error('Token fetch error:', error);
        navigate('/login', { 
          state: { 
            error: '로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.' 
          } 
        });
      }
    };

    handleCallback();
  }, [location, navigate, setUser]);

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