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
import { mockClasses } from '../../mockData/classes';

const ClassList = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        // TODO: API 구현 필요 - GET /api/classes
        // Response: Array<{
        //   id: number,
        //   name: string,
        //   year: number,
        //   semester: number,
        //   students: Array<{ id, name, ... }>
        // }>
        // API 호출 대신 목업 데이터 사용
        setClasses(mockClasses);
      } catch (err) {
        setError('수업 목록을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

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
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          수업 목록
        </Typography>
        
        <List>
          {classes.map((classItem) => (
            <ListItem key={classItem.id} disablePadding>
              <ListItemButton 
                onClick={() => navigate(`/watcher/class/${classItem.id}`)}
              >
                <ListItemText 
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {classItem.name}
                      <Chip 
                        label={`${classItem.students.length}명`} 
                        size="small" 
                        color="primary"
                      />
                    </Box>
                  }
                  secondary={`${classItem.year}년 ${classItem.semester}학기`}
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