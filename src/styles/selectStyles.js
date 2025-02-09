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
      borderColor: 'divider',
      transition: 'all 0.2s ease',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'primary.main',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: 'primary.main',
      borderWidth: '1px',
      boxShadow: '0 0 0 4px rgba(25, 118, 210, 0.08)',
    },
    borderRadius: 1.5,
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.02)'
    }
  },

  menuProps: {
    TransitionProps: { timeout: 200 },
    PaperProps: {
      sx: {
        mt: 0.5,
        '& .MuiMenuItem-root': {
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)'
          }
        }
      }
    }
  },

  menuItem: {
    fontSize: '0.875rem',
    transition: 'all 0.2s ease',
    '&.Mui-selected': {
      backgroundColor: 'primary.lighter',
    },
    '&.Mui-selected:hover': {
      backgroundColor: 'primary.light'
    }
  },

  listItem: {
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'rgba(25, 118, 210, 0.04)',
    }
  },

  listItemButton: {
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'translateX(4px)',
    }
  }
}; 