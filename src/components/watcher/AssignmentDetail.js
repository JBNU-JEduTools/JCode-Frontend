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
  Slider,
  useTheme
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
import { toast } from 'react-toastify';
import ErrorIcon from '@mui/icons-material/Error';

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

// noDataText 플러그인 추가
const noDataTextPlugin = {
  id: 'noDataText',
  beforeDraw: (chart) => {
    const { ctx, width, height } = chart;
    
    // 데이터가 없는 경우에만 메시지 표시
    if (!chart.data.datasets[0].data.length || 
        chart.data.datasets[0].data.every(d => d === 0)) {
      
      // 배경 반투명하게 채우기
      ctx.save();
      ctx.fillStyle = chart.options.plugins.noDataText.backgroundColor || 'rgba(255, 255, 255, 0.7)';
      ctx.fillRect(0, 0, width, height);
      
      // 텍스트 설정
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = chart.options.plugins.noDataText.font || '16px "JetBrains Mono", "Noto Sans KR", sans-serif';
      ctx.fillStyle = chart.options.plugins.noDataText.color || '#282A36';
      
      // 텍스트 그리기
      ctx.fillText(
        chart.options.plugins.noDataText.text || '아직 학생이 코드를 입력하지 않았습니다',
        width / 2,
        height / 2
      );
      
      ctx.restore();
    }
  }
};

