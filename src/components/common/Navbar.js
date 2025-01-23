import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          JCode Platform
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {user && (
            <>
              <Button color="inherit" component={RouterLink} to="/jcode">
                JCode
              </Button>
              {['professor', 'assistant', 'admin'].includes(user.role) && (
                <Button color="inherit" component={RouterLink} to="/watcher">
                  Watcher
                </Button>
              )}
              {user.role === 'admin' && (
                <Button color="inherit" component={RouterLink} to="/admin">
                  Admin
                </Button>
              )}
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 