import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container, Paper, Fade } from '@mui/material';
import AdminHome from './AdminHome';
import ProfessorManagement from './ProfessorManagement';
import AssistantManagement from './AssistantManagement';
import StudentManagement from './StudentManagement';
import ClassManagement from './ClassManagement';

const Admin = () => {
  return (
    <Routes>
      <Route index element={
        <Fade in={true} timeout={300}>
          <Container maxWidth="lg" sx={{ mt: 2, px: 2 }}>
            <Paper 
              elevation={7} 
              sx={{ 
                p: 3,
                backgroundColor: (theme) => 
                  theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.01)',
              }}
            >
              <AdminHome />
            </Paper>
          </Container>
        </Fade>
      } />
      <Route path="professors" element={
        <Fade in={true} timeout={300}>
          <Container maxWidth="lg" sx={{ mt: 2, px: 2 }}>
            <Paper 
              elevation={7} 
              sx={{ 
                p: 3,
                backgroundColor: (theme) => 
                  theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.01)',
              }}
            >
              <ProfessorManagement />
            </Paper>
          </Container>
        </Fade>
      } />
      <Route path="assistants" element={
        <Fade in={true} timeout={300}>
          <Container maxWidth="lg" sx={{ mt: 2, px: 2 }}>
            <Paper 
              elevation={7} 
              sx={{ 
                p: 3,
                backgroundColor: (theme) => 
                  theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.01)',
              }}
            >
              <AssistantManagement />
            </Paper>
          </Container>
        </Fade>
      } />
      <Route path="students" element={
        <Fade in={true} timeout={300}>
          <Container maxWidth="lg" sx={{ mt: 2, px: 2 }}>
            <Paper 
              elevation={7} 
              sx={{ 
                p: 3,
                backgroundColor: (theme) => 
                  theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.01)',
              }}
            >
              <StudentManagement />
            </Paper>
          </Container>
        </Fade>
      } />
      <Route path="classes" element={
        <Fade in={true} timeout={300}>
          <Container maxWidth="lg" sx={{ mt: 2, px: 2 }}>
            <Paper 
              elevation={7} 
              sx={{ 
                p: 3,
                backgroundColor: (theme) => 
                  theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.01)',
              }}
            >
              <ClassManagement />
            </Paper>
          </Container>
        </Fade>
      } />
    </Routes>
  );
};

export default Admin; 