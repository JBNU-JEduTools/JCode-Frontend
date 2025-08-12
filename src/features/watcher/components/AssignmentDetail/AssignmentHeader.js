import React from 'react';
import { Box } from '@mui/material';
import WatcherBreadcrumbs from '../../../../components/common/WatcherBreadcrumbs';
import ChartHeader from '../charts/ChartHeader';

const AssignmentHeader = ({ course, assignment, assignmentId }) => {
  return (
    <Box sx={{ backgroundColor: 'transparent' }}>
      <WatcherBreadcrumbs 
        paths={[
          { 
            text: course?.courseName || '로딩중...', 
            to: `/watcher/class/${course?.courseId}` 
          },
          { 
            text: assignment?.assignmentName || '로딩중...', 
            to: `/watcher/class/${course?.courseId}/assignment/${assignmentId}` 
          }
        ]} 
      />

      <ChartHeader
        student={null}
        assignment={assignment}
        course={course}
      />
    </Box>
  );
};

export default AssignmentHeader; 