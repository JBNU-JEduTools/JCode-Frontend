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
  Stack,
  Fade
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
          <Typography 
            color="error" 
            align="center"
            sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
          >
            {error}
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Fade in={true} timeout={300}>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 3 
          }}>
            <Typography 
              variant="h5"
              sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
            >
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
                    sx={{ 
                      ...selectStyles.menuItem,
                      fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
                    }}
                  >
                    전체 연도
                  </MenuItem>
                  {years.map(year => (
                    <MenuItem 
                      key={year} 
                      value={year}
                      sx={{ 
                        ...selectStyles.menuItem,
                        fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
                      }}
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
                  MenuProps={selectStyles.menuProps}
                  sx={selectStyles.select}
                >
                  <MenuItem 
                    value="all" 
                    sx={{ 
                      ...selectStyles.menuItem,
                      fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
                    }}
                  >
                    전체 학기
                  </MenuItem>
                  {terms.map(term => (
                    <MenuItem 
                      key={term} 
                      value={term}
                      sx={{ 
                        ...selectStyles.menuItem,
                        fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
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
                sx={{
                  ...selectStyles.listItem,
                  transition: 'all 0.3s ease',
                  animation: 'fadeIn 0.3s ease',
                  '@keyframes fadeIn': {
                    '0%': {
                      opacity: 0,
                      transform: 'translateY(10px)'
                    },
                    '100%': {
                      opacity: 1,
                      transform: 'translateY(0)'
                    }
                  }
                }}
              >
                <ListItemButton 
                  onClick={() => navigate(`/watcher/class/${classItem.courseCode}`)}
                  sx={selectStyles.listItemButton}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                          {classItem.courseName}
                        </Typography>
                        <Chip 
                          label={classItem.courseCode} 
                          size="small" 
                          color="primary"
                          sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
                        />
                      </Box>
                    }
                    secondary={`${classItem.courseYear}년 ${classItem.courseTerm}학기 | ${classItem.courseClss}분반`}
                    primaryTypographyProps={{ 
                      fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" 
                    }}
                    secondaryTypographyProps={{ 
                      fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                      sx: { mt: 0.5 }
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          {filteredClasses.length === 0 && (
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{ 
                fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                textAlign: 'center'
              }}
            >
              해당하는 강의가 없습니다.
            </Typography>
          )}
        </Paper>
      </Container>
    </Fade>
  );
};

export default ClassList; 