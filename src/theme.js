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
    fontFamily: "'Comfortaa', 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif",
    h1: {
      fontFamily: 'Comfortaa',
      fontWeight: 700,
    },
    h2: {
      fontFamily: 'Comfortaa',
      fontWeight: 700,
    },
    h3: {
      fontFamily: 'Comfortaa',
      fontWeight: 700,
    },
    h4: {
      fontFamily: 'Comfortaa',
      fontWeight: 700,
    },
    h5: {
      fontFamily: 'Comfortaa',
      fontWeight: 700,
    },
    h6: {
      fontFamily: 'Comfortaa',
      fontWeight: 700,
    },
    button: {
      fontFamily: 'Comfortaa',
      fontWeight: 600,
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
          fontFamily: "'Comfortaa', 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif",
        },
      },
    },
  },
});

export default theme; 