import React, { useEffect, useState } from 'react';
import { 
  Container, 
  CircularProgress, 
  Typography, 
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../api/axios';
import CodeIcon from '@mui/icons-material/Code';

const WebIDECourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('/api/users/me/courses');
        setCourses(response.data);
        setLoading(false);
      } catch (err) {
        setError('수업 목록을 불러오는데 실패했습니다.');
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleWebIDEOpen = async (courseId) => {
    try {
      const response = await axios.get(`/api/webide/url/${user.id}`, {
        params: { courseId }
      });
      
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (err) {
      setError('Web-IDE 접속 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography color="error">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        수강 중인 강의
      </Typography>
      
      {courses.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            수강 중인 강의가 없습니다.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {courses.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course.courseId}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {course.courseName}
                  </Typography>
                  <Chip 
                    label={course.courseCode}
                    color="primary"
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  <Typography color="text.secondary">
                    담당 교수: {course.professorName}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<CodeIcon />}
                    onClick={() => handleWebIDEOpen(course.courseId)}
                  >
                    Web-IDE 실행
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default WebIDECourses; 