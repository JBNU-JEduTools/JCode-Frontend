import React from 'react';
import { Box } from '@mui/material';
import WebIDECourses from '../../components/webide/WebIDECourses';

const WebIDEPage = () => {
  return (
    <Box sx={{ 
      backgroundColor: (theme) => 
        theme.palette.mode === 'dark' ? '#282A36' : '#FFFFFF'
    }}>
      <WebIDECourses />
    </Box>
  );
};

export default WebIDEPage; 