import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import JCodeRedirect from './components/jcode/JCodeRedirect';
import PrivateRoute from './components/layout/PrivateRoute';
import Watcher from './components/watcher/Watcher';
import Admin from './components/admin/Admin';
import theme from './theme';
import { Box } from '@mui/material';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Navbar />
          <Box sx={{ pt: 10 }}>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/jcode" 
                element={
                  <PrivateRoute>
                    <JCodeRedirect />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/watcher/*" 
                element={
                  <PrivateRoute roles={['PROFESSOR', 'ASSISTANCE', 'ADMIN']}>
                    <Watcher />
                  </PrivateRoute>
                } 
              />
              <Route
                path="/admin/*"
                element={
                  <PrivateRoute roles={['ADMIN']}>
                    <Admin />
                  </PrivateRoute>
                }
              />
            </Routes>
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
