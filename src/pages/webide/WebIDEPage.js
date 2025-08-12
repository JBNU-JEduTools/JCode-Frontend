import React from 'react';
import { Box } from '@mui/material';
import { WebIDECourses } from '../../features/webide';

const WebIDEPage = () => {
  return (
    <Box sx={{ 
      backgroundColor: 'transparent'
    }}>
      <WebIDECourses />
    </Box>
  );
};

export default WebIDEPage; 