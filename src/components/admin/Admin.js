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
  Divider
} from '@mui/material';
import { Routes, Route, useNavigate } from 'react-router-dom';
import StudentManagement from './StudentManagement';

// 관리자 메인 페이지
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
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          관리자 페이지
        </Typography>
        <List>
          {menuItems.map((item, index) => (
            <React.Fragment key={item.path}>
              <ListItem>
                <Box sx={{ width: '100%' }}>
                  <ListItemText 
                    primary={item.title}
                    secondary={item.description}
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
      </Paper>
    </Container>
  );
};

// 교수 계정 관리 페이지 (예시)
const ProfessorManagement = () => {
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          교수 계정 관리
        </Typography>
        <Typography>
          교수 계정 관리 기능은 아직 구현되지 않았습니다.
        </Typography>
      </Paper>
    </Container>
  );
};

// 조교 계정 관리 페이지 (예시)
const AssistantManagement = () => {
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          조교 계정 관리
        </Typography>
        <Typography>
          조교 계정 관리 기능은 아직 구현되지 않았습니다.
        </Typography>
      </Paper>
    </Container>
  );
};

// 수업 관리 페이지 (예시)
const ClassManagement = () => {
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          수업 관리
        </Typography>
        <Typography>
          수업 관리 기능은 아직 구현되지 않았습니다.
        </Typography>
      </Paper>
    </Container>
  );
};

// 메인 Admin 컴포넌트
const Admin = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminHome />} />
      <Route path="/professors" element={<ProfessorManagement />} />
      <Route path="/assistants" element={<AssistantManagement />} />
      <Route path="/students" element={<StudentManagement />} />
      <Route path="/classes" element={<ClassManagement />} />
    </Routes>
  );
};

export default Admin; 