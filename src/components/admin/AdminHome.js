import React from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box,
  List,
  ListItem,
  ListItemText,
  Button,
  Divider,
  Fade
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AdminHome = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: '교수 계정 관리',
      description: '교수 계정을 등록하고 관리합니다.',
      path: '/admin/professors'
    },
    {
      title: '조교 계정 관리',
      description: '조교 계정을 등록하고 관리합니다.',
      path: '/admin/assistants'
    },
    {
      title: '학생 계정 관리',
      description: '학생 계정을 관리하고 수업에 배정합니다.',
      path: '/admin/students'
    },
    {
      title: '수업 관리',
      description: '수업을 등록하고 관리합니다.',
      path: '/admin/classes'
    }
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
        관리자 페이지
      </Typography>
      <List>
        {menuItems.map((item, index) => (
          <React.Fragment key={item.path}>
            <ListItem>
              <Box 
                sx={{ 
                  width: '100%',
                  transition: 'all 0.3s ease',
                  animation: 'fadeIn 0.3s ease',
                  '@keyframes fadeIn': {
                    '0%': {
                      opacity: 0,
                      transform: 'translateY(10px)'
                    },
                    '100%': {
                      opacity: 1,
                      transform: 'translateY(0)'
                    }
                  }
                }}
              >
                <ListItemText 
                  primary={item.title}
                  secondary={item.description}
                  primaryTypographyProps={{ 
                    fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                    fontWeight: 600 
                  }}
                  secondaryTypographyProps={{ 
                    fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" 
                  }}
                />
                <Button 
                  variant="contained"
                  onClick={() => navigate(item.path)}
                  sx={{ mt: 1 }}
                >
                  관리하기
                </Button>
              </Box>
            </ListItem>
            {index < menuItems.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default AdminHome; 