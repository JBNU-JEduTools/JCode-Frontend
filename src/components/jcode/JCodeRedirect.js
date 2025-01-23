import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Container, CircularProgress, Typography } from '@mui/material';

const JCodeRedirect = () => {
  const { user } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJCodeUrl = async () => {
      try {
        const response = await fetch(`/api/jcode/url/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const data = await response.json();
        
        if (response.ok) {
          window.location.href = data.url;
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('JCode 접속 중 오류가 발생했습니다.');
      }
    };

    fetchJCodeUrl();
  }, [user.id]);

  if (error) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography color="error">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, textAlign: 'center' }}>
      <CircularProgress />
      <Typography sx={{ mt: 2 }}>
        JCode로 이동 중입니다...
      </Typography>
    </Container>
  );
};

export default JCodeRedirect; 