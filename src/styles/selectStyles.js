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
        theme.palette.mode === 'dark' ? theme.palette.text.secondary : theme.palette.text.disabled,
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: (theme) => 
        theme.palette.mode === 'dark' ? theme.palette.text.primary : theme.palette.text.secondary,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: (theme) => theme.palette.primary.main,
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
        bgcolor: (theme) => theme.palette.background.paper,
        '& .MuiMenuItem-root': {
          color: (theme) => theme.palette.text.primary,
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: (theme) => theme.palette.action.hover
          }
        }
      }
    }
  },

  menuItem: {
    fontSize: '0.875rem',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: (theme) => theme.palette.action.hover,
    },
    '&.Mui-selected': {
      backgroundColor: (theme) => theme.palette.action.selected,
      '&:hover': {
        backgroundColor: (theme) => theme.palette.action.selectedHover,
      }
    }
  },

  listItem: {
    transition: 'all 0.2s ease',
  },

  listItemButton: {
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: (theme) => theme.palette.action.hover,
    }
  }
}; 