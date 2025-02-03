import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminHome from './AdminHome';
import ProfessorManagement from './ProfessorManagement';
import AssistantManagement from './AssistantManagement';
import StudentManagement from './StudentManagement';
import ClassManagement from './ClassManagement';

const Admin = () => {
  return (
    <Routes>
      <Route index element={<AdminHome />} />
      <Route path="professors" element={<ProfessorManagement />} />
      <Route path="assistants" element={<AssistantManagement />} />
      <Route path="students" element={<StudentManagement />} />
      <Route path="classes" element={<ClassManagement />} />
    </Routes>
  );
};

export default Admin; 