// Chart.js에 플러그인 등록
ChartJS.register(noDataTextPlugin);

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
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [currentUser, setCurrentUser] = useState(null);
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
  const [chartData, setChartData] = useState([]);
  const [chartError, setChartError] = useState('');
  
  // 학생인 경우에만 사용자 정보를 가져오는 useEffect
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        // user.role이 'STUDENT'인 경우에만 API 호출
        if (user?.role === 'STUDENT') {
          const response = await api.get('/api/users/me');
          setCurrentUser(response.data);
        }
      } catch (error) {
        console.error('사용자 정보 로딩 실패:', error);
      }
    };

    fetchCurrentUser();
  }, [user?.role]); // user.role이 변경될 때만 실행

  // handleTabChange 수정
  const handleTabChange = (event, newValue) => {
    if (user?.role === 'STUDENT' && newValue === 1) {
      // 학생이 나의 통계 탭을 클릭했을 때
      const studentId = currentUser?.userId || user?.userId;
      if (!studentId) {
        console.error('사용자 ID를 찾을 수 없습니다.');
        return;
      }
      navigate(`/watcher/class/${courseId}/assignment/${assignmentId}/monitoring/${studentId}`);
      return;
    }
    
    setTabValue(newValue);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.role === 'ADMIN') {
          const coursesResponse = await api.get(`/api/courses/${courseId}/details`);
          setCourse(coursesResponse.data);
          
          const assignmentResponse = await api.get(`/api/courses/${courseId}/assignments`);
          const currentAssignment = assignmentResponse.data.find(a => a.assignmentId === parseInt(assignmentId));
          
          if (!currentAssignment) {
            throw new Error('과제를 찾을 수 없습니다.');
          }
          setAssignment(currentAssignment);

          const studentsResponse = await api.get(`/api/courses/${courseId}/users`);
          setSubmissions(studentsResponse.data || []);
        } else if (user?.role === 'PROFESSOR') {
          const coursesResponse = await api.get('/api/users/me/courses/details');
          const foundCourse = coursesResponse.data.find(c => c.courseId === parseInt(courseId));
          
          if (!foundCourse) {
            throw new Error('강의를 찾을 수 없습니다.');
          }
          setCourse(foundCourse);

          const assignmentResponse = await api.get(`/api/courses/${courseId}/assignments`);
          const currentAssignment = assignmentResponse.data.find(a => a.assignmentId === parseInt(assignmentId));
          
          if (!currentAssignment) {
            throw new Error('과제를 찾을 수 없습니다.');
          }
          setAssignment(currentAssignment);

          const studentsResponse = await api.get(`/api/courses/${courseId}/users`);
          setSubmissions(studentsResponse.data || []);
        } else {
          const coursesResponse = await api.get('/api/users/me/courses/details');
          const foundCourse = coursesResponse.data.find(c => c.courseId === parseInt(courseId));
          
          if (!foundCourse) {
            throw new Error('강의를 찾을 수 없습니다.');
          }
          setCourse(foundCourse);

          const assignmentResponse = await api.get(`/api/courses/${courseId}/assignments`);
          const currentAssignment = assignmentResponse.data.find(a => a.assignmentId === parseInt(assignmentId));
          
          if (!currentAssignment) {
            throw new Error('과제를 찾을 수 없습니다.');
          }
          setAssignment(currentAssignment);

          setSubmissions([]);
        }
        
        setLoading(false);
      } catch (error) {
        setError('데이터를 불러오는데 실패했습니다.');
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, assignmentId, user]);

  // 차트 데이터 조회 함수 수정
  const fetchChartData = async () => {
    try {
      if (!rangeStartDate || !rangeEndDate) return;
      
      console.log('시작 날짜:', rangeStartDate);
      console.log('종료 날짜:', rangeEndDate);
      
      const response = await api.get(`/api/watcher/assignments/${assignmentId}/courses/${courseId}/between`, {
        params: {
          st: rangeStartDate.toISOString(),
          end: rangeEndDate.toISOString()
        }
      });
      
      console.log('차트 데이터:', response);
      setChartData(response.data.results || []);
      setChartError(''); // 차트 오류 상태 초기화
    } catch (error) {
      console.error('차트 데이터 로딩 오류:', error);
      // 전체 페이지 오류가 아닌 차트 전용 오류 상태 설정
      setChartError('차트 데이터를 불러오는데 실패했습니다.');
      // 빈 배열로 설정하여 차트가 그려지지 않도록 함
      setChartData([]);
    }
  };

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

  // 초기 데이터 로딩 시 한 번만 API 호출하는 useEffect 수정
  useEffect(() => {
    // 필요한 데이터가 모두 로드되었고, 차트 데이터가 아직 없을 때만 API 호출
    if (assignment && rangeStartDate && rangeEndDate && chartData.length === 0) {
      // 교수/관리자인 경우 submissions 배열이 로드된 후에만 호출
      if ((user?.role === 'ADMIN' || user?.role === 'PROFESSOR' || 
           user?.courseRole === 'PROFESSOR' || user?.courseRole === 'ASSISTANT') && 
          submissions.length === 0) {
        return; // submissions가 로드되지 않았으면 아직 호출하지 않음
      }
      
      // 학생인 경우 또는 submissions가 로드된 경우 API 호출
      fetchChartData();
    }
  }, [assignment, rangeStartDate, rangeEndDate, submissions.length, chartData.length, user?.role, user?.courseRole]);

  // 정렬 토글 함수
  const toggleSort = (field) => {
    setSort(prev => ({
      field: field,
      order: prev.field === field ? (prev.order === 'asc' ? 'desc' : 'asc') : 'asc'
    }));
  };

  // 필터링 및 정렬 함수 수정
  const getFilteredAndSortedSubmissions = () => {
    // 학생만 필터링 (교수/조교/관리자 제외)
    const filtered = submissions.filter(submission => {
      // role이 'PROFESSOR' 또는 'ASSISTANT'가 아닌 경우만 포함
      if (submission.role === 'PROFESSOR' || submission.courseRole === 'PROFESSOR' || 
          submission.role === 'ASSISTANT' || submission.courseRole === 'ASSISTANT') {
        return false;
      }
      
      // 검색어 필터링
      const searchLower = searchQuery.toLowerCase();
      return (
        submission.email?.toLowerCase().includes(searchLower) ||
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
          aValue = a.email || '';
          bValue = b.email || '';
          break;
        case 'studentNum':
          aValue = String(a.studentNum || '');
          bValue = String(b.studentNum || '');
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

  // 슬라이더 값이 변경될 때 호출되는 함수 - API 호출 제거
  const handleRangeChange = (event, newValue) => {
    setCurrentRange(newValue);
    if (startDate && endDate) {
      const totalMillis = endDate.getTime() - startDate.getTime();
      const startMillis = totalMillis * (newValue[0] / 100);
      const endMillis = totalMillis * (newValue[1] / 100);
      
      // 새로운 시작 및 종료 날짜 설정 (상태만 업데이트)
      const newRangeStartDate = new Date(startDate.getTime() + startMillis);
      const newRangeEndDate = new Date(startDate.getTime() + endMillis);
      
      setRangeStartDate(newRangeStartDate);
      setRangeEndDate(newRangeEndDate);
    }
  };

  // 사용자 입력 날짜/시간 변경 핸들러 추가
  const handleStartDateChange = (newDate) => {
    if (newDate && endDate && newDate < endDate) {
      setRangeStartDate(newDate);
      // 슬라이더 값도 업데이트
      updateSliderFromDates(newDate, rangeEndDate);
    }
  };

  const handleEndDateChange = (newDate) => {
    if (newDate && startDate && newDate > rangeStartDate) {
      setRangeEndDate(newDate);
      // 슬라이더 값도 업데이트
      updateSliderFromDates(rangeStartDate, newDate);
    }
  };

  // 날짜에서 슬라이더 값 계산하는 함수 추가
  const updateSliderFromDates = (start, end) => {
    if (startDate && endDate && start && end) {
      const totalMillis = endDate.getTime() - startDate.getTime();
      const startPosition = ((start.getTime() - startDate.getTime()) / totalMillis) * 100;
      const endPosition = ((end.getTime() - startDate.getTime()) / totalMillis) * 100;
      setCurrentRange([startPosition, endPosition]);
    }
  };

  // 조회 버튼 클릭 시 API 호출하는 함수
  const handleFetchData = () => {
    if (startDate && endDate) {
      fetchChartData();
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

  // 차트 데이터 변환 함수 수정 - API 응답 데이터 사용
  const getChartData = () => {
    // 학생인 경우와 교수/관리자인 경우 분리
    if (user?.role === 'STUDENT') {
      // 학생인 경우 직접 chartData 사용
      const labels = chartData.map(item => {
        // 자신의 학번인 경우 "나"로 표시, 아닌 경우 학번만 표시
        const isCurrentUser = currentUser && String(currentUser.studentNum) === String(item.student_num);
        return isCurrentUser ? `나 (${item.student_num})` : `학생${item.student_num}`;
      });
      
      const chartDataObj = {
        labels: labels,
        datasets: [
          {
            type: 'bar',
            label: '코드 변화량',
            data: chartData.map(item => item.size_change || 0),
            backgroundColor: chartData.map(item => {
              // 자신의 학번인 경우 강조 색상 사용
              const isCurrentUser = currentUser && String(currentUser.studentNum) === String(item.student_num);
              return isCurrentUser ? 'rgba(255, 152, 0, 0.8)' : 'rgba(66, 165, 245, 0.8)';
            }),
            borderColor: chartData.map(item => {
              const isCurrentUser = currentUser && String(currentUser.studentNum) === String(item.student_num);
              return isCurrentUser ? 'rgba(230, 81, 0, 1)' : 'rgb(30, 136, 229)';
            }),
            borderWidth: 1
          },
          {
            type: 'line',
            label: '평균',
            data: Array(chartData.length).fill(
              chartData.reduce((sum, item) => sum + (item.size_change || 0), 0) / 
              (chartData.length || 1)
            ),
            borderColor: 'rgba(255, 99, 132, 0.8)',
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0
          }
        ]
      };

      return chartDataObj;
    } else {
      // 교수/관리자인 경우 기존 코드 유지
      // 학생만 필터링 (교수/조교/관리자 제외)
      const filteredSubmissions = submissions.filter(submission => 
        submission.role !== 'PROFESSOR' && submission.courseRole !== 'PROFESSOR' &&
        submission.role !== 'ASSISTANT' && submission.courseRole !== 'ASSISTANT'
      );
      
      // 학생 정보와 차트 데이터 매핑
      const mappedData = filteredSubmissions.map(student => {
        // 해당 학생의 변화량 데이터 찾기
        const changeData = chartData.find(item => 
          String(item.student_num) === String(student.studentNum)
        );
        
        return {
          ...student,
          totalChanges: changeData ? changeData.size_change : 0
        };
      });
      
      // 평균 변화량 계산
      const totalChanges = mappedData.reduce((sum, submission) => sum + (submission.totalChanges || 0), 0);
      const averageChanges = mappedData.length > 0 ? totalChanges / mappedData.length : 0;
      
      // 색상 결정 함수 - 평균 이상/이하 두 가지 색상으로 단순화
      const getBarColor = (submission) => {
        // 검색어가 있고 학생 이름이나 학번에 검색어가 포함되어 있으면 하이라이트 색상 사용
        if (searchQuery && 
            ((submission.name && submission.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
             (submission.studentNum && String(submission.studentNum).toLowerCase().includes(searchQuery.toLowerCase())))) {
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
            ((submission.name && submission.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
             (submission.studentNum && String(submission.studentNum).toLowerCase().includes(searchQuery.toLowerCase())))) {
          return 'rgba(230, 81, 0, 1)'; // 검색 결과 하이라이트 테두리 색상 (진한 주황색)
        }
        
        return submission.totalChanges >= averageChanges 
          ? 'rgb(30, 136, 229)' // 평균 이상은 진한 푸른색
          : 'rgb(123, 97, 175)'; // 평균 이하는 진한 보라색
      };
      
      // API 데이터를 사용하도록 수정
      const chartDataObj = {
        // 라벨 형식 변경 - 이름과 학번을 괄호로 구분
        labels: mappedData.map(submission => `${submission.name || ''}\n(${submission.studentNum || ''})`),
        datasets: [
          {
            type: 'bar',
            label: '코드 변화량',
            data: mappedData.map(submission => submission.totalChanges || 0),
            backgroundColor: mappedData.map(submission => 
              getBarColor(submission)
            ),
            borderColor: mappedData.map(submission => 
              getBorderColor(submission)
            ),
            borderWidth: 1
          },
          {
            type: 'line',
            label: '평균',
            data: Array(mappedData.length).fill(averageChanges),
            borderColor: 'rgba(255, 99, 132, 0.8)',
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0
          }
        ]
      };

      return chartDataObj;
    }
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

  // 차트 옵션 수정 - 범례 부분 수정
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
            
            // 학생인 경우와 교수/관리자인 경우 분리
            if (user?.role === 'STUDENT') {
              // 학생인 경우 커스텀 범례
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
                  text: '나',
                  fillStyle: 'rgba(255, 152, 0, 0.8)',
                  strokeStyle: 'rgba(230, 81, 0, 1)',
                  lineWidth: 1,
                  hidden: false,
                  index: 3
                }
              ];
              
              return [...defaultLabels, ...customLabels];
            } else {
              // 교수/관리자인 경우 기존 코드 유지
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
            }
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
              return `평균: ${Math.round(context.raw)}B`;
            }
            
            // 학생인 경우와 교수/관리자인 경우 분리
            if (user?.role === 'STUDENT') {
              const bytes = Math.round(context.raw);
              const avgDiff = bytes - (context.chart.data.datasets[1].data[0] || 0);
              
              // 현재 학생의 데이터인지 확인
              const isCurrentUser = currentUser && 
                chartData[context.dataIndex] && 
                String(currentUser.studentNum) === String(chartData[context.dataIndex].student_num);
              
              return [
                `${context.dataset.label}: ${formatBytes(bytes)}`,
                `평균과의 차이: ${avgDiff > 0 ? '+' : ''}${formatBytes(avgDiff)}`,
                isCurrentUser ? '(나)' : ''
              ].filter(Boolean); // 빈 문자열 제거
            } else {
              // 교수/관리자인 경우 기존 코드 유지
              const submission = submissions[context.dataIndex];
              if (submission) {
                const bytes = Math.round(context.raw);
                const avgDiff = bytes - (context.chart.data.datasets[1].data[0] || 0);
                return [
                  `${context.dataset.label}: ${formatBytes(bytes)}`,
                  `평균과의 차이: ${avgDiff > 0 ? '+' : ''}${formatBytes(avgDiff)}`
                ];
              }
              return context.dataset.label;
            }
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
      },
      noDataText: {
        text: '아직 학생이 코드를 입력하지 않았습니다',
        font: '16px "JetBrains Mono", "Noto Sans KR", sans-serif',
        color: isDarkMode ? '#F8F8F2' : '#282A36',
        backgroundColor: isDarkMode ? 'rgba(40, 42, 54, 0.8)' : 'rgba(255, 255, 255, 0.8)'
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
    if (user?.role === 'STUDENT') {
      // 학생인 경우 chartData 정렬
      const sorted = [...chartData].sort((a, b) => {
        // 학번 기준으로 정렬 (이름 정보가 없으므로)
        return String(a.student_num).localeCompare(String(b.student_num));
      });
      setChartData(sorted);
    } else {
      // 교수/관리자인 경우 기존 코드 유지
      const sorted = [...submissions].sort((a, b) => a.name.localeCompare(b.name));
      setSubmissions(sorted);
    }
  };

  const handleSortByChanges = () => {
    if (user?.role === 'STUDENT') {
      // 학생인 경우 chartData 정렬
      const sorted = [...chartData].sort((a, b) => (b.size_change || 0) - (a.size_change || 0));
      setChartData(sorted);
    } else {
      // 교수/관리자인 경우 기존 코드 유지
      const submissionsWithChanges = submissions.map(student => {
        // 해당 학생의 변화량 데이터 찾기
        const changeData = chartData.find(item => 
          String(item.student_num) === String(student.studentNum)
        );
        
        return {
          ...student,
          totalChanges: changeData ? changeData.size_change : 0
        };
      });
      
      // 변화량 기준으로 정렬
      const sorted = [...submissionsWithChanges].sort((a, b) => (b.totalChanges || 0) - (a.totalChanges || 0));
      setSubmissions(sorted);
    }
  };

  const handleSortByStudentNum = () => {
    if (user?.role === 'STUDENT') {
      // 학생인 경우 chartData 정렬
      const sorted = [...chartData].sort((a, b) => {
        // 학번 기준으로 정렬
        return String(a.student_num).localeCompare(String(b.student_num));
      });
      setChartData(sorted);
    } else {
      // 교수/관리자인 경우 기존 코드 유지
      const sorted = [...submissions].sort((a, b) => {
        // 문자열로 변환하여 비교
        const aNum = String(a.studentNum || '');
        const bNum = String(b.studentNum || '');
        return aNum.localeCompare(bNum);
      });
      setSubmissions(sorted);
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
                  label="전체 통계" 
                />
                {user?.role === 'STUDENT' && (
                  <Tab 
                    icon={<MonitorIcon />} 
                    iconPosition="start" 
                    label="나의 통계" 
                  />
                )}
                {(user?.role === 'ADMIN' || user?.role === 'PROFESSOR' || user?.courseRole === 'PROFESSOR' || user?.courseRole === 'ASSISTANT') && (
                  <Tab 
                    icon={<PeopleIcon />} 
                    iconPosition="start" 
                    label={`학생 (${getFilteredAndSortedSubmissions().length})`} 
                  />
                )}
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
                        {/* 학생이 아닌 경우에만 검색 필드 표시 */}
                        {user?.role !== 'STUDENT' && (
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
                        )}
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
                        {chartError ? (
                          <Box 
                            display="flex" 
                            justifyContent="center" 
                            alignItems="center" 
                            height="100%"
                            flexDirection="column"
                            gap={2}
                          >
                            <Typography color="error" align="center">
                              {chartError}
                            </Typography>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={handleFetchData}
                            >
                              다시 시도
                            </Button>
                          </Box>
                        ) : (
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
                        )}
                      </Box>
                      <Box sx={{ px: 3, py: 2, mt: 2 }}>
                        <Stack spacing={2}>
                          <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="caption" color="textSecondary" gutterBottom>
                                기간 선택
                              </Typography>
                              <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                onClick={handleFetchData}
                                sx={{ 
                                  fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                                  textTransform: 'none',
                                  borderRadius: '8px',
                                  fontSize: '0.75rem',
                                  fontWeight: 500,
                                  py: 0.5,
                                  px: 1.5
                                }}
                              >
                                조회
                              </Button>
                            </Box>
                            
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
                            
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'center', 
                              mt: 3,
                              gap: 2 
                            }}>
                              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                                <DateTimePicker
                                  label="시작 검색 시간"
                                  value={rangeStartDate}
                                  onChange={handleStartDateChange}
                                  renderInput={(params) => 
                                    <TextField 
                                      {...params} 
                                      size="small" 
                                      fullWidth
                                      sx={{ 
                                        '& .MuiInputBase-root': {
                                          fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                                          fontSize: '0.75rem'
                                        },
                                        '& .MuiInputLabel-root': {
                                          fontSize: '0.75rem'
                                        },
                                        maxWidth: '160px'
                                      }}
                                    />
                                  }
                                  minDateTime={startDate}
                                  maxDateTime={rangeEndDate}
                                />
                                <DateTimePicker
                                  label="끝 검색 시간"
                                  value={rangeEndDate}
                                  onChange={handleEndDateChange}
                                  renderInput={(params) => 
                                    <TextField 
                                      {...params} 
                                      size="small" 
                                      fullWidth
                                      sx={{ 
                                        '& .MuiInputBase-root': {
                                          fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                                          fontSize: '0.75rem'
                                        },
                                        '& .MuiInputLabel-root': {
                                          fontSize: '0.75rem'
                                        },
                                        maxWidth: '160px'
                                      }}
                                    />
                                  }
                                  minDateTime={rangeStartDate}
                                  maxDateTime={endDate}
                                />
                              </LocalizationProvider>
                            </Box>
                          </Box>
                        </Stack>
                      </Box>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </TabPanel>
            
            {(user?.role === 'ADMIN' || user?.role === 'PROFESSOR' || user?.courseRole === 'PROFESSOR' || user?.courseRole === 'ASSISTANT') && (
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
                            {submission.email}
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<CodeIcon sx={{ fontSize: '1rem' }} />}
                                onClick={async () => {
                                  try {
                                    // API 요청으로 리다이렉트 URL 가져오기
                                    const response = await api.post('/api/redirect', {
                                      userEmail: submission.email,
                                      courseId: courseId
                                    }, { withCredentials: true });
                                    
                                    // 응답에서 최종 URL 추출
                                    const finalUrl = response.request?.responseURL || response.data?.url;
                                    
                                    if (!finalUrl) {
                                      throw new Error("리다이렉트 URL을 찾을 수 없습니다");
                                    }
                                    
                                    // 새 탭에서 URL 열기
                                    window.open(finalUrl, '_blank');
                                    
                                  } catch (err) {
                                    toast.error('Web-IDE 연결에 실패했습니다. 잠시 후 다시 시도해주세요.', {
                                      icon: ({theme, type}) => <ErrorIcon sx={{ color: '#fff', fontSize: '1.5rem', mr: 1 }}/>,
                                      style: {
                                        background: isDarkMode ? '#d32f2f' : '#f44336',
                                        color: '#fff',
                                        fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                                        borderRadius: '8px',
                                        fontSize: '0.95rem',
                                        padding: '12px 20px',
                                        maxWidth: '500px',
                                        width: 'auto',
                                        textOverflow: 'ellipsis',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        alignItems: 'center'
                                      }
                                    });
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
            )}
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
              {/* 학생이 아닌 경우에만 검색 필드 표시 */}
              {user?.role !== 'STUDENT' && (
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
              )}
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
              {chartError ? (
                <Box 
                  display="flex" 
                  justifyContent="center" 
                  alignItems="center" 
                  height="100%"
                  flexDirection="column"
                  gap={2}
                >
                  <Typography color="error" align="center">
                    {chartError}
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleFetchData}
                  >
                    다시 시도
                  </Button>
                </Box>
              ) : (
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
              )}
            </Box>
            <Box sx={{ px: 3, py: 2, mt: 2 }}>
              <Stack spacing={2}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" color="textSecondary" gutterBottom>
                      기간 선택
                    </Typography>
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      onClick={handleFetchData}
                      sx={{ 
                        fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                        textTransform: 'none',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        py: 0.5,
                        px: 1.5
                      }}
                    >
                      조회
                    </Button>
                  </Box>
                  
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
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    mt: 3,
                    gap: 2 
                  }}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                      <DateTimePicker
                        label="시작 검색 시간"
                        value={rangeStartDate}
                        onChange={handleStartDateChange}
                        renderInput={(params) => 
                          <TextField 
                            {...params} 
                            size="small" 
                            fullWidth
                            sx={{ 
                              '& .MuiInputBase-root': {
                                fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                                fontSize: '0.75rem'
                              },
                              '& .MuiInputLabel-root': {
                                fontSize: '0.75rem'
                              },
                              maxWidth: '160px'
                            }}
                          />
                        }
                        minDateTime={startDate}
                        maxDateTime={rangeEndDate}
                      />
                      <DateTimePicker
                        label="종료 검색 시간"
                        value={rangeEndDate}
                        onChange={handleEndDateChange}
                        renderInput={(params) => 
                          <TextField 
                            {...params} 
                            size="small" 
                            fullWidth
                            sx={{ 
                              '& .MuiInputBase-root': {
                                fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                                fontSize: '0.75rem'
                              },
                              '& .MuiInputLabel-root': {
                                fontSize: '0.75rem'
                              },
                              maxWidth: '160px'
                            }}
                          />
                        }
                        minDateTime={rangeStartDate}
                        maxDateTime={endDate}
                      />
                    </LocalizationProvider>
                  </Box>
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