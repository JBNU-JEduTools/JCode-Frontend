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
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Slider
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
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { ko } from 'date-fns/locale';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  zoom
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { format } from 'date-fns';
import zoomPlugin from 'chartjs-plugin-zoom';
import crosshairPlugin from 'chartjs-plugin-crosshair';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin,
  crosshairPlugin
);

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
        <Fade in={value === index} timeout={300}>
          <Box sx={{ p: 3 }}>
            {children}
          </Box>
        </Fade>
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
  const [timeUnit, setTimeUnit] = useState('perMinute');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [currentRange, setCurrentRange] = useState([0, 100]);
  const [rangeStartDate, setRangeStartDate] = useState(null);
  const [rangeEndDate, setRangeEndDate] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // 목업 데이터 생성 함수
  const generateMockData = (count) => {
    const firstNames = [
      '민준', '서준', '도윤', '예준', '시우', '하준', '지호', '주원', '지후', '준우',
      '서연', '서윤', '지우', '서현', '하은', '하윤', '민서', '지유', '윤서', '지민',
      '현우', '지훈', '건우', '우진', '선우', '서진', '민재', '현준', '연우', '유준',
      '정우', '승우', '승현', '시윤', '준서', '유찬', '윤우', '준혁', '지환', '승민',
      '수아', '지아', '소율', '지윤', '채원', '수빈', '다은', '예은', '수민', '예린',
      '주현', '동현', '태현', '민성', '준영', '승준', '현서', '민규', '한결', '성민',
      '예진', '지은', '혜원', '유진', '민지', '서영', '윤아', '유나', '은서', '예원',
      '시현', '도현', '승원', '정민', '태민', '민찬', '윤호', '지성', '준호', '승호',
      '채은', '나은', '서희', '윤지', '은지', '수연', '예서', '가은', '서율', '아린',
      '준수', '현민', '건호', '성준', '지원', '재민', '윤재', '정현', '시원', '재현'
    ];
    
    const lastNames = [
      '김', '이', '박', '최', '정', '강', '조', '윤', '장', '임',
      '한', '오', '서', '신', '권', '황', '안', '송', '류', '전',
      '홍', '고', '문', '양', '손', '배', '조', '백', '허', '유',
      '남', '심', '노', '정', '하', '곽', '성', '차', '주', '우',
      '구', '신', '임', '나', '전', '민', '유', '진', '지', '엄'
    ];

    return Array.from({ length: count }, (_, i) => {
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const name = lastName + firstName;

      const pattern = Math.random(); // 학생별 패턴 결정
      let baseChanges;
      
      if (pattern < 0.1) { // 매우 활발한 활동 (10%)
        baseChanges = 800 + Math.random() * 400;  // 800-1200 bytes
      } else if (pattern < 0.3) { // 활발한 활동 (20%)
        baseChanges = 500 + Math.random() * 300;  // 500-800 bytes
      } else if (pattern < 0.7) { // 보통 활동 (40%)
        baseChanges = 200 + Math.random() * 300;  // 200-500 bytes
      } else if (pattern < 0.9) { // 저조한 활동 (20%)
        baseChanges = 50 + Math.random() * 150;   // 50-200 bytes
      } else { // 매우 저조한 활동 (10%)
        baseChanges = Math.random() * 50;         // 0-50 bytes
      }

      // 학생별 활동 시작 시간 랜덤화 (과제 시작 후 0~48시간 사이)
      const startDelay = Math.floor(Math.random() * 48);
      
      // 학생별 활동 패턴 생성
      const activityPattern = Math.random();
      let activityTiming;
      
      if (activityPattern < 0.3) { // 초반 집중형 (30%)
        activityTiming = (hour) => Math.max(0, 1 - (hour / 72) * 1.5);
      } else if (activityPattern < 0.6) { // 중반 집중형 (30%)
        activityTiming = (hour) => Math.max(0, 1 - Math.abs(hour - 36) / 36);
      } else { // 후반 집중형 (40%)
        activityTiming = (hour) => Math.max(0, (hour / 72) * 1.5);
      }

      // 과제 기간 동안의 활동 데이터 생성
      const activityData = [];
      const now = new Date();
      const totalHours = Math.ceil((now - startDate) / (1000 * 60 * 60));
      
      for (let hour = startDelay; hour < totalHours; hour++) {
        const timeOfDay = hour % 24; // 0-23
        let multiplier = 1;

        // 시간대별 활동량 조절
        if (timeOfDay >= 1 && timeOfDay <= 6) { // 새벽 (1-6시)
          multiplier = 0.2;
        } else if (timeOfDay >= 7 && timeOfDay <= 9) { // 아침 (7-9시)
          multiplier = 0.8;
        } else if (timeOfDay >= 10 && timeOfDay <= 18) { // 낮/오후 (10-18시)
          multiplier = 1.2;
        } else if (timeOfDay >= 19 && timeOfDay <= 23) { // 저녁 (19-23시)
          multiplier = 1.5;
        } else { // 자정
          multiplier = 0.5;
        }

        // 요일별 가중치 추가
        const dayOfWeek = new Date(startDate.getTime() + hour * 3600000).getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) { // 주말
          multiplier *= 1.5;
        }

        // 활동 시점에 따른 가중치
        multiplier *= activityTiming(hour);

        // 무작위 변동 추가 (±20%)
        multiplier *= (0.8 + Math.random() * 0.4);

        // 간헐적인 큰 변화 추가 (5% 확률로 2~5배 증가)
        if (Math.random() < 0.05) {
          multiplier *= (2 + Math.random() * 3);
        }

        activityData.push({
          timestamp: new Date(startDate.getTime() + hour * 3600000),
          changes: Math.round(baseChanges * multiplier)
        });
      }

      // 제출 횟수는 활동량과 시간에 비례하도록
      const totalChanges = activityData.reduce((sum, data) => sum + data.changes, 0);
      const submissionCount = Math.max(1, Math.floor((totalChanges / 10000) * (activityData.length / 24) + Math.random() * 3));

      // 학번 생성 (2020~2024학번)
      const admissionYear = 2020 + Math.floor(Math.random() * 5);
      const studentNumber = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
      const studentNum = `${admissionYear}${studentNumber}`;

      return {
        userId: i + 1,
        userEmail: `${studentNum}@university.ac.kr`,
        name,
        studentNum,
        status: totalChanges > 5000 ? '완료' : '진행중',
        activityData,
        submissionCount,
        totalChanges,
        avgChangesPerMin: Math.round(totalChanges / (activityData.length * 60)),
        isCorrect: totalChanges > 5000 ? Math.random() > 0.3 : Math.random() > 0.7
      };
    });
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
        setLoading(false);
      } catch (error) {
        console.error('데이터 조회 실패:', error);
        setError('데이터를 불러오는데 실패했습니다.');
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, assignmentId, user]);

  useEffect(() => {
    if (assignment) {
      const kickoff = new Date(assignment.kickoffDate);
      const deadline = new Date(assignment.deadlineDate);
      setStartDate(kickoff);
      setEndDate(deadline);
      setRangeStartDate(kickoff);
      setRangeEndDate(deadline);
      setCurrentRange([0, 100]);
    }
  }, [assignment]);

  useEffect(() => {
    if (startDate && endDate) {
      // startDate와 endDate가 설정된 후에 목업 데이터 생성
      const mockSubmissions = generateMockData(150);
      setSubmissions(mockSubmissions);
    }
  }, [startDate, endDate]);

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

  // 슬라이더 값이 변경될 때 호출되는 함수
  const handleRangeChange = (event, newValue) => {
    setCurrentRange(newValue);
    if (startDate && endDate) {
      const totalMillis = endDate.getTime() - startDate.getTime();
      const startMillis = totalMillis * (newValue[0] / 100);
      const endMillis = totalMillis * (newValue[1] / 100);
      setRangeStartDate(new Date(startDate.getTime() + startMillis));
      setRangeEndDate(new Date(startDate.getTime() + endMillis));
    }
  };

  // 현재 선택된 날짜/시간 문자열 반환
  const getRangeDateTimeString = (date) => {
    if (!date) return '';
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // 차트 데이터 변환 함수 수정
  const getChartData = () => {
    const chartData = {
      labels: submissions.map(submission => `${submission.name}\n(${submission.studentNum})`),
      datasets: [
        {
          type: 'bar',
          label: '코드 변화량',
          data: submissions.map(submission => {
            // 선택된 시간 범위 내의 활동 데이터 필터링
            const periodActivities = submission.activityData.filter(activity => 
              activity.timestamp >= rangeStartDate && activity.timestamp <= rangeEndDate
            );

            if (periodActivities.length === 0) return 0;

            // 시작 시점과 끝 시점의 변화량 차이 계산
            const startActivity = periodActivities[0];
            const endActivity = periodActivities[periodActivities.length - 1];
            
            // 끝 시점의 누적 변화량 - 시작 시점의 누적 변화량
            return endActivity.changes - startActivity.changes;
          }),
          backgroundColor: submissions.map(submission => 
            submission.status === '완료' ? 'rgba(76, 175, 80, 0.7)' : 'rgba(136, 132, 216, 0.7)'
          ),
          borderColor: submissions.map(submission => 
            submission.status === '완료' ? 'rgb(76, 175, 80)' : 'rgb(136, 132, 216)'
          ),
          borderWidth: 1
        }
      ]
    };

    return chartData;
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        position: 'nearest',
        animation: false,
        callbacks: {
          label: (context) => {
            const submission = submissions[context.dataIndex];
            if (submission) {
              const bytes = Math.round(context.raw);
              return [
                `${context.dataset.label}: ${bytes}B`,
                `제출 횟수: ${submission.submissionCount}회`,
                `상태: ${submission.status}`
              ];
            }
            return context.dataset.label;
          }
        }
      },
      crosshair: {
        line: {
          color: '#6272A4',
          width: 1,
          dashPattern: [5, 5]
        },
        sync: {
          enabled: true,
          group: 1,
        },
        zoom: {
          enabled: false
        }
      },
      zoom: {
        limits: {
          x: { min: 'original', max: 'original' },
          y: { min: 'original', max: 'original' }
        },
        pan: {
          enabled: true,
          mode: 'xy'
        },
        zoom: {
          wheel: {
            enabled: true,
            mode: 'xy'
          },
          pinch: {
            enabled: true
          },
          mode: 'xy',
          drag: {
            enabled: false
          },
          overScaleMode: 'xy'
        }
      }
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 90,
          minRotation: 90,
          font: {
            size: 7
          },
          padding: 0,
          autoSkip: false
        },
        grid: {
          display: false
        }
      },
      y: {
        title: {
          display: true,
          text: '코드 변화량 (Bytes)'
        },
        min: 0,
        max: (context) => {
          if (!context?.chart?.data?.datasets?.[0]?.data) return 100;
          const maxValue = Math.max(...context.chart.data.datasets[0].data);
          return Math.ceil(maxValue * 1.2); // 최대값보다 20% 더 큰 범위 설정
        },
        ticks: {
          callback: (value) => {
            return `${Math.round(value)}B`;
          }
        }
      }
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
              <Box sx={{ p: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Card sx={{ p: 2 }}>
                      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <Typography variant="h6" sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                          학생별 코드 변화량
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              const sorted = [...submissions].sort((a, b) => a.name.localeCompare(b.name));
                              setSubmissions(sorted);
                            }}
                            sx={{ 
                              fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                              textTransform: 'none'
                            }}
                          >
                            이름순
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              const sorted = [...submissions].sort((a, b) => {
                                const aTotal = a.activityData.reduce((sum, data) => sum + data.changes, 0);
                                const bTotal = b.activityData.reduce((sum, data) => sum + data.changes, 0);
                                return bTotal - aTotal;
                              });
                              setSubmissions(sorted);
                            }}
                            sx={{ 
                              fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                              textTransform: 'none'
                            }}
                          >
                            변화량순
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              const sorted = [...submissions].sort((a, b) => a.studentNum.localeCompare(b.studentNum));
                              setSubmissions(sorted);
                            }}
                            sx={{ 
                              fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                              textTransform: 'none'
                            }}
                          >
                            학번순
                          </Button>
                          <IconButton
                            onClick={() => setIsFullScreen(true)}
                            sx={{ ml: 'auto' }}
                          >
                            <FullscreenIcon />
                          </IconButton>
                        </Box>
                      </Box>
                      <Box sx={{ height: 600, position: 'relative' }}>
                        <Bar options={chartOptions} data={getChartData()} />
                      </Box>
                      <Box sx={{ px: 3, py: 2, mt: 2 }}>
                        <Stack spacing={2}>
                          <Box>
                            <Typography variant="caption" color="textSecondary" gutterBottom>
                              기간 선택
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="caption" color="textSecondary">
                                {startDate?.toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}
                              </Typography>
                              <Typography variant="caption" color="textSecondary" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                {getRangeDateTimeString(rangeStartDate)} ~ {getRangeDateTimeString(rangeEndDate)}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {endDate?.toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}
                              </Typography>
                            </Box>
                            <Slider
                              value={currentRange}
                              onChange={handleRangeChange}
                              valueLabelDisplay="auto"
                              valueLabelFormat={(value) => {
                                if (!startDate || !endDate) return '';
                                const totalMillis = endDate.getTime() - startDate.getTime();
                                const currentMillis = totalMillis * (value / 100);
                                const currentDate = new Date(startDate.getTime() + currentMillis);
                                return currentDate.toLocaleString('ko-KR', {
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: false
                                });
                              }}
                              marks={[
                                { value: 0, label: '시작' },
                                { value: 50, label: '중간' },
                                { value: 100, label: '마감' }
                              ]}
                              sx={{ 
                                mt: 1,
                                '& .MuiSlider-markLabel': {
                                  fontSize: '0.75rem'
                                }
                              }}
                            />
                          </Box>
                        </Stack>
                      </Box>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
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

        {/* 전체화면 다이얼로그 추가 */}
        <Dialog
          fullScreen
          open={isFullScreen}
          onClose={() => setIsFullScreen(false)}
        >
          <Box sx={{ p: 2, height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                학생별 코드 변화량
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    const sorted = [...submissions].sort((a, b) => a.name.localeCompare(b.name));
                    setSubmissions(sorted);
                  }}
                  sx={{ 
                    fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                    textTransform: 'none'
                  }}
                >
                  이름순
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    const sorted = [...submissions].sort((a, b) => {
                      const aTotal = a.activityData.reduce((sum, data) => sum + data.changes, 0);
                      const bTotal = b.activityData.reduce((sum, data) => sum + data.changes, 0);
                      return bTotal - aTotal;
                    });
                    setSubmissions(sorted);
                  }}
                  sx={{ 
                    fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                    textTransform: 'none'
                  }}
                >
                  변화량순
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    const sorted = [...submissions].sort((a, b) => a.studentNum.localeCompare(b.studentNum));
                    setSubmissions(sorted);
                  }}
                  sx={{ 
                    fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                    textTransform: 'none'
                  }}
                >
                  학번순
                </Button>
                <IconButton
                  onClick={() => setIsFullScreen(false)}
                >
                  <FullscreenExitIcon />
                </IconButton>
              </Box>
            </Box>
            <Box sx={{ flex: 1, position: 'relative' }}>
              <Bar options={{
                ...chartOptions,
                maintainAspectRatio: false
              }} data={getChartData()} />
            </Box>
            <Box sx={{ px: 3, py: 2, mt: 2 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="textSecondary" gutterBottom>
                    기간 선택
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" color="textSecondary">
                      {startDate?.toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                      {getRangeDateTimeString(rangeStartDate)} ~ {getRangeDateTimeString(rangeEndDate)}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {endDate?.toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}
                    </Typography>
                  </Box>
                  <Slider
                    value={currentRange}
                    onChange={handleRangeChange}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => {
                      if (!startDate || !endDate) return '';
                      const totalMillis = endDate.getTime() - startDate.getTime();
                      const currentMillis = totalMillis * (value / 100);
                      const currentDate = new Date(startDate.getTime() + currentMillis);
                      return currentDate.toLocaleString('ko-KR', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      });
                    }}
                    marks={[
                      { value: 0, label: '시작' },
                      { value: 50, label: '중간' },
                      { value: 100, label: '마감' }
                    ]}
                    sx={{ 
                      mt: 1,
                      '& .MuiSlider-markLabel': {
                        fontSize: '0.75rem'
                      }
                    }}
                  />
                </Box>
              </Stack>
            </Box>
          </Box>
        </Dialog>
      </Container>
    </Fade>
  );
};

export default AssignmentDetail; 