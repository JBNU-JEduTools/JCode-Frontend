import React from 'react';
import { 
  Container, 
  Paper, 
  Typography,
  Box,
  Fade
} from '@mui/material';

const ClassManagement = () => {
  return (
    <Fade in={true} timeout={300}>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box 
          sx={{ 
            transition: 'all 0.3s ease',
            animation: 'fadeIn 0.3s ease',
            '@keyframes fadeIn': {
              '0%': {
                opacity: 0,
                transform: 'translateY(10px)'
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)'
              }
            }
          }}
        >
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
              수업 관리
            </Typography>
            <Typography sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
              수업 관리 기능은 아직 구현되지 않았습니다.
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Fade>
  );
};

export default ClassManagement; 