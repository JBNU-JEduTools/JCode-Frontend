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
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
} from '@mui/material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axios';
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
import AssignmentIcon from '@mui/icons-material/Assignment';
import BarChartIcon from '@mui/icons-material/BarChart';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
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
import RemainingTime from './RemainingTime';
import WatcherBreadcrumbs from '../common/WatcherBreadcrumbs';
import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

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
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        backgroundColor: (theme) => 
          theme.palette.mode === 'dark' ? '#282A36' : '#FFFFFF',
        border: (theme) =>
          `1px solid ${theme.palette.mode === 'dark' ? '#44475A' : '#E0E0E0'}`,
        boxShadow: 'none',
        borderRadius: '12px',
        '&:hover': {
          borderColor: (theme) =>
            theme.palette.mode === 'dark' ? '#6272A4' : '#BDBDBD',
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? '#44475A' : '#FAFAFA',
          transform: 'translateY(-2px)'
        }
      }}
    >
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
  const [sort, setSort] = useState({
    field: 'email',
    order: 'asc'
  });
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [openAssignmentDialog, setOpenAssignmentDialog] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    assignmentName: '',
    assignmentDescription: '',
    kickoffDate: '',
    deadlineDate: ''
  });
  const [currentTab, setCurrentTab] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') || 'statistics';
  });
  const { user } = useAuth();
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deletingAssignment, setDeletingAssignment] = useState(null);

  // 탭 변경 핸들러
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    // URL 업데이트
    const params = new URLSearchParams(location.search);
    params.set('tab', newValue);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.role === 'ADMIN') {
          // 관리자는 직접 강의 정보를 조회
          const coursesResponse = await api.get(`/api/courses/${courseId}/admin/details`);
          setCourse(coursesResponse.data);
          setAssignments(coursesResponse.data.assignments || []);
        } else {
          // 교수는 자신의 강의 목록에서 조회
          const coursesResponse = await api.get('/api/users/me/courses/details');
          const foundCourse = coursesResponse.data.find(c => c.courseId === parseInt(courseId));
          if (!foundCourse) {
            throw new Error('강의를 찾을 수 없습니다.');
          }
          setCourse(foundCourse);
          setAssignments(foundCourse.assignments || []);
        }

        const studentsResponse = await api.get(`/api/courses/${courseId}/users`);

        setStudents(studentsResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('데이터 조회 실패:', error);
        setError('데이터를 불러오는데 실패했습니다.');
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, user]);

  const getFilteredAndSortedStudents = () => {
    const filtered = students.filter(student => {
      const searchLower = searchQuery.toLowerCase();
      const emailMatch = student.email?.toLowerCase().includes(searchLower);
      const nameMatch = student.name?.toLowerCase().includes(searchLower);
      const studentNumMatch = String(student.studentNum || '').toLowerCase().includes(searchLower);
      return emailMatch || nameMatch || studentNumMatch;
    });

    return filtered.sort((a, b) => {
      let aValue, bValue;
      switch(sort.field) {
        case 'email':
          aValue = a.email || '';
          bValue = b.email || '';
          break;
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'studentNum':
          aValue = String(a.studentNum || '');
          bValue = String(b.studentNum || '');
          break;
        default:
          aValue = '';
          bValue = '';
      }
      
      return sort.order === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
  };

  const toggleSort = (field) => {
    setSort(prev => ({
      field: field,
      order: prev.field === field ? (prev.order === 'asc' ? 'desc' : 'asc') : 'asc'
    }));
  };

  const handleAddAssignment = async () => {
    try {
      await api.post(`/api/courses/${course.courseId}/assignments`, {
        ...newAssignment,
        kickoffDate: new Date(newAssignment.kickoffDate).toISOString(),
        deadlineDate: new Date(newAssignment.deadlineDate).toISOString()
      });

      // 과제 목록 새로고침
      const assignmentsResponse = await api.get(`/api/courses/${course.courseId}/assignments`);
      setAssignments(assignmentsResponse.data);

      setOpenAssignmentDialog(false);
      setNewAssignment({
        assignmentName: '',
        assignmentDescription: '',
        kickoffDate: '',
        deadlineDate: ''
      });
    } catch (error) {
      console.error('과제 추가 실패:', error);
      // TODO: 에러 처리
    }
  };

  const handleEditAssignment = async () => {
    try {
      await api.put(`/api/courses/${courseId}/assignments/${editingAssignment.assignmentId}`, {
        assignmentName: editingAssignment.assignmentName,
        assignmentDescription: editingAssignment.assignmentDescription,
        kickoffDate: new Date(editingAssignment.kickoffDate).toISOString(),
        deadlineDate: new Date(editingAssignment.deadlineDate).toISOString()
      });

      // 과제 목록 새로고침
      const assignmentsResponse = await api.get(`/api/courses/${courseId}/assignments`);
      setAssignments(assignmentsResponse.data);

      setOpenEditDialog(false);
      setEditingAssignment(null);
      
      // 성공 토스트
      toast.success('과제가 성공적으로 수정되었습니다.');
    } catch (error) {
      console.error('과제 수정 실패:', error);
      // 실패 토스트
      toast.error('과제 수정에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleDeleteAssignment = async () => {
    try {
      await api.delete(`/api/courses/${courseId}/assignments/${deletingAssignment.assignmentId}`);
      
      // 과제 목록 새로고침
      const assignmentsResponse = await api.get(`/api/courses/${courseId}/assignments`);
      setAssignments(assignmentsResponse.data);

      setOpenDeleteDialog(false);
      setDeletingAssignment(null);
      
      toast.success('과제가 성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error('과제 삭제 실패:', error);
      toast.error('과제 삭제에 실패했습니다. 다시 시도해주세요.');
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
          elevation={0}
          sx={{ 
            p: 3,
            backgroundColor: (theme) => 
              theme.palette.mode === 'dark' ? '#282A36' : '#FFFFFF',
            border: (theme) =>
              `1px solid ${theme.palette.mode === 'dark' ? '#44475A' : '#E0E0E0'}`,
            borderRadius: '16px'
          }}
        >
          <WatcherBreadcrumbs 
            paths={[
              { 
                text: course?.courseName || '로딩중...', 
                to: `/watcher/class/${courseId}` 
              }
            ]} 
          />
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'flex-start',
            gap: 2,
            mb: 4 
          }}>
            {/* 강의 정보 */}
            <Box sx={{ 
              display: 'flex', 
              gap: 2,
              alignItems: 'center',
              color: 'text.secondary',
              fontSize: '0.875rem',
              fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
            }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                  color: 'text.primary'
                }}
              >
                {course?.courseName}
              </Typography>
              <Box 
                component="span" 
                sx={{ 
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  backgroundColor: (theme) => 
                    theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                }}
              >
                {course?.courseCode}
              </Box>
              <Box 
                component="span"
                sx={{ 
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  backgroundColor: (theme) => theme.palette.action.hover
                }}
              >
                {course?.courseClss}분반
              </Box>
              <Box 
                component="span"
                sx={{ 
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  backgroundColor: (theme) => theme.palette.action.hover
                }}
              >
                {course?.courseProfessor} 교수님
              </Box>
            </Box>
          </Box>

          <Tabs 
            value={currentTab} 
            onChange={handleTabChange}
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              mb: 3,
              minHeight: '40px',
              '& .MuiTab-root': {
                minHeight: '40px',
                padding: '6px 16px',
                fontSize: '0.875rem'
              }
            }}
          >
            <Tab 
              icon={<BarChartIcon sx={{ fontSize: '1.2rem', mr: 1 }} />} 
              label="통계" 
              value="statistics"
              iconPosition="start"
              sx={{ 
                fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                textTransform: 'none',
                minHeight: '40px',
                alignItems: 'center'
              }}
            />
            <Tab 
              icon={<GroupIcon sx={{ fontSize: '1.2rem', mr: 1 }} />} 
              label="학생" 
              value="students"
              iconPosition="start"
              sx={{ 
                fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                textTransform: 'none',
                minHeight: '40px',
                alignItems: 'center'
              }}
            />
            <Tab 
              icon={<AssignmentIcon sx={{ fontSize: '1.2rem', mr: 1 }} />} 
              label="과제" 
              value="assignments"
              iconPosition="start"
              sx={{ 
                fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                textTransform: 'none',
                minHeight: '40px',
                alignItems: 'center'
              }}
            />
          </Tabs>

          {/* 학생 목록 탭 */}
          {currentTab === 'students' && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <TextField
                  size="small"
                  placeholder="검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                  }}
                />
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
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
                      <TableCell align="right" sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif", fontWeight: 'bold' }}>
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
                          {student.studentNum}
                        </TableCell>
                        <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                          {student.name}
                        </TableCell>
                        <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                          {student.email}
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
                              onClick={() => navigate(`/watcher/monitoring/${student.userId}`)}
                              sx={{ 
                                fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                                fontSize: '0.75rem',
                                py: 0.5,
                                px: 1.5,
                                minHeight: '28px',
                                borderRadius: '14px',
                                textTransform: 'none',
                                '&:hover': {
                                  backgroundColor: (theme) => 
                                    theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.08)' : 'rgba(33, 150, 243, 0.08)'
                                }
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
            </Box>
          )}

          {/* 과제 관리 탭 */}
          {currentTab === 'assignments' && (
            <Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif", fontWeight: 'bold' }}>
                        과제명
                      </TableCell>
                      <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif", fontWeight: 'bold' }}>
                        설명
                      </TableCell>
                      <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif", fontWeight: 'bold' }}>
                        시작일
                      </TableCell>
                      <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif", fontWeight: 'bold' }}>
                        마감일
                      </TableCell>
                      <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif", fontWeight: 'bold', width: '250px' }}>
                        남은 시간
                      </TableCell>
                      <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif", fontWeight: 'bold', width: '100px' }}>
                        작업
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assignments.map((assignment) => (
                      <TableRow 
                        key={assignment.assignmentId}
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: (theme) => 
                              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                          },
                          transition: 'background-color 0.2s ease'
                        }}
                      >
                        <TableCell 
                          onClick={() => navigate(`/watcher/class/${courseId}/assignment/${assignment.assignmentId}`)}
                          sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
                        >
                          {assignment.assignmentName}
                        </TableCell>
                        <TableCell 
                          onClick={() => navigate(`/watcher/class/${courseId}/assignment/${assignment.assignmentId}`)}
                          sx={{ 
                            fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                            maxWidth: '300px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {assignment.assignmentDescription}
                        </TableCell>
                        <TableCell 
                          onClick={() => navigate(`/watcher/class/${courseId}/assignment/${assignment.assignmentId}`)}
                          sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
                        >
                          {new Date(assignment.kickoffDate).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </TableCell>
                        <TableCell 
                          onClick={() => navigate(`/watcher/class/${courseId}/assignment/${assignment.assignmentId}`)}
                          sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
                        >
                          {new Date(assignment.deadlineDate).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </TableCell>
                        <TableCell 
                          onClick={() => navigate(`/watcher/class/${courseId}/assignment/${assignment.assignmentId}`)}
                          sx={{ 
                            width: '250px',
                            textAlign: 'left'
                          }}
                        >
                          <RemainingTime deadline={assignment.deadlineDate} />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingAssignment({
                                  ...assignment,
                                  kickoffDate: new Date(assignment.kickoffDate).toISOString().slice(0, 16),
                                  deadlineDate: new Date(assignment.deadlineDate).toISOString().slice(0, 16)
                                });
                                setOpenEditDialog(true);
                              }}
                              size="small"
                              sx={{ 
                                color: 'primary.main',
                                '&:hover': {
                                  backgroundColor: (theme) => 
                                    theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.08)' : 'rgba(33, 150, 243, 0.08)'
                              }
                            }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingAssignment(assignment);
                                setOpenDeleteDialog(true);
                              }}
                              size="small"
                              sx={{ 
                                color: 'error.main',
                                '&:hover': {
                                  backgroundColor: (theme) => 
                                    theme.palette.mode === 'dark' ? 'rgba(244, 67, 54, 0.08)' : 'rgba(244, 67, 54, 0.08)'
                              }
                            }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow
                      onClick={() => setOpenAssignmentDialog(true)}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: (theme) => 
                            theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                        },
                        transition: 'all 0.2s ease',
                        height: '60px'
                      }}
                    >
                      <TableCell 
                        colSpan={6}
                        align="center"
                        sx={{ 
                          border: (theme) => `2px dashed ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
                          borderRadius: 1,
                          m: 1,
                        }}
                      >
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            gap: 1,
                            color: 'text.secondary'
                          }}
                        >
                          <AddIcon />
                          <Typography sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                            새 과제 추가
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* 통계 탭 */}
          {currentTab === 'statistics' && (
            <Box>
              <Typography>통계 데이터가 준비중입니다.</Typography>
            </Box>
          )}

          <Dialog 
            open={openAssignmentDialog} 
            onClose={() => setOpenAssignmentDialog(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                minHeight: '500px'
              }
            }}
          >
            <DialogTitle 
              sx={{ 
                fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                fontSize: '1.5rem',
                py: 3
              }}
            >
              새 과제 추가
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="과제명"
                    value={newAssignment.assignmentName}
                    onChange={(e) => setNewAssignment({ 
                      ...newAssignment, 
                      assignmentName: e.target.value 
                    })}
                    placeholder="ex) 1주차 과제: Hello World"
                    sx={{ 
                      '& .MuiInputBase-root': {
                        height: '56px'
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="과제 설명"
                    value={newAssignment.assignmentDescription}
                    onChange={(e) => setNewAssignment({ 
                      ...newAssignment, 
                      assignmentDescription: e.target.value 
                    })}
                    multiline
                    rows={6}
                    placeholder="과제에 대한 설명을 입력하세요"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="시작 일시"
                    type="datetime-local"
                    value={newAssignment.kickoffDate}
                    onChange={(e) => setNewAssignment({ 
                      ...newAssignment, 
                      kickoffDate: e.target.value 
                    })}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      step: 60,
                      style: {
                        height: '24px',
                        padding: '12px'
                      }
                    }}
                    sx={{ 
                      '& .MuiInputBase-root': {
                        height: '56px'
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="마감 일시"
                    type="datetime-local"
                    value={newAssignment.deadlineDate}
                    onChange={(e) => setNewAssignment({ 
                      ...newAssignment, 
                      deadlineDate: e.target.value 
                    })}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      step: 60,
                      style: {
                        height: '24px',
                        padding: '12px'
                      }
                    }}
                    sx={{ 
                      '& .MuiInputBase-root': {
                        height: '56px'
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button 
                onClick={() => setOpenAssignmentDialog(false)}
                variant="outlined"
                size="small"
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
                취소
              </Button>
              <Button 
                onClick={handleAddAssignment} 
                variant="contained"
                size="small"
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
                추가
              </Button>
            </DialogActions>
          </Dialog>

          {/* 과제 수정 다이얼로그 */}
          <Dialog 
            open={openEditDialog} 
            onClose={() => {
              setOpenEditDialog(false);
              setEditingAssignment(null);
            }}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                minHeight: '500px'
              }
            }}
          >
            <DialogTitle 
              sx={{ 
                fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                fontSize: '1.5rem',
                py: 3
              }}
            >
              과제 수정
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="과제명"
                    value={editingAssignment?.assignmentName || ''}
                    onChange={(e) => setEditingAssignment({ 
                      ...editingAssignment, 
                      assignmentName: e.target.value 
                    })}
                    placeholder="ex) 1주차 과제: Hello World"
                    sx={{ 
                      '& .MuiInputBase-root': {
                        height: '56px'
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="과제 설명"
                    value={editingAssignment?.assignmentDescription || ''}
                    onChange={(e) => setEditingAssignment({ 
                      ...editingAssignment, 
                      assignmentDescription: e.target.value 
                    })}
                    multiline
                    rows={6}
                    placeholder="과제에 대한 설명을 입력하세요"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="시작 일시"
                    type="datetime-local"
                    value={editingAssignment?.kickoffDate || ''}
                    onChange={(e) => setEditingAssignment({ 
                      ...editingAssignment, 
                      kickoffDate: e.target.value 
                    })}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      step: 60,
                      style: {
                        height: '24px',
                        padding: '12px'
                      }
                    }}
                    sx={{ 
                      '& .MuiInputBase-root': {
                        height: '56px'
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="마감 일시"
                    type="datetime-local"
                    value={editingAssignment?.deadlineDate || ''}
                    onChange={(e) => setEditingAssignment({ 
                      ...editingAssignment, 
                      deadlineDate: e.target.value 
                    })}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      step: 60,
                      style: {
                        height: '24px',
                        padding: '12px'
                      }
                    }}
                    sx={{ 
                      '& .MuiInputBase-root': {
                        height: '56px'
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button 
                onClick={() => {
                  setOpenEditDialog(false);
                  setEditingAssignment(null);
                }}
                variant="outlined"
                size="small"
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
                취소
              </Button>
              <Button 
                onClick={handleEditAssignment} 
                variant="contained"
                size="small"
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
                수정
              </Button>
            </DialogActions>
          </Dialog>

          {/* 과제 삭제 확인 다이얼로그 */}
          <Dialog
            open={openDeleteDialog}
            onClose={() => {
              setOpenDeleteDialog(false);
              setDeletingAssignment(null);
            }}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle sx={{ 
              fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
              fontSize: '1.25rem',
              py: 3
            }}>
              과제 삭제 확인
            </DialogTitle>
            <DialogContent>
              <Typography sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                정말로 "{deletingAssignment?.assignmentName}" 과제를 삭제하시겠습니까?
                <br />
                이 작업은 되돌릴 수 없습니다.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button
                onClick={() => {
                  setOpenDeleteDialog(false);
                  setDeletingAssignment(null);
                }}
                variant="outlined"
                size="small"
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
                취소
              </Button>
              <Button
                onClick={handleDeleteAssignment}
                variant="contained"
                color="error"
                size="small"
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
                삭제
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
      </Container>
    </Fade>
  );
};

export default ClassDetail; 