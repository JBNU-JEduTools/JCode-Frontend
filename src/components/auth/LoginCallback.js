import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { getDefaultRoute } from '../../routes';
import { jwtDecode } from 'jwt-decode';

function LoginCallback() {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('1. 로그인 콜백 시작');
        const token = await auth.getAccessToken();  // auth에서 직접 호출
        console.log('2. 받은 토큰:', token);
        
        const storedToken = sessionStorage.getItem('jwt');
        console.log('3. 저장된 토큰:', storedToken);
        
        const decodedToken = jwtDecode(token);
        console.log('4. 디코딩된 토큰:', decodedToken);
        console.log('5. 사용자 역할:', decodedToken.role);
        
        if (!decodedToken.role) {
          throw new Error('토큰에 역할 정보가 없습니다');
        }

        await checkAuth();  // 인증 상태 업데이트
        const defaultPath = getDefaultRoute(decodedToken.role);
        console.log('6. 리다이렉트 경로:', defaultPath);
        
        navigate(defaultPath, { replace: true });
      } catch (error) {
        console.error('Login callback failed:', error);
        navigate('/login', { replace: true });
      }
    };

    handleCallback();
  }, [navigate, checkAuth]);

  return <div>로그인 처리중...</div>;
}

export default LoginCallback; 