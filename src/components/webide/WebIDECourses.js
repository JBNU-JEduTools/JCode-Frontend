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
  Chip,
  FormControl,
  Select,
  MenuItem,
  Stack,
  Paper,
  Fade
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../api/axios';
import CodeIcon from '@mui/icons-material/Code';
import { selectStyles } from '../../styles/selectStyles';

const WebIDECourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedTerm, setSelectedTerm] = useState('all');

  // 고유한 연도와 학기 목록 추출
  const years = [...new Set(courses.map(course => course.courseYear))].sort((a, b) => b - a);
  const terms = [...new Set(courses.map(course => course.courseTerm))].sort();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('/api/users/me/courses');
        setCourses(response.data);
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

  // 필터링된 강의 목록
  const filteredCourses = courses.filter(course => {
    const yearMatch = selectedYear === 'all' || course.courseYear === selectedYear;
    const termMatch = selectedTerm === 'all' || course.courseTerm === selectedTerm;
    return yearMatch && termMatch;
  });

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
    <Fade in={true} timeout={300}>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 3 
          }}>
            <Typography variant="h5">
              수강 중인 강의
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
                  <MenuItem value="all" sx={selectStyles.menuItem}>
                    전체 연도
                  </MenuItem>
                  {years.map(year => (
                    <MenuItem key={year} value={year} sx={selectStyles.menuItem}>
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
                  <MenuItem value="all" sx={selectStyles.menuItem}>
                    전체 학기
                  </MenuItem>
                  {terms.map(term => (
                    <MenuItem key={term} value={term} sx={selectStyles.menuItem}>
                      {term}학기
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Box>
          
          {filteredCourses.length === 0 ? (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="h6" color="text.secondary">
                해당하는 강의가 없습니다.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filteredCourses.map((course) => (
                <Grid item xs={12} sm={6} md={4} key={course.courseId}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
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
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography 
                        variant="h5" 
                        component="h2" 
                        gutterBottom
                        sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
                      >
                        {course.courseName}
                      </Typography>
                      <Chip 
                        label={course.courseCode}
                        color="primary"
                        size="small"
                        sx={{ 
                          mb: 2,
                          fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
                        }}
                      />
                      <Typography 
                        color="text.secondary" 
                        gutterBottom
                        sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
                      >
                        담당 교수: {course.courseProfessor} 교수님
                      </Typography>
                      <Typography 
                        color="text.secondary" 
                        variant="body2"
                        sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
                      >
                        {course.courseYear}년 {course.courseTerm}학기
                      </Typography>
                      <Typography 
                        color="text.secondary" 
                        variant="body2"
                        sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
                      >
                        {course.courseClss}분반
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<CodeIcon />}
                        onClick={() => handleWebIDEOpen(course.courseId)}
                        sx={{
                          bgcolor: 'rgba(25, 118, 210, 0.9)',
                          '&:hover': {
                            bgcolor: 'rgba(25, 118, 210, 1)',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        J-Code 실행
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Container>
    </Fade>
  );
};

export default WebIDECourses; 