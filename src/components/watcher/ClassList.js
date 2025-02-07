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
  Chip,
  FormControl,
  Select,
  MenuItem,
  Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import { selectStyles } from '../../styles/selectStyles';

const ClassList = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedTerm, setSelectedTerm] = useState('all');
  const navigate = useNavigate();

  // 고유한 연도와 학기 목록 추출
  const years = [...new Set(classes.map(course => course.courseYear))].sort((a, b) => b - a);
  const terms = [...new Set(classes.map(course => course.courseTerm))].sort();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axios.get('/api/users/me/courses');
        setClasses(response.data);
        // 초기 선택값을 가장 최근 연도/학기로 설정
        if (response.data.length > 0) {
          const latestYear = Math.max(...response.data.map(course => course.courseYear));
          const latestTerm = Math.max(...response.data
            .filter(course => course.courseYear === latestYear)
            .map(course => course.courseTerm));
          setSelectedYear(latestYear);
          setSelectedTerm(latestTerm);
        }
        setLoading(false);
      } catch (error) {
        console.error('수업 목록 조회 실패:', error);
        setError('수업 목록을 불러오는데 실패했습니다.');
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // 필터링된 강의 목록
  const filteredClasses = classes.filter(course => {
    const yearMatch = selectedYear === 'all' || course.courseYear === selectedYear;
    const termMatch = selectedTerm === 'all' || course.courseTerm === selectedTerm;
    return yearMatch && termMatch;
  });

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
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3 
        }}>
          <Typography variant="h5">
            담당 수업 목록
          </Typography>

          <Stack direction="row" spacing={1}>
            <FormControl sx={{ minWidth: 100 }}>
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                displayEmpty
                size="small"
                MenuProps={selectStyles.menuProps}
                sx={selectStyles.select}
              >
                <MenuItem 
                  value="all" 
                  sx={selectStyles.menuItem}
                >
                  전체 연도
                </MenuItem>
                {years.map(year => (
                  <MenuItem 
                    key={year} 
                    value={year}
                    sx={selectStyles.menuItem}
                  >
                    {year}년
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 90 }}>
              <Select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                displayEmpty
                size="small"
                MenuProps={{
                  TransitionProps: { timeout: 200 },
                  PaperProps: {
                    sx: {
                      mt: 0.5,
                      '& .MuiMenuItem-root': {
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateX(4px)',
                          backgroundColor: 'primary.lighter'
                        }
                      }
                    }
                  }
                }}
                sx={{
                  height: 32,
                  backgroundColor: 'background.paper',
                  transition: 'all 0.2s ease',
                  '& .MuiSelect-select': {
                    paddingY: '4px',
                    fontSize: '0.875rem',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'divider',
                    transition: 'all 0.2s ease',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                    borderWidth: '1px',
                    boxShadow: '0 0 0 4px rgba(25, 118, 210, 0.08)',
                  },
                  borderRadius: 1.5,
                  '&:hover': {
                    transform: 'translateY(-1px)',
                  }
                }}
              >
                <MenuItem 
                  value="all" 
                  sx={{ 
                    fontSize: '0.875rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  전체 학기
                </MenuItem>
                {terms.map(term => (
                  <MenuItem 
                    key={term} 
                    value={term}
                    sx={{ 
                      fontSize: '0.875rem',
                      transition: 'all 0.2s ease',
                      '&.Mui-selected': {
                        backgroundColor: 'primary.lighter',
                      },
                      '&.Mui-selected:hover': {
                        backgroundColor: 'primary.light',
                        transform: 'translateX(4px)',
                      }
                    }}
                  >
                    {term}학기
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Box>

        <List>
          {filteredClasses.map((classItem, index) => (
            <ListItem 
              key={index} 
              disablePadding 
              divider
              sx={selectStyles.listItem}
            >
              <ListItemButton 
                onClick={() => navigate(`/watcher/class/${classItem.courseCode}`)}
                sx={selectStyles.listItemButton}
              >
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
                  secondary={
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {classItem.courseYear}년 {classItem.courseTerm}학기 | {classItem.courseClss}분반
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {filteredClasses.length === 0 && (
          <Typography sx={{ mt: 2, textAlign: 'center' }}>
            해당하는 수업이 없습니다.
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default ClassList; 