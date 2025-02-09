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
  Stack,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Fade,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import MonitorIcon from '@mui/icons-material/Monitor';
import CodeIcon from '@mui/icons-material/Code';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SearchIcon from '@mui/icons-material/Search';

const ClassDetail = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [course, setCourse] = useState(null);
  const [sortField, setSortField] = useState('email');
  const [sortOrder, setSortOrder] = useState('asc');
  const { courseCode } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

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

  const getFilteredAndSortedStudents = () => {
    // 먼저 검색어로 필터링
    const filtered = students.filter(student => {
      const searchLower = searchQuery.toLowerCase();
      const emailMatch = student.email?.toLowerCase().includes(searchLower);
      const studentNumMatch = String(student.studentNum || '').toLowerCase().includes(searchLower);
      return emailMatch || studentNumMatch;
    });

    // 그 다음 정렬
    return filtered.sort((a, b) => {
      const field = sortField === 'email' ? 'email' : 'studentNum';
      const aValue = String(a[field] || '');
      const bValue = String(b[field] || '');
      
      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      }
      return bValue.localeCompare(aValue);
    });
  };

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

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
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="h5" 
              gutterBottom
              sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
            >
              수강생 목록
            </Typography>
            
            <TextField
              fullWidth
              size="small"
              placeholder="이메일 또는 학번으로 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ 
                mt: 2,
                '& .MuiInputBase-root': {
                  fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell 
                    sx={{ 
                      fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                      fontWeight: 'bold'
                    }}
                  >
                    이메일
                    <IconButton
                      size="small"
                      onClick={() => toggleSort('email')}
                      sx={{ ml: 1 }}
                    >
                      {sortOrder === 'asc' ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
                    </IconButton>
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                      fontWeight: 'bold'
                    }}
                  >
                    학번
                    <IconButton
                      size="small"
                      onClick={() => toggleSort('studentNum')}
                      sx={{ ml: 1 }}
                    >
                      {sortOrder === 'asc' ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
                    </IconButton>
                  </TableCell>
                  <TableCell 
                    align="right"
                    sx={{ 
                      fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                      fontWeight: 'bold'
                    }}
                  >
                    작업
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getFilteredAndSortedStudents().map((student, index) => (
                  <TableRow 
                    key={student.email}
                    sx={{ 
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
                    <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                      {student.email}
                    </TableCell>
                    <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                      {student.studentNum}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<MonitorIcon />}
                          onClick={() => navigate(`/watcher/monitoring/${student.userId}`)}
                          sx={{ 
                            fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                            fontWeight: 'bold'
                          }}
                        >
                          Watcher
                        </Button>
                        <Button
                          variant="contained"
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
                              window.location.href = response.data.redirectUrl;
                            } catch (error) {
                              console.error('JCode 리다이렉트 실패:', error);
                            }
                          }}
                          sx={{ 
                            fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                            fontWeight: 'bold',
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
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {getFilteredAndSortedStudents().length === 0 && (
            <Typography 
              sx={{ 
                mt: 2, 
                textAlign: 'center',
                fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
              }}
            >
              {searchQuery ? '검색 결과가 없습니다.' : '등록된 학생이 없습니다.'}
            </Typography>
          )}
        </Paper>
      </Container>
    </Fade>
  );
};

export default ClassDetail; 