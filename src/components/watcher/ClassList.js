import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemText,
  ListItemButton,
  CircularProgress,
  Box,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';

const ClassList = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axios.get('/api/users/me/courses');
        setClasses(response.data);
        setLoading(false);
      } catch (error) {
        console.error('수업 목록 조회 실패:', error);
        setError('수업 목록을 불러오는데 실패했습니다.');
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

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
          담당 수업 목록
        </Typography>

        <List>
          {classes.map((classItem, index) => (
            <ListItem key={index} disablePadding divider>
              <ListItemButton onClick={() => navigate(`/watcher/class/${classItem.courseCode}`)}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {classItem.courseName}
                      <Chip 
                        label={classItem.courseCode} 
                        size="small" 
                        color="primary"
                      />
                    </Box>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {classes.length === 0 && (
          <Typography sx={{ mt: 2, textAlign: 'center' }}>
            담당하고 있는 수업이 없습니다.
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default ClassList; 