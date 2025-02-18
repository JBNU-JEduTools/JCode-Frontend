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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem
} from '@mui/material';
import { useParams } from 'react-router-dom';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import MonitorIcon from '@mui/icons-material/Monitor';
import CodeIcon from '@mui/icons-material/Code';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import TimelineIcon from '@mui/icons-material/Timeline';
import BuildIcon from '@mui/icons-material/Build';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { 
  mockStudentCodeStats, 
  mockCompileStats, 
  mockSubmissionStats 
} from '../../mockData/monitoringData';
import { useTheme } from '../../contexts/ThemeContext';

const MetricSelector = ({ selectedMetric, onMetricChange }) => (
  <Box sx={{ 
    display: 'flex', 
    gap: 2, 
    p: 2, 
    borderBottom: 1, 
    borderColor: 'divider',
    backgroundColor: (theme) => 
      theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.02)',
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
        메트릭:
      </Typography>
      <Box sx={{ 
        display: 'flex', 
        gap: 0.5, 
        backgroundColor: (theme) => 
          theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)',
        borderRadius: 1,
        p: 0.5
      }}>
        <Button
          size="small"
          variant={selectedMetric === 'changes' ? 'contained' : 'text'}
          onClick={() => onMetricChange('changes')}
          startIcon={<TimelineIcon />}
          sx={{ 
            minWidth: '120px',
            textTransform: 'none',
            fontWeight: selectedMetric === 'changes' ? 'bold' : 'normal'
          }}
        >
          코드 변화량
        </Button>
        <Button
          size="small"
          variant={selectedMetric === 'compiles' ? 'contained' : 'text'}
          onClick={() => onMetricChange('compiles')}
          startIcon={<BuildIcon />}
          sx={{ 
            minWidth: '120px',
            textTransform: 'none',
            fontWeight: selectedMetric === 'compiles' ? 'bold' : 'normal'
          }}
        >
          컴파일 횟수
        </Button>
        <Button
          size="small"
          variant={selectedMetric === 'submissions' ? 'contained' : 'text'}
          onClick={() => onMetricChange('submissions')}
          startIcon={<AssignmentTurnedInIcon />}
          sx={{ 
            minWidth: '120px',
            textTransform: 'none',
            fontWeight: selectedMetric === 'submissions' ? 'bold' : 'normal'
          }}
        >
          제출 현황
        </Button>
      </Box>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
        시간 범위:
      </Typography>
      <Select
        size="small"
        value="last24h"
        sx={{ minWidth: 120 }}
      >
        <MenuItem value="last1h">최근 1시간</MenuItem>
        <MenuItem value="last24h">최근 24시간</MenuItem>
        <MenuItem value="last7d">최근 7일</MenuItem>
      </Select>
    </Box>
  </Box>
);

