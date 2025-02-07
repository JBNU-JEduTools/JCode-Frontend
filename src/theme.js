import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1a1a1a',
    },
    secondary: {
      main: '#6b38fb',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
    h1: {
      fontFamily: "'Comfortaa', sans-serif",
      fontWeight: 700,
    },
    h2: {
      fontFamily: "'Comfortaa', sans-serif",
      fontWeight: 700,
    },
    h3: {
      fontFamily: "'Comfortaa', sans-serif",
      fontWeight: 700,
    },
    h4: {
      fontFamily: "'Comfortaa', sans-serif",
      fontWeight: 700,
    },
    h5: {
      fontFamily: "'Comfortaa', sans-serif",
      fontWeight: 700,
    },
    h6: {
      fontFamily: "'Comfortaa', sans-serif",
      fontWeight: 700,
    },
    button: {
      fontFamily: "'Comfortaa', 'Noto Sans KR', sans-serif",
      fontWeight: 600,
    },
    body1: {
      fontFamily: "'Noto Sans KR', sans-serif",
    },
    body2: {
      fontFamily: "'Noto Sans KR', sans-serif",
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          boxShadow: 'none',
          borderBottom: '1px solid #eaeaea',
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
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
        },
      },
    },
  },
});

export default theme; 