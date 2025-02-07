import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemText,
  CircularProgress,
  Box,
  Button,
  Stack
} from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import MonitorIcon from '@mui/icons-material/Monitor';
import CodeIcon from '@mui/icons-material/Code';

const ClassDetail = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [course, setCourse] = useState(null);
  const { courseCode } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const coursesResponse = await axios.get('/api/users/me/courses');
        const foundCourse = coursesResponse.data.find(c => c.courseCode === courseCode);
        
        if (!foundCourse) {
          throw new Error('강의를 찾을 수 없습니다.');
        }

        setCourse(foundCourse);
        const studentsResponse = await axios.get(`/api/courses/${foundCourse.courseId}/users`);
        setStudents(studentsResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('학생 목록 조회 실패:', error);
        setError('학생 목록을 불러오는데 실패했습니다.');
        setLoading(false);
      }
    };

    fetchStudents();
  }, [courseCode]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography color="error" align="center">
            {error}
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          수강생 목록
        </Typography>

        <List>
          {students.map((student, index) => (
            <ListItem 
              key={index} 
              divider
              secondaryAction={
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<MonitorIcon />}
                    onClick={() => navigate(`/watcher/monitoring/${student.userId}`)}
                  >
                    모니터링
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<CodeIcon />}
                    onClick={async () => {
                      try {
                        const response = await axios.get(`/api/redirect/redirect`, {
                          params: {
                            userId: student.userId,
                            courseId: course.courseId
                          }
                        });
                        // JCode 서버로 리다이렉트
                        window.location.href = response.data.redirectUrl;
                      } catch (error) {
                        console.error('JCode 리다이렉트 실패:', error);
                      }
                    }}
                  >
                    JCode
                  </Button>
                </Stack>
              }
            >
              <ListItemText
                primary={student.email}
                secondary={`학번: ${student.studentNum}`}
              />
            </ListItem>
          ))}
        </List>

        {students.length === 0 && (
          <Typography sx={{ mt: 2, textAlign: 'center' }}>
            등록된 학생이 없습니다.
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default ClassDetail; 