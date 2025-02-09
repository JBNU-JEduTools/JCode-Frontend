export const selectStyles = {
  select: {
    height: 32,
    backgroundColor: 'background.paper',
    transition: 'all 0.2s ease',
    '& .MuiSelect-select': {
      paddingY: '4px',
      fontSize: '0.875rem',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: (theme) => 
        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: (theme) => 
        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: (theme) => 
        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
    },
    borderRadius: 1.5,
    '&:hover': {
      backgroundColor: 'transparent',
    }
  },

  menuProps: {
    TransitionProps: { timeout: 200 },
    PaperProps: {
      sx: {
        mt: 0.5,
        bgcolor: (theme) => 
          theme.palette.mode === 'dark' ? '#1e1e1e' : '#ffffff',
        '& .MuiMenuItem-root': {
          color: (theme) => 
            theme.palette.mode === 'dark' ? '#ffffff' : '#1a1a1a',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: (theme) => 
              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'
          }
        }
      }
    }
  },

  menuItem: {
    fontSize: '0.875rem',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: (theme) => 
        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    },
    '&.Mui-selected': {
      backgroundColor: (theme) => 
        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.08)',
      '&:hover': {
        backgroundColor: (theme) => 
          theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.24)' : 'rgba(0, 0, 0, 0.12)',
      }
    }
  },

  listItem: {
    transition: 'all 0.2s ease',
  },

  listItemButton: {
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: (theme) => 
        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    }
  }
}; 