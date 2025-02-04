import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Callback from './components/auth/Callback';
import Home from './components/Home';
import JCode from './pages/JCode';
import Watcher from './pages/Watcher';
import Admin from './pages/Admin';
import theme from './theme';
import { Box } from '@mui/material';
import PrivateRoute from './components/common/PrivateRoute';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Navbar />
          <Box sx={{ pt: 10 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/callback" element={<Callback />} />
              <Route 
                path="/jcode/*" 
                element={
                  <PrivateRoute roles={['STUDENT', 'PROFESSOR', 'ASSISTANT', 'ADMIN']}>
                    <JCode />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/watcher/*" 
                element={
                  <PrivateRoute roles={['PROFESSOR', 'ASSISTANT', 'ADMIN']}>
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
