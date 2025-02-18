import React from 'react';
import { Container, Paper, Button, Typography, Box } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import SchoolIcon from '@mui/icons-material/School';

const Login = () => {
  const { login } = useAuth();

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            JCode 로그인
          </Typography>
          <Typography variant="body2" color="text.secondary">
            전북대학교 통합계정으로 로그인하세요
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          fullWidth
          startIcon={<SchoolIcon />}
          onClick={login}
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
          JEduTools 통합 로그인
        </Button>
      </Paper>
    </Container>
  );
};

export default Login; 