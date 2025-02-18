import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography,
  Box 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    student_num: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!/^\d{9}$/.test(formData.student_num)) {
      setError('학번은 9자리 숫자여야 합니다.');
      return;
    }

    if (!formData.email.endsWith('@jbnu.ac.kr')) {
      setError('전북대학교 이메일(@jbnu.ac.kr)만 사용 가능합니다.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const requestData = {
        email: formData.email,
        name: formData.name,
        student_num: parseInt(formData.student_num),
        role: 'STUDENT',
        password: formData.password
      };

      // 회원가입 API 호출
      const response = await api.post('/auth/signup', requestData);

      // 성공 시 로그인 페이지로 이동
      if (response.status === 200 || response.status === 201) {
        navigate('/login', { 
          state: { 
            message: '회원가입이 완료되었습니다! 이메일과 비밀번호로 로그인해주세요.',
            type: 'success'
          }
        }, {
          replace: true // history stack에서 현재 페이지를 대체
        });
        return; // 함수 종료
      }
    } catch (err) {
      // 에러 처리
      if (err.response) {
        // 서버에서 응답한 에러
        switch (err.response.status) {
          case 400:
            setError(err.response.data.error || '입력 정보를 확인해주세요.');
            break;
          case 409:
            setError('이미 등록된 이메일입니다.');
            break;
          default:
            setError('회원가입 중 오류가 발생했습니다.');
        }
      } else if (err.request) {
        // 서버에 요청이 도달하지 못한 경우
        setError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
      } else {
        // 요청 설정 중 에러 발생
        setError('회원가입을 처리할 수 없습니다.');
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          회원가입
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="이메일"
            name="email"
            type="email"
            margin="normal"
            value={formData.email}
            onChange={handleChange}
            required
            helperText="@jbnu.ac.kr 이메일만 사용 가능합니다"
          />
          
          <TextField
            fullWidth
            label="이름"
            name="name"
            margin="normal"
            value={formData.name}
            onChange={handleChange}
            required
          />
          
          <TextField
            fullWidth
            label="학번 (9자리)"
            name="student_num"
            margin="normal"
            value={formData.student_num}
            onChange={handleChange}
            required
            inputProps={{ 
              pattern: "\\d{9}",
              maxLength: 9
            }}
            helperText="9자리 숫자로 입력해주세요"
          />
          
          <TextField
            fullWidth
            label="비밀번호"
            name="password"
            type="password"
            margin="normal"
            value={formData.password}
            onChange={handleChange}
            required
          />
          
          <TextField
            fullWidth
            label="비밀번호 확인"
            name="confirmPassword"
            type="password"
            margin="normal"
            value={formData.confirmPassword}
            onChange={handleChange}
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
            회원가입
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register; 