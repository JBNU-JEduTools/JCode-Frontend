import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ClassList from '../../components/watcher/ClassList';
import ClassDetail from '../../components/watcher/ClassDetail';
import AssignmentDetail from '../../components/watcher/AssignmentDetail';

const WatcherPage = () => {
  return (
    <Routes>
      <Route path="/" element={<ClassList />} />
      <Route path="/class/:courseCode" element={<ClassDetail />} />
      <Route path="/class/:courseCode/assignment/:assignmentId" element={<AssignmentDetail />} />
    </Routes>
  );
};

export default WatcherPage; 