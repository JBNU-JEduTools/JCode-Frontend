import React from 'react';
import { Box } from '@mui/material';
import Admin from '../../components/admin/Admin';

const AdminPage = () => {
  return (
    <Box sx={{ 
      backgroundColor: (theme) => 
        theme.palette.mode === 'dark' ? '#282A36' : '#FFFFFF'
    }}>
      <Admin />
    </Box>
  );
};

export default AdminPage; 