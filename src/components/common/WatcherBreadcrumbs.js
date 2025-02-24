import React from 'react';
import { Breadcrumbs, Link, Typography } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useNavigate } from 'react-router-dom';

const WatcherBreadcrumbs = ({ paths }) => {
  const navigate = useNavigate();

  return (
    <Breadcrumbs 
      separator={<NavigateNextIcon fontSize="small" />} 
      sx={{ mb: 3 }}
    >
      <Link
        color="inherit"
        sx={{ 
          cursor: 'pointer',
          fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
          '&:hover': { textDecoration: 'underline' }
        }}
        onClick={() => navigate('/watcher')}
      >
        강의 목록
      </Link>
      {paths.map((path, index) => {
        const isLast = index === paths.length - 1;
        return isLast ? (
          <Typography 
            key={path.text}
            sx={{ 
              fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" 
            }}
          >
            {path.text}
          </Typography>
        ) : (
          <Link
            key={path.text}
            color="inherit"
            sx={{ 
              cursor: 'pointer',
              fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
              '&:hover': { textDecoration: 'underline' }
            }}
            onClick={() => navigate(path.to)}
          >
            {path.text}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
};

export default WatcherBreadcrumbs; 