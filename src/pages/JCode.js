import React, { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const JCode = () => {
  const { user } = useAuth();

  useEffect(() => {
    // TODO: API에서 Code-server URL 가져오기
    const redirectToCodeServer = async () => {
      try {
        // const response = await api.getCodeServerUrl(user.id);
        // window.location.href = response.data.url;
      } catch (error) {
        console.error('Failed to get code server URL:', error);
      }
    };

    redirectToCodeServer();
  }, [user]);

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh'
    }}>
      <CircularProgress />
      <Typography variant="h6" sx={{ mt: 2 }}>
        JCode로 이동중입니다...
      </Typography>
    </Box>
  );
};

export default JCode; 