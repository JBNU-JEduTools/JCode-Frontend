import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import { ThemeProvider } from './contexts/ThemeContext';
import { useTheme } from './contexts/ThemeContext';
import { getTheme } from './theme';
import PrivateRoute from './components/layout/PrivateRoute';
import { routes } from './routes';
import { Box } from '@mui/material';

const AppRoutes = () => {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return null;  // or loading spinner
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          isAuthenticated ? <Navigate to="/watcher" replace /> : <Navigate to="/login" replace />
        } 
      />
      
      {routes.map(({ path, element: Element, roles }) => (
        <Route
          key={path}
          path={path}
          element={
            roles.length > 0 ? (
              <PrivateRoute roles={roles}>
                <Element />
              </PrivateRoute>
            ) : (
              <Element />
            )
          }
        />
      ))}
    </Routes>
  );
};

const ThemedApp = () => {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <Box component="main" sx={{ flexGrow: 1, pt: 10 }}>
            <AppRoutes />
          </Box>
        </Box>
      </Router>
    </MuiThemeProvider>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
