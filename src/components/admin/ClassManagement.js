import React from 'react';
import { 
  Container, 
  Paper, 
  Typography 
} from '@mui/material';

const ClassManagement = () => {
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          수업 관리
        </Typography>
        <Typography>
          수업 관리 기능은 아직 구현되지 않았습니다.
        </Typography>
      </Paper>
    </Container>
  );
};

export default ClassManagement; 