const MonitoringDashboard = () => {
  const { isDarkMode } = useTheme();
  const [selectedMetric, setSelectedMetric] = useState('changes');

  const avgChange = mockStudentCodeStats.reduce((acc, curr) => acc + curr.avgChangesPerMin, 0) / mockStudentCodeStats.length;
  const stdDev = Math.sqrt(
    mockStudentCodeStats.reduce((acc, curr) => acc + Math.pow(curr.avgChangesPerMin - avgChange, 2), 0) / mockStudentCodeStats.length
  );

  const getYAxisLabel = () => {
    switch(selectedMetric) {
      case 'changes': return '분당 평균 변경량';
      case 'compiles': return '컴파일 횟수';
      case 'submissions': return '제출 횟수';
      default: return '';
    }
  };

  const getData = () => {
    switch(selectedMetric) {
      case 'changes': 
        return mockStudentCodeStats.map(s => ({
          studentName: s.studentName,
          value: s.avgChangesPerMin,
          isOutlier: Math.abs(s.avgChangesPerMin - avgChange) > 2 * stdDev
        }));
      case 'compiles': 
        return mockStudentCodeStats.map(s => ({
          studentName: s.studentName,
          value: s.totalCompiles || Math.floor(Math.random() * 100)
        }));
      case 'submissions': 
        return mockStudentCodeStats.map(s => ({
          studentName: s.studentName,
          정답: Math.floor(Math.random() * 30),
          '컴파일 에러': Math.floor(Math.random() * 20),
          '런타임 에러': Math.floor(Math.random() * 15),
          '시간 초과': Math.floor(Math.random() * 10),
          '메모리 초과': Math.floor(Math.random() * 5)
        }));
      default: 
        return [];
    }
  };

  return (
    <Card>
      <MetricSelector 
        selectedMetric={selectedMetric} 
        onMetricChange={setSelectedMetric}
      />
      <CardContent sx={{ height: '600px' }}>
        <ResponsiveContainer width="100%" height="100%">
          {selectedMetric === 'submissions' ? (
            <BarChart 
              data={getData()}
              margin={{ top: 20, right: 50, left: 50, bottom: 60 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                fill={isDarkMode ? '#1e1e1e' : '#f5f5f5'}
              />
              <XAxis 
                dataKey="studentName"
                angle={-45}
                textAnchor="end"
                height={60}
                interval={0}
                stroke={isDarkMode ? '#fff' : '#000'}
              />
              <YAxis 
                label={{ 
                  value: '제출 횟수', 
                  angle: -90, 
                  position: 'insideLeft',
                  offset: -40,
                  fill: isDarkMode ? '#fff' : '#000'
                }}
                stroke={isDarkMode ? '#fff' : '#000'}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: isDarkMode ? 'rgb(48, 48, 48)' : 'rgb(255, 255, 255)',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                  color: isDarkMode ? '#fff' : '#000',
                  padding: '8px 12px',
                  fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
                }}
              />
              <Legend 
                verticalAlign="top"
                height={36}
              />
              <Bar dataKey="정답" stackId="a" fill={isDarkMode ? '#66bb6a' : '#2e7d32'} barSize={30} />
              <Bar dataKey="컴파일 에러" stackId="a" fill={isDarkMode ? '#ffa726' : '#ef6c00'} barSize={30} />
              <Bar dataKey="런타임 에러" stackId="a" fill={isDarkMode ? '#ef5350' : '#c62828'} barSize={30} />
              <Bar dataKey="시간 초과" stackId="a" fill={isDarkMode ? '#42a5f5' : '#1565c0'} barSize={30} />
              <Bar dataKey="메모리 초과" stackId="a" fill={isDarkMode ? '#ab47bc' : '#6a1b9a'} barSize={30} />
            </BarChart>
          ) : (
            <BarChart 
              data={getData()}
              margin={{ top: 20, right: 50, left: 50, bottom: 60 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                fill={isDarkMode ? '#1e1e1e' : '#f5f5f5'}
              />
              <XAxis 
                dataKey="studentName"
                angle={-45}
                textAnchor="end"
                height={60}
                interval={0}
                stroke={isDarkMode ? '#fff' : '#000'}
              />
              <YAxis 
                label={{ 
                  value: getYAxisLabel(), 
                  angle: -90, 
                  position: 'insideLeft',
                  offset: -40,
                  fill: isDarkMode ? '#fff' : '#000'
                }}
                stroke={isDarkMode ? '#fff' : '#000'}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: isDarkMode ? 'rgb(48, 48, 48)' : 'rgb(255, 255, 255)',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                  color: isDarkMode ? '#fff' : '#000',
                  padding: '8px 12px',
                  fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
                }}
              />
              <Bar 
                dataKey="value"
                fill={isDarkMode ? '#42a5f5' : '#1976d2'}
                radius={[4, 4, 0, 0]}
                barSize={30}
              >
                {getData().map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={
                      selectedMetric === 'changes' && entry.isOutlier
                        ? (isDarkMode ? '#ff5252' : '#d32f2f')
                        : selectedMetric === 'changes'
                          ? (isDarkMode ? '#42a5f5' : '#1976d2')
                          : (isDarkMode ? '#7e57c2' : '#512da8')
                    }
                  />
                ))}
              </Bar>
              {selectedMetric === 'changes' && (
                <>
                  <ReferenceLine 
                    y={avgChange} 
                    stroke={isDarkMode ? '#81c784' : '#2e7d32'}
                    strokeDasharray="5 5"
                    label={{ 
                      value: '평균', 
                      position: 'right',
                      fill: isDarkMode ? '#81c784' : '#2e7d32'
                    }}
                  />
                  <ReferenceLine 
                    y={avgChange + 2 * stdDev} 
                    stroke={isDarkMode ? '#ffb74d' : '#ef6c00'}
                    strokeDasharray="5 5"
                    label={{ 
                      value: '+2σ', 
                      position: 'right',
                      fill: isDarkMode ? '#ffb74d' : '#ef6c00'
                    }}
                  />
                  <ReferenceLine 
                    y={avgChange - 2 * stdDev} 
                    stroke={isDarkMode ? '#ffb74d' : '#ef6c00'}
                    strokeDasharray="5 5"
                    label={{ 
                      value: '-2σ', 
                      position: 'right',
                      fill: isDarkMode ? '#ffb74d' : '#ef6c00'
                    }}
                  />
                </>
              )}
            </BarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

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
        const coursesResponse = await api.get('/api/users/me/courses');
        const foundCourse = coursesResponse.data.find(c => c.courseCode === courseCode);
        
        if (!foundCourse) {
          throw new Error('강의를 찾을 수 없습니다.');
        }

        setCourse(foundCourse);
        const studentsResponse = await api.get(`/api/courses/${foundCourse.courseId}/users`);
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
      <Container 
        maxWidth={false}
        sx={{ 
          mt: 2,
          px: 2,
        }}
      >
        <Paper 
          elevation={1}
          sx={{ 
            p: 2,
            minHeight: 'calc(100vh - 100px)',
            borderRadius: 0
          }}
        >
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              {course?.courseName}
            </Typography>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Accordion 
              sx={{
                boxShadow: 'none',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                '&:before': {
                  display: 'none',
                },
                '&:not(:last-child)': {
                  borderBottom: 0,
                },
                borderRadius: '8px',
                overflow: 'hidden',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: (theme) => 
                    theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.01)'
                }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  backgroundColor: (theme) => 
                    theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                  '&.Mui-expanded': {
                    minHeight: '48px',
                    borderBottom: (theme) => `1px solid ${theme.palette.divider}`
                  },
                  '& .MuiAccordionSummary-content': {
                    margin: '12px 0',
                    '&.Mui-expanded': { margin: '12px 0' }
                  }
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1.5,
                  '& .MuiSvgIcon-root': {
                    fontSize: '1.3rem',
                    color: (theme) => theme.palette.primary.main
                  }
                }}>
                  <DashboardIcon />
                  <Typography sx={{ 
                    fontWeight: 500,
                    fontSize: '1rem',
                    color: (theme) => theme.palette.text.primary
                  }}>
                    전체 모니터링 대시보드
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ 
                p: 3,
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.01)' : 'rgba(0, 0, 0, 0.01)'
              }}>
                <MonitoringDashboard />
              </AccordionDetails>
            </Accordion>

            <Accordion 
              sx={{
                mt: 2,
                boxShadow: 'none',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                '&:before': {
                  display: 'none',
                },
                borderRadius: '8px',
                overflow: 'hidden',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: (theme) => 
                    theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.01)'
                }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  backgroundColor: (theme) => 
                    theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                  '&.Mui-expanded': {
                    minHeight: '48px',
                    borderBottom: (theme) => `1px solid ${theme.palette.divider}`
                  },
                  '& .MuiAccordionSummary-content': {
                    margin: '12px 0',
                    '&.Mui-expanded': { margin: '12px 0' }
                  }
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1.5,
                  '& .MuiSvgIcon-root': {
                    fontSize: '1.3rem',
                    color: (theme) => theme.palette.primary.main
                  }
                }}>
                  <PeopleIcon />
                  <Typography sx={{ 
                    fontWeight: 500,
                    fontSize: '1rem',
                    color: (theme) => theme.palette.text.primary
                  }}>
                    수강생 목록
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ 
                p: 3,
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.01)' : 'rgba(0, 0, 0, 0.01)'
              }}>
                <Box sx={{ mb: 3 }}>
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
                                    const response = await api.get(`/api/redirect/redirect`, {
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
                                JCode 실행
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
              </AccordionDetails>
            </Accordion>
          </Box>
        </Paper>
      </Container>
    </Fade>
  );
};

export default ClassDetail; 