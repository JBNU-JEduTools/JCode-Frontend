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
import SortIcon from '@mui/icons-material/Sort';
import NumbersIcon from '@mui/icons-material/Numbers';

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

  // 목업 데이터 생성 함수 수정
  const generateMockData = () => {
    const mockSubmissions = [];
    
    for (let i = 1; i <= 150; i++) {
      const totalChanges = Math.floor(Math.random() * 50000) + 1000; // 1000~51000 바이트 사이의 랜덤 값
      const submissionCount = Math.floor(Math.random() * 30) + 1; // 1~30회 사이의 랜덤 제출 횟수
      const avgChangesPerMin = totalChanges / (Math.floor(Math.random() * 100) + 20); // 랜덤 평균 변화량
      
      // 마지막 제출 시간을 랜덤하게 생성 (과제 시작일과 마감일 사이)
      const lastSubmissionTime = new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString();
      
      mockSubmissions.push({
        userId: i,
        name: `학생${i}`,
        studentNum: `2023${100000 + i}`,
        userEmail: `student${i}@example.com`,
        lastSubmissionTime,
        submissionCount,
        totalChanges,
        avgChangesPerMin,
        activityData: Array(10).fill().map(() => ({
          changes: Math.floor(Math.random() * 1000) - 200 // -200~800 사이의 랜덤 변화량
        }))
      });
    }
    
    return mockSubmissions;
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
        // 실제 API 응답으로 submissions 설정
        // setSubmissions(studentsResponse.data || []);
        
        // 목업 데이터로 대체
        setSubmissions(generateMockData());
        
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
      const kickoff = new Date(assignment.startDateTime || assignment.kickoffDate);
      const deadline = new Date(assignment.endDateTime || assignment.deadlineDate);
      setStartDate(kickoff);
      setEndDate(deadline);
      setRangeStartDate(kickoff);
      setRangeEndDate(deadline);
      setCurrentRange([0, 100]);
    }
  }, [assignment]);

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

  // 슬라이더 값이 변경될 때 호출되는 함수 수정
  const handleRangeChange = (event, newValue) => {
    setCurrentRange(newValue);
    if (startDate && endDate) {
      const totalMillis = endDate.getTime() - startDate.getTime();
      const startMillis = totalMillis * (newValue[0] / 100);
      const endMillis = totalMillis * (newValue[1] / 100);
      setRangeStartDate(new Date(startDate.getTime() + startMillis));
      setRangeEndDate(new Date(startDate.getTime() + endMillis));
      
      // 선택된 기간에 해당하는 학생 데이터만 필터링
      const filteredSubmissions = submissions.map(submission => {
        // 마지막 제출 시간이 선택된 범위 내에 있는지 확인
        const submissionTime = new Date(submission.lastSubmissionTime).getTime();
        const isInRange = submissionTime >= startDate.getTime() + startMillis && 
                          submissionTime <= startDate.getTime() + endMillis;
        
        // 범위 내에 있으면 원래 데이터 반환, 아니면 변화량을 0으로 설정
        return {
          ...submission,
          filteredTotalChanges: isInRange ? submission.totalChanges : 0
        };
      });
      
      // 필터링된 데이터로 차트 업데이트
      // 실제 구현에서는 이 부분을 차트 업데이트 로직으로 연결해야 함
      console.log('기간 필터링된 데이터:', filteredSubmissions);
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

  // 차트 데이터 변환 함수 수정 - 라벨 형식 변경
  const getChartData = () => {
    // 평균 변화량 계산
    const totalChanges = submissions.reduce((sum, submission) => sum + (submission.totalChanges || 0), 0);
    const averageChanges = totalChanges / submissions.length;
    
    console.log(`평균 코드 변화량: ${averageChanges.toFixed(2)} 바이트`);
    
    // 색상 결정 함수 - 평균 이상/이하 두 가지 색상으로 단순화
    const getBarColor = (submission) => {
      // 검색어가 있고 학생 이름이나 학번에 검색어가 포함되어 있으면 하이라이트 색상 사용
      if (searchQuery && 
          (submission.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           submission.studentNum.toLowerCase().includes(searchQuery.toLowerCase()))) {
        return 'rgba(255, 152, 0, 0.8)'; // 검색 결과 하이라이트 색상 (주황색)
      }
      
      return submission.totalChanges >= averageChanges 
        ? 'rgba(66, 165, 245, 0.8)' // 평균 이상은 푸른색
        : 'rgba(179, 157, 219, 0.7)'; // 평균 이하는 연한 보라색
    };
    
    // 테두리 색상 결정 함수
    const getBorderColor = (submission) => {
      // 검색어가 있고 학생 이름이나 학번에 검색어가 포함되어 있으면 하이라이트 테두리 색상 사용
      if (searchQuery && 
          (submission.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           submission.studentNum.toLowerCase().includes(searchQuery.toLowerCase()))) {
        return 'rgba(230, 81, 0, 1)'; // 검색 결과 하이라이트 테두리 색상 (진한 주황색)
      }
      
      return submission.totalChanges >= averageChanges 
        ? 'rgb(30, 136, 229)' // 평균 이상은 진한 푸른색
        : 'rgb(123, 97, 175)'; // 평균 이하는 진한 보라색
    };
    
    // 실제 API 데이터를 사용하도록 수정
    const chartData = {
      // 라벨 형식 변경 - 이름과 학번을 괄호로 구분
      labels: submissions.map(submission => `${submission.name}\n(${submission.studentNum})`),
      datasets: [
        {
          type: 'bar',
          label: '코드 변화량',
          data: submissions.map(submission => submission.totalChanges || 0),
          backgroundColor: submissions.map(submission => 
            getBarColor(submission)
          ),
          borderColor: submissions.map(submission => 
            getBorderColor(submission)
          ),
          borderWidth: 1
        },
        {
          type: 'line',
          label: '평균',
          data: Array(submissions.length).fill(averageChanges),
          borderColor: 'rgba(255, 99, 132, 0.8)',
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false,
          pointRadius: 0
        }
      ]
    };

    return chartData;
  };

  // y축 범위를 계산하는 함수 수정
  const calculateYAxisRange = (chart) => {
    if (!chart || !chart.data || !chart.data.datasets || chart.data.datasets.length === 0) return;
    
    // 현재 보이는 x축 범위 가져오기
    const xMin = chart.scales.x.min || 0;
    const xMax = chart.scales.x.max || chart.data.labels.length - 1;
    
    // 현재 보이는 데이터 범위만 필터링
    const visibleIndices = [];
    for (let i = 0; i < chart.data.labels.length; i++) {
      if (i >= xMin && i <= xMax) {
        visibleIndices.push(i);
      }
    }
    
    // 보이는 범위의 데이터만 추출
    const visibleData = visibleIndices.map(i => chart.data.datasets[0].data[i]);
    
    if (visibleData.length > 0) {
      // 최대값 계산 및 여유 공간 추가 (20%)
      const max = Math.max(...visibleData);
      
      // 500 단위로 올림
      const roundedMax = Math.ceil(max / 500) * 500;
      
      // 최소 y축 값 설정 (너무 작은 값이면 기본값 사용)
      const minYValue = 1000;
      
      // y축 범위 설정
      chart.options.scales.y.max = Math.max(roundedMax * 1.2, minYValue);
      chart.update('none');
    }
  };

  // 차트 옵션 수정 - 애니메이션 추가
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,  // 애니메이션 지속 시간 (밀리초)
      easing: 'easeOutQuart',  // 애니메이션 이징 함수
      delay: (context) => {
        // 각 바마다 약간의 지연 시간을 두어 순차적으로 나타나도록 함
        return context.dataIndex * 10;
      }
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          generateLabels: (chart) => {
            // 기본 범례 생성
            const defaultLabels = ChartJS.defaults.plugins.legend.labels.generateLabels(chart);
            
            // 커스텀 범례 추가 - 평균 이상/이하 두 가지로 단순화
            const customLabels = [
              {
                text: '평균 이상',
                fillStyle: 'rgba(66, 165, 245, 0.8)',
                strokeStyle: 'rgb(30, 136, 229)',
                lineWidth: 1,
                hidden: false,
                index: 1
              },
              {
                text: '평균 이하',
                fillStyle: 'rgba(179, 157, 219, 0.7)',
                strokeStyle: 'rgb(123, 97, 175)',
                lineWidth: 1,
                hidden: false,
                index: 2
              },
              {
                text: '검색 결과',
                fillStyle: 'rgba(255, 152, 0, 0.8)',
                strokeStyle: 'rgba(230, 81, 0, 1)',
                lineWidth: 1,
                hidden: false,
                index: 3
              }
            ];
            
            return [...defaultLabels, ...customLabels];
          },
          // 범례 클릭 시 동작 방지
          onClick: () => {}
        }
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
            if (context.dataset.label === '평균') {
              return `평균: ${formatBytes(context.raw)}`;
            }
            
            const submission = submissions[context.dataIndex];
            if (submission) {
              const bytes = Math.round(context.raw);
              const avgDiff = bytes - (context.chart.data.datasets[1].data[0] || 0);
              return [
                `${context.dataset.label}: ${formatBytes(bytes)}`,
                `평균과의 차이: ${avgDiff > 0 ? '+' : ''}${formatBytes(avgDiff)}`,
                `제출 횟수: ${submission.submissionCount}회`
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
          y: { min: 'original', max: 'original', minRange: 100 }
        },
        pan: {
          enabled: true,
          mode: 'x',  // x축만 패닝 가능
          onPan: ({ chart }) => {
            calculateYAxisRange(chart);
          }
        },
        zoom: {
          wheel: {
            enabled: true,
            mode: 'x'  // x축만 줌 가능
          },
          pinch: {
            enabled: true,
            mode: 'x'  // x축만 줌 가능
          },
          mode: 'x',  // x축만 줌 가능
          drag: {
            enabled: false
          },
          onZoom: ({ chart }) => {
            calculateYAxisRange(chart);
          },
          onZoomComplete: ({ chart }) => {
            calculateYAxisRange(chart);
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 10,
            family: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
          },
          padding: 8,
          autoSkip: true,
          maxTicksLimit: 30
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
          // 500 단위로 올림
          return Math.ceil(maxValue / 500) * 500 * 1.2; // 최대값보다 20% 더 큰 범위 설정
        },
        ticks: {
          callback: (value) => {
            return formatBytes(value);
          }
        }
      }
    },
    transitions: {
      active: {
        animation: {
          duration: 300  // 호버 시 애니메이션 지속 시간
        }
      }
    }
  };

  // 바이트 형식화 함수 추가
  const formatBytes = (bytes) => {
    if (Math.abs(bytes) >= 1048576) { // 1MB = 1024 * 1024
      return `${(bytes / 1048576).toFixed(1)}MB`;
    } else if (Math.abs(bytes) >= 1024) { // 1KB
      return `${(bytes / 1024).toFixed(1)}KB`;
    }
    return `${bytes}B`;
  };

  // 정렬 버튼 기능 개선
  const handleSortByName = () => {
    const sorted = [...submissions].sort((a, b) => a.name.localeCompare(b.name));
    setSubmissions(sorted);
  };

  const handleSortByChanges = () => {
    const sorted = [...submissions].sort((a, b) => (b.totalChanges || 0) - (a.totalChanges || 0));
    setSubmissions(sorted);
  };

  const handleSortByStudentNum = () => {
    const sorted = [...submissions].sort((a, b) => a.studentNum.localeCompare(b.studentNum));
    setSubmissions(sorted);
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
                label={`시작: ${new Date(assignment?.startDateTime || assignment?.kickoffDate).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}`}
                sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
              />
              <Chip 
                label={`마감: ${new Date(assignment?.endDateTime || assignment?.deadlineDate).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}`}
                sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
              />
              <RemainingTime deadline={assignment?.endDateTime || assignment?.deadlineDate} />
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
                      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <Typography variant="h6" sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                          학생별 코드 변화량
                        </Typography>
                        <TextField
                          size="small"
                          placeholder="이름 또는 학번으로 검색"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          sx={{ 
                            width: { xs: '100%', sm: '250px' },
                            '& .MuiInputBase-root': {
                              borderRadius: '20px',
                              fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                              fontSize: '0.875rem'
                            }
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Box>
                      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 1 }}>
                        <Button
                          size="small"
                          variant="text"
                          color="primary"
                          onClick={handleSortByName}
                          startIcon={<SortIcon sx={{ fontSize: '1rem' }} />}
                          sx={{ 
                            fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                            textTransform: 'none',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            px: 1.5
                          }}
                        >
                          이름순
                        </Button>
                        <Button
                          size="small"
                          variant="text"
                          color="primary"
                          onClick={handleSortByChanges}
                          startIcon={<BarChartIcon sx={{ fontSize: '1rem' }} />}
                          sx={{ 
                            fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                            textTransform: 'none',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            px: 1.5
                          }}
                        >
                          변화량순
                        </Button>
                        <Button
                          size="small"
                          variant="text"
                          color="primary"
                          onClick={handleSortByStudentNum}
                          startIcon={<NumbersIcon sx={{ fontSize: '1rem' }} />}
                          sx={{ 
                            fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                            textTransform: 'none',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            px: 1.5
                          }}
                        >
                          학번순
                        </Button>
                        <IconButton
                          onClick={() => setIsFullScreen(true)}
                          sx={{ ml: 'auto' }}
                          size="small"
                        >
                          <FullscreenIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Box sx={{ height: 600, position: 'relative' }}>
                        <Bar options={{
                          ...chartOptions,
                          maintainAspectRatio: false,
                          plugins: {
                            ...chartOptions.plugins,
                            zoom: {
                              ...chartOptions.plugins.zoom,
                              pan: {
                                ...chartOptions.plugins.zoom.pan,
                                onPan: ({ chart }) => {
                                  calculateYAxisRange(chart);
                                }
                              }
                            }
                          }
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
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h6" sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                학생별 코드 변화량
              </Typography>
              <TextField
                size="small"
                placeholder="이름 또는 학번으로 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ 
                  width: { xs: '100%', sm: '250px' },
                  '& .MuiInputBase-root': {
                    borderRadius: '20px',
                    fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                    fontSize: '0.875rem'
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 1 }}>
              <Button
                size="small"
                variant="text"
                color="primary"
                onClick={handleSortByName}
                startIcon={<SortIcon sx={{ fontSize: '1rem' }} />}
                sx={{ 
                  fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                  textTransform: 'none',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  px: 1.5
                }}
              >
                이름순
              </Button>
              <Button
                size="small"
                variant="text"
                color="primary"
                onClick={handleSortByChanges}
                startIcon={<BarChartIcon sx={{ fontSize: '1rem' }} />}
                sx={{ 
                  fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                  textTransform: 'none',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  px: 1.5
                }}
              >
                변화량순
              </Button>
              <Button
                size="small"
                variant="text"
                color="primary"
                onClick={handleSortByStudentNum}
                startIcon={<NumbersIcon sx={{ fontSize: '1rem' }} />}
                sx={{ 
                  fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                  textTransform: 'none',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  px: 1.5
                }}
              >
                학번순
              </Button>
              <IconButton
                onClick={() => setIsFullScreen(false)}
                sx={{ ml: 'auto' }}
                size="small"
              >
                <FullscreenExitIcon fontSize="small" />
              </IconButton>
            </Box>
            <Box sx={{ flex: 1, position: 'relative' }}>
              <Bar options={{
                ...chartOptions,
                maintainAspectRatio: false,
                plugins: {
                  ...chartOptions.plugins,
                  zoom: {
                    ...chartOptions.plugins.zoom,
                    pan: {
                      ...chartOptions.plugins.zoom.pan,
                      onPan: ({ chart }) => {
                        calculateYAxisRange(chart);
                      }
                    }
                  }
                }
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