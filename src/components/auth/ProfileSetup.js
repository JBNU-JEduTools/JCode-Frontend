import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getDefaultRoute } from '../../routes';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../api/axios';
import { jwtDecode } from 'jwt-decode';

const toastConfig = {
  autoClose: 800,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: false,
  draggable: false,
  progress: undefined,
  transition: toast.Slide
};

const ProfileSetup = ({ isEditMode, initialData }) => {
  const { user, checkAuth } = useAuth();
  const [formData, setFormData] = useState({
    studentNum: '',
    name: ''
  });
  const [errors, setErrors] = useState({
    studentNum: '',
    name: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        studentNum: String(initialData.studentNum || ''),
        name: initialData.name || ''
      });
    }
  }, [isEditMode, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const studentNumStr = String(formData.studentNum);
    const nameStr = String(formData.name);
    
    const newErrors = {};
    
    if (!studentNumStr.trim()) {
      newErrors.studentNum = '학번을 입력해주세요';
    }
    
    if (!nameStr.trim()) {
      newErrors.name = '이름을 입력해주세요';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('모든 필드를 입력해주세요.', toastConfig);
      return;
    }

    try {
      await auth.updateUserProfile({
        studentNum: parseInt(studentNumStr.trim(), 10),
        name: nameStr.trim()
      });

      // 토큰에서 role 가져오기
      const token = sessionStorage.getItem('jwt');
      const decodedToken = jwtDecode(token);
      
      // 사용자 정보 갱신
      await checkAuth();
      
      const successMessage = isEditMode ? '프로필이 수정되었습니다.' : '프로필이 설정되었습니다.';
      
      if (isEditMode) {
        toast.success(successMessage, {
          ...toastConfig,
          onClose: () => window.location.reload()
        });
      } else {
        const defaultPath = getDefaultRoute(decodedToken.role);
        toast.success(successMessage, {
          ...toastConfig,
          onClose: () => window.location.href = defaultPath
        });
      }
    } catch (error) {
      console.error('프로필 설정 실패:', error);
      toast.error(
        error.response?.data?.message || 
        '프로필 설정에 실패했습니다. 다시 시도해주세요.',
        toastConfig
      );
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: isEditMode ? 'auto' : '80vh' 
    }}>
      <Paper 
        elevation={isEditMode ? 0 : 3} 
        sx={{ 
          p: 4, 
          width: '100%', 
          maxWidth: 400, 
          textAlign: 'center',
          backgroundColor: isEditMode ? 'transparent' : 'background.paper'
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom>
          {isEditMode ? '내 정보 수정' : '프로필 설정'}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {isEditMode 
            ? '수정할 정보를 입력해주세요.'
            : '서비스 이용을 위해 학번과 이름을 입력해주세요.'}
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="학번"
            name="studentNum"
            value={formData.studentNum}
            onChange={handleChange}
            margin="normal"
            required
            error={!!errors.studentNum}
            helperText={isEditMode ? "학번을 수정하려면 관리자에게 문의하세요." : errors.studentNum}
            disabled={isEditMode}
            InputProps={{
              readOnly: isEditMode,
            }}
          />
          
          <TextField
            fullWidth
            label="이름"
            name="name"
            variant="outlined"
            value={formData.name}
            onChange={handleChange}
            sx={{ mb: 3 }}
            placeholder="예: 홍길동"
            required
            error={!!errors.name}
            helperText={errors.name}
          />
          
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            sx={{ mb: 2 }}
          >
            {isEditMode ? '수정 완료' : '설정 완료'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default ProfileSetup; 