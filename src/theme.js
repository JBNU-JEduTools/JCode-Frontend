import { createTheme } from '@mui/material/styles';

// Dracula Theme Colors
const colors = {
  background: '#282A36',
  currentLine: '#44475A',
  foreground: '#F8F8F2',
  comment: '#6272A4',
  purple: '#BD93F9',
  purpleHover: '#A77BF3',
  pink: '#FF79C6',
  red: '#FF5555',
  orange: '#FFB86C',
  yellow: '#F1FA8C',
  green: '#50FA7B',
  cyan: '#8BE9FD',
  selection: 'rgba(189, 147, 249, 0.3)',
  hover: 'rgba(189, 147, 249, 0.08)',
  selected: 'rgba(189, 147, 249, 0.16)',
  selectedHover: 'rgba(189, 147, 249, 0.24)',
};

// Light Theme Colors
const lightColors = {
  background: '#FFFFFF',
  currentLine: '#FFFFFF',
  foreground: '#282A36',
  comment: '#44475A',
  purple: '#6272A4',
  purpleHover: '#4E5C8E',
  hover: 'rgba(98, 114, 164, 0.08)',
  selected: 'rgba(98, 114, 164, 0.16)',
  selectedHover: 'rgba(98, 114, 164, 0.24)',
};

export const getTheme = (isDarkMode) => {
  const themeColors = isDarkMode ? colors : lightColors;

  return createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: themeColors.purple,
      },
      secondary: {
        main: colors.pink,
      },
      text: {
        primary: themeColors.foreground,
        secondary: themeColors.comment,
        disabled: isDarkMode ? 'rgba(248, 248, 242, 0.3)' : 'rgba(40, 42, 54, 0.3)',
      },
      background: {
        default: themeColors.background,
        paper: isDarkMode ? colors.currentLine : '#FFFFFF',
      },
      error: {
        main: colors.red
      },
      warning: {
        main: colors.orange
      },
      info: {
        main: colors.cyan
      },
      success: {
        main: colors.green
      },
      action: {
        hover: themeColors.hover,
        selected: themeColors.selected,
        selectedHover: themeColors.selectedHover,
        disabled: isDarkMode ? 'rgba(248, 248, 242, 0.3)' : 'rgba(40, 42, 54, 0.3)',
        disabledBackground: isDarkMode ? 'rgba(248, 248, 242, 0.12)' : 'rgba(40, 42, 54, 0.12)',
        focus: themeColors.selection,
      }
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
      MuiCssBaseline: {
        styleOverrides: {
          'html': {
            overflow: 'hidden',
            height: '100%'
          },
          'body': {
            fontFamily: "'JetBrains Mono', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
            backgroundColor: isDarkMode ? colors.background : '#FFFFFF',
            margin: 0,
            height: '100%',
            overflow: 'auto',
            '&::-webkit-scrollbar': {
              width: '10px',
              height: '10px',
              background: 'transparent'
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent'
            },
            '&::-webkit-scrollbar-thumb': {
              background: themeColors.comment,
              borderRadius: '5px',
              border: '2px solid transparent',
              backgroundClip: 'content-box',
              '&:hover': {
                background: themeColors.purple,
                backgroundClip: 'content-box'
              }
            },
            '::selection': {
              backgroundColor: themeColors.selection,
              color: themeColors.foreground
            }
          },
          '#root': {
            height: '100%',
            overflow: 'auto'
          },
          '.scrollable-content': {
            overflow: 'auto',
            '&::-webkit-scrollbar': {
              width: '10px',
              height: '10px',
              background: 'transparent'
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent'
            },
            '&::-webkit-scrollbar-thumb': {
              background: themeColors.comment,
              borderRadius: '5px',
              border: '2px solid transparent',
              backgroundClip: 'content-box',
              '&:hover': {
                background: themeColors.purple,
                backgroundClip: 'content-box'
              }
            }
          }
        }
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDarkMode ? themeColors.background : '#FFFFFF',
            boxShadow: 'none',
            borderBottom: isDarkMode ? 'none' : '1px solid #E0E0E0',
            '& .MuiTypography-root': {
              color: themeColors.foreground,
            },
            '& .MuiButton-root': {
              color: themeColors.foreground,
            },
            '& .logo': {
              color: themeColors.purple,
            },
            '& .menu-indicator': {
              backgroundColor: themeColors.purple,
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
            backgroundColor: (theme) => 
              theme.palette.mode === 'dark' 
                ? '#FF79C6'
                : theme.palette.primary.main,
            color: (theme) => 
              theme.palette.mode === 'dark'
                ? '#282A36'
                : theme.palette.primary.contrastText,
            '&:hover': {
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark'
                  ? '#FF79C6'
                  : theme.palette.primary.dark,
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 0 10px rgba(255, 121, 198, 0.5)'
                  : 'none',
            },
          },
          text: {
            color: (theme) => 
              theme.palette.mode === 'dark'
                ? '#F8F8F2'
                : theme.palette.text.primary,
            '&:hover': {
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(189, 147, 249, 0.1)'
                  : theme.palette.action.hover,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: isDarkMode ? colors.background : '#FFFFFF',
            backgroundImage: 'none',
            boxShadow: 'none',
            '&.MuiPaper-elevation1': {
              boxShadow: 'none',
            },
            '&.MuiPaper-elevation3': {
              boxShadow: 'none',
            },
            '&.MuiPaper-elevation7': {
              boxShadow: 'none',
            },
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: isDarkMode ? colors.background : '#FFFFFF',
            backgroundImage: 'none',
            boxShadow: isDarkMode 
              ? '0 4px 8px rgba(0,0,0,0.3)' 
              : '0 4px 8px rgba(0,0,0,0.2)',
            '& .MuiMenuItem-root': {
              '&:hover': {
                backgroundColor: themeColors.hover,
              },
              '&.Mui-selected': {
                backgroundColor: themeColors.selected,
                '&:hover': {
                  backgroundColor: themeColors.selectedHover,
                },
              },
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: isDarkMode ? colors.background : '#FFFFFF',
            backgroundImage: 'none',
            boxShadow: isDarkMode 
              ? '0 8px 16px rgba(0,0,0,0.4)' 
              : '0 8px 16px rgba(0,0,0,0.3)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#E0E0E0',
              },
              '&:hover fieldset': {
                borderColor: '#BDBDBD',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#9E9E9E',
              },
              '& input': {
                color: themeColors.foreground,
              },
            },
            '& .MuiInputLabel-root': {
              color: '#757575',
              '&.Mui-focused': {
                color: '#616161',
              },
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#E0E0E0',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#BDBDBD',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#9E9E9E',
            },
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: themeColors.hover,
            },
          },
        },
      },
      MuiCalendarPicker: {
        styleOverrides: {
          root: {
            backgroundColor: isDarkMode ? colors.background : '#FFFFFF',
            color: themeColors.foreground,
            '& .MuiTypography-root': {
              color: themeColors.foreground,
            },
            '& .MuiIconButton-root': {
              color: themeColors.foreground,
            },
            '& .MuiPickersDay-root': {
              color: themeColors.foreground,
              backgroundColor: 'transparent',
              '&:hover': {
                backgroundColor: themeColors.hover,
              },
              '&.Mui-selected': {
                backgroundColor: themeColors.purple,
                color: '#FFFFFF',
                '&:hover': {
                  backgroundColor: themeColors.purpleHover,
                },
              },
              '&.MuiPickersDay-today': {
                borderColor: themeColors.purple,
              },
            },
          },
        },
      },
      MuiDateCalendar: {
        styleOverrides: {
          root: {
            backgroundColor: isDarkMode ? colors.background : '#FFFFFF',
            color: themeColors.foreground,
            '& .MuiDayCalendar-weekDayLabel': {
              color: themeColors.comment,
            },
            '& .MuiPickersDay-root': {
              color: themeColors.foreground,
              '&:hover': {
                backgroundColor: themeColors.hover,
              },
              '&.Mui-selected': {
                backgroundColor: themeColors.purple,
                color: '#FFFFFF',
                '&:hover': {
                  backgroundColor: themeColors.purpleHover,
                },
              },
              '&.MuiPickersDay-today': {
                borderColor: themeColors.purple,
              },
            },
          },
        },
      },
      MuiPickersPopper: {
        styleOverrides: {
          paper: {
            backgroundColor: isDarkMode ? colors.background : '#FFFFFF',
            color: themeColors.foreground,
            '& .MuiPickersCalendarHeader-root': {
              color: themeColors.foreground,
            },
            '& .MuiPickersCalendarHeader-label': {
              color: themeColors.foreground,
            },
            '& .MuiIconButton-root': {
              color: themeColors.foreground,
            },
          },
        },
      },
    },
  });
};

export default getTheme; 