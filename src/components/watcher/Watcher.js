import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ClassList from './ClassList';
import StudentList from './StudentList';
import MonitoringData from './MonitoringData';

const Watcher = () => {
  return (
    <Routes>
      <Route path="/" element={<ClassList />} />
      <Route path="/class/:classId" element={<StudentList />} />
      <Route path="/student/:studentId" element={<MonitoringData />} />
    </Routes>
  );
};

export default Watcher; 