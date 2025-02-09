import { createTheme } from '@mui/material/styles';

export const getTheme = (isDarkMode) => createTheme({
  palette: {
    mode: isDarkMode ? 'dark' : 'light',
    primary: {
      main: isDarkMode ? '#ffffff' : '#1a1a1a',
    },
    secondary: {
      main: '#6b38fb',
    },
    text: {
      primary: isDarkMode ? '#ffffff' : '#1a1a1a',
      secondary: isDarkMode ? '#b3b3b3' : '#666666',
    },
    background: {
      default: isDarkMode ? '#121212' : '#f5f5f5',
      paper: isDarkMode ? '#1e1e1e' : '#ffffff',
    },
  },
  typography: {
    fontFamily: [
      'JetBrains Mono',
      'Noto Sans KR',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
      fontWeight: 700,
    },
    h2: {
      fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
      fontWeight: 700,
    },
    h3: {
      fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
      fontWeight: 700,
    },
    h4: {
      fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
      fontWeight: 700,
    },
    h5: {
      fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
      fontWeight: 700,
    },
    h6: {
      fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
      fontWeight: 700,
    },
    button: {
      fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
      fontWeight: 600,
    },
    body1: {
      fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
      fontSize: '1rem',
    },
    body2: {
      fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: isDarkMode ? '#121212' : '#ffffff',
          boxShadow: 'none',
          borderBottom: `1px solid ${isDarkMode ? '#333333' : '#eaeaea'}`,
          '& .MuiTypography-root': {
            color: isDarkMode ? '#ffffff' : '#1a1a1a',
          },
          '& .MuiButton-root': {
            color: isDarkMode ? '#ffffff' : '#1a1a1a',
          },
          '& .logo': {
            color: isDarkMode ? '#ffffff' : '#1a1a1a',
          },
          '& .menu-indicator': {
            backgroundColor: isDarkMode ? '#ffffff' : '#1a1a1a',
            display: 'none',
          },
          '& .active .menu-indicator': {
            display: 'block',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontSize: '1rem',
          padding: '8px 16px',
        },
        contained: {
          backgroundColor: isDarkMode ? '#424242' : '#1a1a1a',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: isDarkMode ? '#616161' : '#333333',
          },
        },
        text: {
          color: isDarkMode ? '#ffffff' : '#1a1a1a',
          '&:hover': {
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: "'JetBrains Mono', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
  },
});

export default getTheme; 