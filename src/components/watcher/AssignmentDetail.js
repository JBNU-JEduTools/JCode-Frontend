import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Fade,
  Breadcrumbs,
  Link,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  InputAdornment,
  DialogActions,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Card,
  Tabs,
  Tab
} from '@mui/material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axios';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import MonitorIcon from '@mui/icons-material/Monitor';
import CodeIcon from '@mui/icons-material/Code';
import RemainingTime from './RemainingTime';
import WatcherBreadcrumbs from '../common/WatcherBreadcrumbs';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useAuth } from '../../contexts/AuthContext';

// TabPanel 컴포넌트 추가
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AssignmentDetail = () => {
  const { courseId, assignmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [course, setCourse] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState({
    field: 'name',
    order: 'asc'
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.role === 'ADMIN') {
          // 관리자는 직접 강의 정보를 조회
          const coursesResponse = await api.get(`/api/courses/${courseId}/admin/details`);
          setCourse(coursesResponse.data);
          
          // 과제 정보 조회
          const assignmentResponse = await api.get(`/api/courses/${courseId}/assignments`);
          const currentAssignment = assignmentResponse.data.find(a => a.assignmentId === parseInt(assignmentId));
          
          if (!currentAssignment) {
            throw new Error('과제를 찾을 수 없습니다.');
          }
          setAssignment(currentAssignment);
        } else {
          // 교수는 자신의 강의 목록에서 조회
          const coursesResponse = await api.get('/api/users/me/courses/details');
          const foundCourse = coursesResponse.data.find(c => c.courseId === parseInt(courseId));
          
          if (!foundCourse) {
            throw new Error('강의를 찾을 수 없습니다.');
          }
          setCourse(foundCourse);

          // 과제 정보 조회
          const assignmentResponse = await api.get(`/api/courses/${courseId}/assignments`);
          const currentAssignment = assignmentResponse.data.find(a => a.assignmentId === parseInt(assignmentId));
          
          if (!currentAssignment) {
            throw new Error('과제를 찾을 수 없습니다.');
          }
          setAssignment(currentAssignment);
        }

        // 수강생 목록 조회
        const studentsResponse = await api.get(`/api/courses/${courseId}/users`);
        // 임시로 수강생 목록을 submissions 형태로 변환
        const mockSubmissions = studentsResponse.data.map(student => ({
          userId: student.userId,
          userEmail: student.email,
          name: student.name,
          studentNum: student.studentNum,
          status: '진행중',
          lastSubmissionTime: null,
          submissionCount: 0,
          avgChangesPerMin: Math.random() * 10,  // 테스트용 임시 데이터
          score: Math.floor(Math.random() * 101),  // 테스트용 임시 데이터 (0-100)
          isCorrect: Math.random() > 0.5  // 테스트용 임시 데이터
        }));
        setSubmissions(mockSubmissions);

        setLoading(false);
      } catch (error) {
        console.error('데이터 조회 실패:', error);
        setError('데이터를 불러오는데 실패했습니다.');
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, assignmentId, user]);

  // 정렬 토글 함수
  const toggleSort = (field) => {
    setSort(prev => ({
      field: field,
      order: prev.field === field ? (prev.order === 'asc' ? 'desc' : 'asc') : 'asc'
    }));
  };

  // 필터링 및 정렬 함수
  const getFilteredAndSortedSubmissions = () => {
    const filtered = submissions.filter(submission => {
      const searchLower = searchQuery.toLowerCase();
      return (
        submission.userEmail?.toLowerCase().includes(searchLower) ||
        submission.name?.toLowerCase().includes(searchLower) ||
        String(submission.studentNum || '').toLowerCase().includes(searchLower)
      );
    });

    return filtered.sort((a, b) => {
      let aValue, bValue;
      switch(sort.field) {
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'email':
          aValue = a.userEmail || '';
          bValue = b.userEmail || '';
          break;
        case 'studentNum':
          aValue = String(a.studentNum || '');
          bValue = String(b.studentNum || '');
          break;
        case 'lastSubmission':
          aValue = a.lastSubmissionTime || '';
          bValue = b.lastSubmissionTime || '';
          break;
        case 'submissionCount':
          aValue = a.submissionCount || 0;
          bValue = b.submissionCount || 0;
          break;
        case 'avgChanges':
          aValue = a.avgChangesPerMin || 0;
          bValue = b.avgChangesPerMin || 0;
          break;
        default:
          aValue = '';
          bValue = '';
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sort.order === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return sort.order === 'asc' 
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
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
          <Typography color="error" align="center">
            {error}
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Fade in={true} timeout={300}>
      <Container maxWidth={false} sx={{ mt: 2, px: 2 }}>
        <Paper elevation={0} sx={{ 
          p: 3,
          backgroundColor: (theme) => 
            theme.palette.mode === 'dark' ? '#282A36' : '#FFFFFF',
          border: (theme) =>
            `1px solid ${theme.palette.mode === 'dark' ? '#44475A' : '#E0E0E0'}`,
          borderRadius: '16px'
        }}>
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

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ 
              fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
              mb: 2
            }}>
              {assignment?.assignmentName}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Chip 
                label={`시작: ${new Date(assignment?.kickoffDate).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}`}
                sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
              />
              <Chip 
                label={`마감: ${new Date(assignment?.deadlineDate).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}`}
                sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
              />
              <RemainingTime deadline={assignment?.deadlineDate} />
            </Box>
            <Typography sx={{ 
              whiteSpace: 'pre-line',
              fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
            }}>
              {assignment?.assignmentDescription}
            </Typography>
          </Box>

          <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                sx={{
                  '& .MuiTab-root': {
                    fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                    textTransform: 'none',
                    minHeight: '48px'
                  }
                }}
              >
                <Tab 
                  icon={<BarChartIcon />} 
                  iconPosition="start" 
                  label="통계" 
                />
                <Tab 
                  icon={<PeopleIcon />} 
                  iconPosition="start" 
                  label={`학생 (${getFilteredAndSortedSubmissions().length})`} 
                />
              </Tabs>
            </Box>
            
            <TabPanel value={tabValue} index={0}>
              <Typography>대시보드 내용이 여기에 들어갑니다.</Typography>
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="이메일, 이름, 학번으로 검색"
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
                      <TableCell sx={{ width: '50px', fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif", fontWeight: 'bold' }}>
                        No.
                      </TableCell>
                      <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif", fontWeight: 'bold' }}>
                        학번
                        <IconButton size="small" onClick={() => toggleSort('studentNum')} sx={{ ml: 1 }}>
                          <Box sx={{ 
                            transform: sort.field !== 'studentNum' ? 'rotate(0deg)' : (sort.order === 'asc' ? 'rotate(180deg)' : 'rotate(0deg)'),
                            transition: 'transform 0.2s ease-in-out',
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            <KeyboardArrowDownIcon fontSize="small" />
                          </Box>
                        </IconButton>
                      </TableCell>
                      <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif", fontWeight: 'bold' }}>
                        이름
                        <IconButton size="small" onClick={() => toggleSort('name')} sx={{ ml: 1 }}>
                          <Box sx={{ 
                            transform: sort.field !== 'name' ? 'rotate(0deg)' : (sort.order === 'asc' ? 'rotate(180deg)' : 'rotate(0deg)'),
                            transition: 'transform 0.2s ease-in-out',
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            <KeyboardArrowDownIcon fontSize="small" />
                          </Box>
                        </IconButton>
                      </TableCell>
                      <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif", fontWeight: 'bold' }}>
                        이메일
                        <IconButton size="small" onClick={() => toggleSort('email')} sx={{ ml: 1 }}>
                          <Box sx={{ 
                            transform: sort.field !== 'email' ? 'rotate(0deg)' : (sort.order === 'asc' ? 'rotate(180deg)' : 'rotate(0deg)'),
                            transition: 'transform 0.2s ease-in-out',
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            <KeyboardArrowDownIcon fontSize="small" />
                          </Box>
                        </IconButton>
                      </TableCell>
                      <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif", fontWeight: 'bold' }}>
                        최근 수정일
                        <IconButton size="small" onClick={() => toggleSort('lastSubmission')} sx={{ ml: 1 }}>
                          <Box sx={{ 
                            transform: sort.field !== 'lastSubmission' ? 'rotate(0deg)' : (sort.order === 'asc' ? 'rotate(180deg)' : 'rotate(0deg)'),
                            transition: 'transform 0.2s ease-in-out',
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            <KeyboardArrowDownIcon fontSize="small" />
                          </Box>
                        </IconButton>
                      </TableCell>
                      <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif", fontWeight: 'bold' }}>
                        평균 코드 변화량
                        <IconButton size="small" onClick={() => toggleSort('avgChanges')} sx={{ ml: 1 }}>
                          <Box sx={{ 
                            transform: sort.field !== 'avgChanges' ? 'rotate(0deg)' : (sort.order === 'asc' ? 'rotate(180deg)' : 'rotate(0deg)'),
                            transition: 'transform 0.2s ease-in-out',
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            <KeyboardArrowDownIcon fontSize="small" />
                          </Box>
                        </IconButton>
                      </TableCell>
                      <TableCell align="right" sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif", fontWeight: 'bold' }}>
                        작업
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getFilteredAndSortedSubmissions().map((submission, index) => (
                      <TableRow key={submission.userId}>
                        <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                          {index + 1}
                        </TableCell>
                        <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                          {submission.studentNum}
                        </TableCell>
                        <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                          {submission.name}
                        </TableCell>
                        <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                          {submission.userEmail}
                        </TableCell>
                        <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                          {submission.lastSubmissionTime ? 
                            new Date(submission.lastSubmissionTime).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : '-'
                          }
                        </TableCell>
                        <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                          {submission.avgChangesPerMin ? `${submission.avgChangesPerMin.toFixed(2)}/분` : '-'}
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<CodeIcon sx={{ fontSize: '1rem' }} />}
                              onClick={async () => {
                                try {
                                  const response = await api.get(`/api/redirect/redirect`, {
                                    params: {
                                      userId: submission.userId,
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
                                fontSize: '0.75rem',
                                py: 0.5,
                                px: 1.5,
                                minHeight: '28px',
                                borderRadius: '14px',
                                textTransform: 'none'
                              }}
                            >
                              JCode
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<MonitorIcon sx={{ fontSize: '1rem' }} />}
                              onClick={() => navigate(`/watcher/class/${courseId}/assignment/${assignmentId}/monitoring/${submission.userId}`)}
                              sx={{ 
                                fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                                fontSize: '0.75rem',
                                py: 0.5,
                                px: 1.5,
                                minHeight: '28px',
                                borderRadius: '14px',
                                textTransform: 'none'
                              }}
                            >
                              Watcher
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>
          </Box>
        </Paper>
      </Container>
    </Fade>
  );
};

export default AssignmentDetail; 