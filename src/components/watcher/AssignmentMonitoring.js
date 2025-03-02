import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Divider,
  Stack,
  Button,
  Fade,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  Menu,
  MenuItem,
  ButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { ko } from 'date-fns/locale';
import { 
  startOfWeek, 
  endOfWeek, 
  format, 
  subWeeks,
  subDays,
  subHours,
  startOfDay,
  endOfDay,
  isWithinInterval,
  parseISO,
  addMinutes
} from 'date-fns';
import api from '../../api/axios';
import WatcherBreadcrumbs from '../common/WatcherBreadcrumbs';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EditIcon from '@mui/icons-material/Edit';
import BarChartIcon from '@mui/icons-material/BarChart';
import CodeIcon from '@mui/icons-material/Code';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  TimeScale,
  Filler,
  LineController,
  BarElement,
  BarController
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import crosshairPlugin from 'chartjs-plugin-crosshair';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { useTheme } from '../../contexts/ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  ChartTooltip,
  Legend,
  TimeScale,
  Filler,
  zoomPlugin,
  crosshairPlugin,
  BarElement,
  BarController
);

const QUICK_RANGES = [
  { label: '오늘', getValue: () => ({ start: startOfDay(new Date()), end: new Date() }) },
  { label: '어제', getValue: () => ({ start: startOfDay(subDays(new Date(), 1)), end: endOfDay(subDays(new Date(), 1)) }) },
  { label: '지난 24시간', getValue: () => ({ start: subHours(new Date(), 24), end: new Date() }) },
  { label: '지난 7일', getValue: () => ({ start: subDays(new Date(), 7), end: new Date() }) },
  { label: '이번 주', getValue: () => ({ start: startOfWeek(new Date(), { weekStartsOn: 1 }), end: new Date() }) },
  { label: '지난 주', getValue: () => {
    const start = startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 });
    return { start, end: endOfWeek(start, { weekStartsOn: 1 }) };
  }},
  { label: '지난 30일', getValue: () => ({ start: subDays(new Date(), 30), end: new Date() }) },
];

const TIME_UNITS = [
  { value: '1m', label: '1분', minutes: 1 },
  { value: '5m', label: '5분', minutes: 5 },
  { value: '15m', label: '15분', minutes: 15 },
  { value: '1h', label: '1시간', minutes: 60 },
  { value: '1d', label: '1일', minutes: 1440 },
  { value: '1w', label: '1주', minutes: 10080 },
  { value: '1M', label: '1개월', minutes: 43200 }
];

const AssignmentMonitoring = () => {
  const { courseId, assignmentId, userId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [monitoringData, setMonitoringData] = useState(null);
  const [course, setCourse] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [student, setStudent] = useState(null);
  const [timeUnit, setTimeUnit] = useState('1h');
  const [dateRange, setDateRange] = useState(QUICK_RANGES[0].getValue());
  const [quickRangeAnchorEl, setQuickRangeAnchorEl] = useState(null);
  const [customRangeOpen, setCustomRangeOpen] = useState(false);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const chartContainerRef = useRef(null);
  const paperRef = useRef(null);
  const { isDarkMode } = useTheme();
  const [baselineY, setBaselineY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const chartRef2 = useRef(null);
  const chartInstanceRef2 = useRef(null);

  const handleQuickRangeClick = (event) => {
    setQuickRangeAnchorEl(event.currentTarget);
  };

  const handleQuickRangeClose = () => {
    setQuickRangeAnchorEl(null);
  };

  const handleQuickRangeSelect = (range) => {
    setDateRange(range.getValue());
    handleQuickRangeClose();
  };

  const handleCustomRangeOpen = () => {
    setCustomRangeOpen(true);
    handleQuickRangeClose();
  };

  const handleCustomRangeClose = () => {
    setCustomRangeOpen(false);
  };

  const handleCustomRangeApply = () => {
    handleCustomRangeClose();
  };

  const handleTimeUnitChange = (event, newUnit) => {
    if (newUnit !== null) {
      setTimeUnit(newUnit);
      // 시간 단위에 따라 자동으로 날짜 범위 조정
      if (newUnit === '1w') {
        setDateRange({ 
          start: startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }), 
          end: new Date() 
        });
      } else if (newUnit === '1M') {
        setDateRange({ 
          start: subDays(new Date(), 30), 
          end: new Date() 
        });
      } else if (newUnit === '1d') {
        setDateRange({ 
          start: subDays(new Date(), 7), 
          end: new Date() 
        });
      } else {
        setDateRange(QUICK_RANGES[0].getValue());
      }
    }
  };

  const handleChartReset = () => {
    if (chartInstanceRef.current) {
      try {
        chartInstanceRef.current.resetZoom();
        chartInstanceRef.current.update('none');
      } catch (error) {
        console.error('차트 리셋 오류(1):', error);
      }
    }
    if (chartInstanceRef2.current) {
      try {
        chartInstanceRef2.current.resetZoom();
        chartInstanceRef2.current.update('none');
      } catch (error) {
        console.error('차트 리셋 오류(2):', error);
      }
    }
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      // 전체 Paper 요소를 전체화면으로 변경
      paperRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const getChartData = () => {
    if (!monitoringData || !monitoringData.fileSizeHistory) return { datasets: [] };

    try {
      const dataPoints = monitoringData.fileSizeHistory.map(d => ({
        x: new Date(d.timestamp).getTime(),
        y: d.size
      }));

      return {
        labels: monitoringData.fileSizeHistory.map(d => new Date(d.timestamp).getTime()),
        datasets: [
          {
            label: '파일 크기',
            data: dataPoints,
            borderColor: isDarkMode ? '#BD93F9' : '#6272A4',
            backgroundColor: isDarkMode ? 'rgba(189, 147, 249, 0.2)' : 'rgba(98, 114, 164, 0.2)',
            fill: false,
            tension: 0,
            pointRadius: 3,
            pointHoverRadius: 6,
            borderWidth: 2.5,
            type: 'line',
            pointHoverBackgroundColor: isDarkMode ? '#BD93F9' : '#6272A4',
            pointHoverBorderColor: isDarkMode ? '#F8F8F2' : '#282A36',
            spanGaps: false
          }
        ]
      };
    } catch (error) {
      console.error('차트 데이터 생성 오류:', error);
      return { datasets: [] };
    }
  };

  const getChartData2 = () => {
    if (!monitoringData || !monitoringData.fileSizeHistory) return { datasets: [] };

    try {
      const data = monitoringData.fileSizeHistory.map(d => ({
        timestamp: new Date(d.timestamp).getTime(),
        size: d.size,
        change: d.change
      }));

      // 변화량 데이터 준비 - 원본 데이터의 시간값 정확히 유지
      const changes = data.map((d, i) => ({
        x: d.timestamp,
        y: d.change || (i === 0 ? 0 : d.size - data[i-1].size)
      }));

      return {
        labels: data.map(d => d.timestamp),
        datasets: [
          {
            label: '크기 변화',
            data: changes,
            backgroundColor: (context) => {
              const value = context.raw?.y || 0;
              return value >= 0 
                ? (isDarkMode ? 'rgba(27, 222, 96, 0.6)' : 'rgba(98, 114, 164, 0.6)') 
                : (isDarkMode ? 'rgba(255, 85, 85, 0.6)' : 'rgba(255, 85, 85, 0.6)');
            },
            borderColor: (context) => {
              const value = context.raw?.y || 0;
              return value >= 0 
                ? (isDarkMode ? '#1BDE60' : '#6272A4') 
                : (isDarkMode ? '#FF5555' : '#FF5555');
            },
            borderWidth: 1,
            type: 'bar',
            barPercentage: 0.95, // 막대 너비 증가
            categoryPercentage: 1.0, // 카테고리 너비 최대화
            alignment: 'center' // 막대를 데이터 포인트의 중앙에 정렬
          }
        ]
      };
    } catch (error) {
      console.error('차트2 데이터 생성 오류:', error);
      return { datasets: [] };
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    devicePixelRatio: Math.min(2, window.devicePixelRatio || 1), // 모바일 디바이스에서 성능 향상
    parsing: false, // 수동으로 데이터 포인트를 할당하므로 파싱 비활성화
    normalized: true, // 성능 향상
    transitions: {
      active: {
        animation: {
          duration: 0 // 전환 애니메이션 비활성화
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      crosshair: {
        line: {
          color: (ctx) => ctx.chart.options.isDark ? 'rgba(248, 248, 242, 0.3)' : 'rgba(40, 42, 54, 0.3)',
          width: 1,
          dashPattern: [6, 6]
        },
        sync: {
          enabled: true,
          group: 'group1',
          suppressTooltips: false,
          xSyncMargins: 0
        },
        horizontal: true,
        vertical: true,
        snapToDataPoint: true,
        mode: 'nearest',
        interactions: {
          mode: 'nearest',
          intersect: false
        }
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        position: 'average',
        external: null,
        z: 999999,
        callbacks: {
          title: (context) => {
            return format(context[0].parsed.x, 'yyyy/MM/dd HH:mm');
          },
          label: (context) => {
            if (context.dataset.label === '파일 크기') {
              return `파일 크기: ${Math.round(context.parsed.y)}바이트`;
            }
            return `크기 변화: ${context.parsed.y >= 0 ? '+' : ''}${Math.round(context.parsed.y)}바이트`;
          }
        },
        backgroundColor: (ctx) => ctx.chart.options.backgroundColor,
        titleColor: (ctx) => ctx.chart.options.color,
        bodyColor: (ctx) => ctx.chart.options.color,
        borderColor: (ctx) => ctx.chart.options.borderColor,
        borderWidth: 1,
        padding: 10,
        titleFont: {
          size: 12,
          weight: 'bold',
          family: "'Noto Sans KR', sans-serif"
        },
        bodyFont: {
          size: 12,
          family: "'Noto Sans KR', sans-serif"
        }
      },
      zoom: {
        pan: {
          enabled: true,
          mode: 'xy',
          onPan: function(ctx) {
            try {
              if (chartInstanceRef2.current) {
                const { min, max } = ctx.chart.scales.x;
                chartInstanceRef2.current.scales.x.options.min = min;
                chartInstanceRef2.current.scales.x.options.max = max;
                chartInstanceRef2.current.update('none');
              }
            } catch (error) {
              console.error('첫 번째 차트 패닝 동기화 오류:', error);
            }
          }
        },
        zoom: {
          wheel: {
            enabled: true
          },
          pinch: {
            enabled: true
          },
          mode: 'xy',
          onZoom: function(ctx) {
            try {
              if (chartInstanceRef2.current) {
                const { min, max } = ctx.chart.scales.x;
                chartInstanceRef2.current.scales.x.options.min = min;
                chartInstanceRef2.current.scales.x.options.max = max;
                chartInstanceRef2.current.update('none');
              }
            } catch (error) {
              console.error('첫 번째 차트 줌 동기화 오류:', error);
            }
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: timeUnit.endsWith('m') ? 'minute' : 
                timeUnit === '1h' ? 'hour' : 
                timeUnit === '1d' ? 'day' : 
                timeUnit === '1w' ? 'week' : 'month',
          displayFormats: {
            minute: 'HH:mm',
            hour: 'HH:mm',
            day: 'MM/dd',
            week: 'yyyy/MM/dd',
            month: 'yyyy/MM'
          },
          tooltipFormat: 'yyyy/MM/dd HH:mm'
        },
        adapters: {
          date: {
            locale: ko
          }
        },
        grid: {
          display: true,
          color: (ctx) => ctx.chart.options.isDark ? 'rgba(98, 114, 164, 0.4)' : 'rgba(98, 114, 164, 0.2)',
          drawBorder: true,
          borderColor: (ctx) => ctx.chart.options.isDark ? 'rgba(98, 114, 164, 0.6)' : 'rgba(98, 114, 164, 0.3)',
          drawOnChartArea: true,
          lineWidth: 1
        },
        border: {
          display: true,
          color: (ctx) => ctx.chart.options.isDark ? 'rgba(98, 114, 164, 0.6)' : 'rgba(98, 114, 164, 0.3)'
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 12,
          padding: 8,
          font: {
            size: 12,
            family: "'Noto Sans KR', sans-serif",
            weight: '600'
          },
          color: (ctx) => ctx.chart.options.isDark ? 'rgba(98, 114, 164, 0.8)' : '#282A36',
          display: true
        }
      },
      y: {
        position: 'right',
        beginAtZero: false,
        title: {
          display: true,
          text: '파일 크기',
          color: (ctx) => ctx.chart.options.isDark ? '#F8F8F2' : '#282A36',
          font: {
            size: 13,
            weight: 'bold'
          },
          padding: {top: 0, bottom: 10}
        },
        grid: {
          display: true,
          color: (ctx) => ctx.chart.options.isDark ? 'rgba(98, 114, 164, 0.4)' : 'rgba(98, 114, 164, 0.2)',
          drawBorder: true,
          borderColor: (ctx) => ctx.chart.options.isDark ? 'rgba(98, 114, 164, 0.6)' : 'rgba(98, 114, 164, 0.3)',
          drawOnChartArea: true,
          lineWidth: 1
        },
        border: {
          display: true,
          color: (ctx) => ctx.chart.options.isDark ? 'rgba(98, 114, 164, 0.6)' : 'rgba(98, 114, 164, 0.3)'
        },
        ticks: {
          padding: 8,
          font: {
            size: 12,
            family: "'Noto Sans KR', sans-serif",
            weight: '600'
          },
          color: (ctx) => ctx.chart.options.isDark ? 'rgba(98, 114, 164, 0.8)' : '#282A36',
          display: true,
          callback: function(value) {
            return Math.round(value) + '바이트';
          },
          autoSkip: true,
          maxTicksLimit: 8,
          precision: 0
        }
      },
      y1: {
        position: 'left',
        beginAtZero: true,
        title: {
          display: true,
          text: '크기 변화',
          color: (ctx) => ctx.chart.options.isDark ? '#F8F8F2' : '#282A36',
          font: {
            size: 13,
            weight: 'bold'
          },
          padding: {top: 0, bottom: 10}
        },
        grid: {
          display: true,
          drawBorder: true,
          color: (context) => {
            if (context.tick.value === 0) {
              return isDarkMode ? 'rgba(248, 248, 242, 0.6)' : 'rgba(40, 42, 54, 0.6)';
            }
            return isDarkMode ? 'rgba(98, 114, 164, 0.4)' : 'rgba(98, 114, 164, 0.2)';
          },
          lineWidth: (context) => {
            if (context.tick.value === 0) {
              return 2;
            }
            return 1;
          },
          drawOnChartArea: true
        },
        border: {
          display: true,
          color: (ctx) => ctx.chart.options.isDark ? 'rgba(98, 114, 164, 0.6)' : 'rgba(98, 114, 164, 0.3)'
        },
        ticks: {
          padding: 8,
          font: {
            size: 12,
            family: "'Noto Sans KR', sans-serif",
            weight: '600'
          },
          color: (ctx) => ctx.chart.options.isDark ? 'rgba(98, 114, 164, 0.8)' : '#282A36',
          display: true,
          callback: function(value) {
            const sign = value > 0 ? '+' : '';
            return sign + Math.round(value) + '바이트';
          },
          autoSkip: true,
          maxTicksLimit: 7,
          precision: 0
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    },
    hover: {
      mode: 'index',
      intersect: false
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseResponse = await api.get(`/api/courses/${courseId}/admin/details`);
        setCourse(courseResponse.data);

        const assignmentResponse = await api.get(`/api/courses/${courseId}/assignments`);
        const currentAssignment = assignmentResponse.data.find(a => a.assignmentId === parseInt(assignmentId));
        setAssignment(currentAssignment);

        const studentResponse = await api.get(`/api/users/${userId}`);
        setStudent(studentResponse.data);

        // 테스트를 위한 목업 데이터 생성
        const generateMockFileHistory = () => {
          const history = [];
          const startTime = dateRange.start.getTime();
          const endTime = dateRange.end.getTime();
          
          // 사용자가 선택한 시간 단위와 정확히 일치하는 간격으로 데이터 생성
          const selectedTimeUnit = TIME_UNITS.find(unit => unit.value === timeUnit);
          let interval = selectedTimeUnit ? selectedTimeUnit.minutes * 60 * 1000 : 5 * 60 * 1000; // 정확히 선택한 시간 단위
          
          // 전체 데이터가 너무 많으면 간격 조정
          const totalTime = endTime - startTime;
          if (totalTime / interval > 1000) {
            interval = totalTime / 1000; // 최대 1000개 데이터 포인트
          }
          
          let currentSize = 1000; // 초기 파일 크기
          
          // 시간에 따른 패턴 추가
          const patterns = [
            // 기본 변동성
            () => Math.floor(Math.random() * 700) - 200,
            // 갑작스런 증가
            () => Math.floor(Math.random() * 2000) + 500,
            // 감소 트렌드
            () => Math.floor(Math.random() * 200) - 400,
            // 안정적 증가
            () => Math.floor(Math.random() * 300) + 100,
            // 미세 변화
            () => Math.floor(Math.random() * 100) - 50,
          ];
          
          // 에디트 이벤트 시뮬레이션 (특정 시점에 큰 변화)
          const editEvents = [];
          const numEvents = Math.floor((endTime - startTime) / (3600000 * 2)) + 1; // 대략 2시간마다 이벤트
          
          for (let i = 0; i < numEvents; i++) {
            const eventTime = startTime + Math.floor(Math.random() * (endTime - startTime));
            editEvents.push({
              time: eventTime,
              change: Math.random() > 0.3 ? 
                Math.floor(Math.random() * 3000) + 1000 : // 추가 (70%)
                -Math.floor(Math.random() * 2000) // 삭제 (30%)
            });
          }
          
          let currentPattern = 0;
          let patternDuration = Math.floor(Math.random() * 10) + 5; // 패턴이 유지되는 데이터 포인트 수
          let patternCount = 0;
          
          for (let time = startTime; time <= endTime; time += interval) {
            // 패턴 변경 관리
            if (patternCount >= patternDuration) {
              currentPattern = Math.floor(Math.random() * patterns.length);
              patternDuration = Math.floor(Math.random() * 10) + 5;
              patternCount = 0;
            }
            patternCount++;
            
            // 기본 패턴에 따른 변화
            let change = patterns[currentPattern]();
            
            // 에디트 이벤트 반영
            for (const event of editEvents) {
              // 현재 시간이 이벤트 시간과 가까우면 이벤트의 변화량 적용
              if (Math.abs(time - event.time) < interval) {
                change += event.change;
                // 코드 마무리 작업: 이벤트 후 미세 조정
                if (Math.random() > 0.5) {
                  // 작은 후속 변경 추가 (이벤트 이후 조정 작업)
                  const followupTime = time + interval;
                  if (followupTime <= endTime) {
                    const followupChange = event.change > 0 ? 
                      Math.floor(event.change * 0.1) : 
                      Math.floor(-event.change * 0.1);
                    editEvents.push({
                      time: followupTime,
                      change: followupChange
                    });
                  }
                }
              }
            }
            
            // 최종 크기 계산 (음수가 되지 않도록)
            currentSize = Math.max(0, currentSize + change);
            
            history.push({
              timestamp: new Date(time).toISOString(),
              size: currentSize,
              change: change // 디버깅 및 차트 데이터용
            });
          }
          
          return history;
        };

        const generateMockEdits = () => {
          const edits = [];
          const startTime = dateRange.start.getTime();
          const endTime = dateRange.end.getTime();
          
          // 파일 이름 목록
          const fileNames = [
            'Main.java', 'Utils.java', 'Test.java', 'UserService.java',
            'DataProcessor.java', 'Algorithm.java', 'Controller.java',
            'Repository.java', 'ViewHelper.java', 'Logger.java',
            'Config.java', 'SecurityManager.java', 'FileHandler.java',
            'API.java', 'Database.java', 'NetworkClient.java'
          ];
          
          // 에디트 이벤트 생성 (약 30분~2시간마다)
          const totalDuration = endTime - startTime;
          const numEdits = Math.max(5, Math.floor(totalDuration / (30 * 60000 + Math.random() * 90 * 60000)));
          
          for (let i = 0; i < numEdits; i++) {
            const editTime = startTime + Math.floor(Math.random() * (endTime - startTime));
            edits.push({
              timestamp: new Date(editTime).toISOString(),
              fileName: fileNames[Math.floor(Math.random() * fileNames.length)],
              changedLines: Math.floor(Math.random() * 50) + 1
            });
          }
          
          // 시간순 정렬
          edits.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          
          return edits;
        };

        const mockMonitoringData = {
          totalEditTime: Math.floor(Math.random() * 500) + 100,
          lastActiveTime: new Date(Date.now() - Math.floor(Math.random() * 3600000)).toISOString(),
          totalChanges: Math.floor(Math.random() * 5000) + 500,
          averageChangesPerMinute: (Math.random() * 15 + 3).toFixed(2),
          fileSizeHistory: generateMockFileHistory(),
          recentEdits: generateMockEdits().filter(edit => 
            isWithinInterval(parseISO(edit.timestamp), { 
              start: dateRange.start, 
              end: dateRange.end 
            })
          )
        };
        setMonitoringData(mockMonitoringData);
        setLoading(false);
      } catch (error) {
        console.error('데이터 조회 실패:', error);
        setError('데이터를 불러오는데 실패했습니다.');
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, assignmentId, userId, dateRange, timeUnit]);

  useEffect(() => {
    // 마우스 이벤트 핸들러 함수 참조를 보관
    let chart1MouseMoveHandler = null;
    let chart2MouseMoveHandler = null;
    
    // 차트 인스턴스 초기화 및 정리 함수
    const initializeCharts = () => {
      try {
        if (!loading && monitoringData) {
          // 기존 차트 정리
          if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
            chartInstanceRef.current = null;
          }
          if (chartInstanceRef2.current) {
            chartInstanceRef2.current.destroy();
            chartInstanceRef2.current = null;
          }
          
          const ctx = chartRef.current?.getContext('2d');
          const ctx2 = chartRef2.current?.getContext('2d');
          
          if (!ctx || !ctx2) {
            console.error('차트 컨텍스트를 가져올 수 없습니다.');
            return;
          }
          
          // 공통된 X축 설정 정의
          const commonXAxisSettings = {
            type: 'time',
            time: {
              unit: timeUnit.endsWith('m') ? 'minute' : 
                    timeUnit === '1h' ? 'hour' : 
                    timeUnit === '1d' ? 'day' : 
                    timeUnit === '1w' ? 'week' : 'month',
              displayFormats: {
                minute: 'HH:mm',
                hour: 'HH:mm',
                day: 'MM/dd',
                week: 'yyyy/MM/dd',
                month: 'yyyy/MM'
              },
              tooltipFormat: 'yyyy/MM/dd HH:mm'
            },
            adapters: {
              date: {
                locale: ko
              }
            },
            min: dateRange.start.getTime(),
            max: dateRange.end.getTime(),
            offset: false,
            alignToPixels: true,
            distribution: 'linear'
          };
          
          // 첫 번째 차트 생성
          try {
            const newChart = new ChartJS(ctx, {
              type: 'line',
              data: getChartData(),
              options: {
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  crosshair: {
                    ...chartOptions.plugins.crosshair,
                    sync: {
                      enabled: true,
                      group: 'group1',
                      suppressTooltips: false
                    },
                    horizontal: true,
                    vertical: true,
                    snapToDataPoint: true
                  },
                  zoom: {
                    pan: {
                      enabled: true,
                      mode: 'xy',
                      onPan: function(ctx) {
                        try {
                          if (chartInstanceRef2.current) {
                            const { min, max } = ctx.chart.scales.x;
                            chartInstanceRef2.current.scales.x.options.min = min;
                            chartInstanceRef2.current.scales.x.options.max = max;
                            chartInstanceRef2.current.update('none');
                          }
                        } catch (error) {
                          console.error('첫 번째 차트 패닝 동기화 오류:', error);
                        }
                      }
                    },
                    zoom: {
                      wheel: {
                        enabled: true
                      },
                      pinch: {
                        enabled: true
                      },
                      mode: 'xy',
                      onZoom: function(ctx) {
                        try {
                          if (chartInstanceRef2.current) {
                            const { min, max } = ctx.chart.scales.x;
                            chartInstanceRef2.current.scales.x.options.min = min;
                            chartInstanceRef2.current.scales.x.options.max = max;
                            chartInstanceRef2.current.update('none');
                          }
                        } catch (error) {
                          console.error('첫 번째 차트 줌 동기화 오류:', error);
                        }
                      }
                    }
                  }
                },
                scales: {
                  x: {
                    ...commonXAxisSettings,
                    display: false,
                    grid: {
                      ...chartOptions.scales.x.grid,
                      display: false
                    },
                    border: {
                      display: false
                    },
                    offset: false,
                    alignToPixels: true,
                    ticks: {
                      source: 'data',
                      maxRotation: 0,
                      autoSkip: true
                    }
                  },
                  y: chartOptions.scales.y
                },
                color: isDarkMode ? '#F8F8F2' : '#282A36',
                backgroundColor: isDarkMode ? '#282A36' : '#FFFFFF',
                borderColor: isDarkMode ? '#44475A' : '#E0E0E0',
                isDark: isDarkMode,
                interaction: {
                  mode: 'nearest',
                  axis: 'xy',
                  intersect: false
                },
                events: ['mousemove', 'mouseenter', 'mouseleave', 'click']
              }
            });
            chartInstanceRef.current = newChart;
          } catch (error) {
            console.error('첫 번째 차트 생성 오류:', error);
          }
          
          // 두 번째 차트 생성
          try {
            const newChart2 = new ChartJS(ctx2, {
              type: 'bar',
              data: getChartData2(),
              options: {
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  crosshair: {
                    ...chartOptions.plugins.crosshair,
                    line: {
                      color: (ctx) => ctx.chart.options.isDark ? 'rgba(248, 248, 242, 0.3)' : 'rgba(40, 42, 54, 0.3)',
                      width: 1,
                      dashPattern: [6, 6]
                    },
                    sync: {
                      enabled: true,
                      group: 'group1',
                      suppressTooltips: false,
                      xSyncMargins: 0
                    },
                    horizontal: true,
                    vertical: true,
                    snapToDataPoint: true,
                    mode: 'nearest',
                    interactions: {
                      mode: 'nearest',
                      intersect: false
                    }
                  },
                  zoom: {
                    pan: {
                      enabled: true,
                      mode: 'xy',
                      onPan: function(ctx) {
                        try {
                          if (chartInstanceRef.current) {
                            const { min, max } = ctx.chart.scales.x;
                            chartInstanceRef.current.scales.x.options.min = min;
                            chartInstanceRef.current.scales.x.options.max = max;
                            chartInstanceRef.current.update('none');
                          }
                        } catch (error) {
                          console.error('두 번째 차트 패닝 동기화 오류:', error);
                        }
                      }
                    },
                    zoom: {
                      wheel: {
                        enabled: true
                      },
                      pinch: {
                        enabled: true
                      },
                      mode: 'xy',
                      onZoom: function(ctx) {
                        try {
                          if (chartInstanceRef.current) {
                            const { min, max } = ctx.chart.scales.x;
                            chartInstanceRef.current.scales.x.options.min = min;
                            chartInstanceRef.current.scales.x.options.max = max;
                            chartInstanceRef.current.update('none');
                          }
                        } catch (error) {
                          console.error('두 번째 차트 줌 동기화 오류:', error);
                        }
                      }
                    }
                  }
                },
                scales: {
                  x: {
                    ...commonXAxisSettings,
                    stacked: true,
                    display: true,
                    grid: {
                      ...chartOptions.scales.x.grid,
                      display: true
                    },
                    border: {
                      display: true
                    },
                    offset: false,
                    alignToPixels: true
                  },
                  y: {
                    ...chartOptions.scales.y1,
                    position: 'right',
                    stacked: true
                  }
                },
                color: isDarkMode ? '#F8F8F2' : '#282A36',
                backgroundColor: isDarkMode ? '#282A36' : '#FFFFFF',
                borderColor: isDarkMode ? '#44475A' : '#E0E0E0',
                isDark: isDarkMode,
                barPercentage: 0.95,
                categoryPercentage: 1.0,
                alignment: 'center',
                borderSkipped: false,
                interaction: {
                  mode: 'nearest',
                  axis: 'xy',
                  intersect: false
                },
                events: ['mousemove', 'mouseenter', 'mouseleave', 'click']
              }
            });
            chartInstanceRef2.current = newChart2;
          } catch (error) {
            console.error('두 번째 차트 생성 오류:', error);
          }
          
          // 두 차트가 모두 성공적으로 생성된 경우에만 이벤트 핸들러 설정
          if (chartInstanceRef.current && chartInstanceRef2.current) {
            // 마우스 이벤트 핸들러 정의 및 설정
            chart1MouseMoveHandler = (e) => {
              // 합성 이벤트인 경우 이벤트 전파를 중단
              if (e.isSynthetic) {
                return;
              }
              
              if (chartInstanceRef2.current) {
                // 첫 번째 차트에서 마우스 이벤트 발생 시 두 번째 차트에도 전파
                const rect = chartInstanceRef2.current.canvas.getBoundingClientRect();
                try {
                  // 같은 X 위치로 마우스 이벤트 전달
                  const syntheticEvent = new MouseEvent('mousemove', {
                    clientX: e.clientX,
                    clientY: rect.top + rect.height / 2,
                    bubbles: true,
                    cancelable: true,
                    view: window
                  });
                  
                  // 합성 이벤트 플래그 추가
                  syntheticEvent.isSynthetic = true;
                  
                  chartInstanceRef2.current.canvas.dispatchEvent(syntheticEvent);
                } catch (error) {
                  console.error('차트 이벤트 전파 오류:', error);
                }
              }
            };

            chart2MouseMoveHandler = (e) => {
              // 합성 이벤트인 경우 이벤트 전파를 중단
              if (e.isSynthetic) {
                return;
              }
              
              if (chartInstanceRef.current) {
                // 두 번째 차트에서 마우스 이벤트 발생 시 첫 번째 차트에도 전파
                const rect = chartInstanceRef.current.canvas.getBoundingClientRect();
                try {
                  // 같은 X 위치로 마우스 이벤트 전달
                  const syntheticEvent = new MouseEvent('mousemove', {
                    clientX: e.clientX,
                    clientY: rect.top + rect.height / 2,
                    bubbles: true,
                    cancelable: true,
                    view: window
                  });
                  
                  // 합성 이벤트 플래그 추가
                  syntheticEvent.isSynthetic = true;
                  
                  chartInstanceRef.current.canvas.dispatchEvent(syntheticEvent);
                } catch (error) {
                  console.error('차트 이벤트 전파 오류:', error);
                }
              }
            };
            
            // 이벤트 리스너 등록
            chartInstanceRef.current.canvas.addEventListener('mousemove', chart1MouseMoveHandler);
            chartInstanceRef2.current.canvas.addEventListener('mousemove', chart2MouseMoveHandler);
            
            // 두 차트가 모두, 완전히 동기화되도록 이벤트 이후 명시적으로 초기 동기화
            setTimeout(() => {
              try {
                if (chartInstanceRef.current && chartInstanceRef2.current) {
                  // 완전한 동기화 보장
                  const { min: min1, max: max1 } = chartInstanceRef.current.scales.x;
                  const { min: min2, max: max2 } = chartInstanceRef2.current.scales.x;
                  
                  if (min1 !== undefined && max1 !== undefined) {
                    // 첫 번째 차트 범위를 두 번째 차트에 적용
                    chartInstanceRef2.current.scales.x.options.min = min1;
                    chartInstanceRef2.current.scales.x.options.max = max1;
                    chartInstanceRef2.current.scales.x._userMin = min1;
                    chartInstanceRef2.current.scales.x._userMax = max1;
                  }
                  
                  if (min2 !== undefined && max2 !== undefined) {
                    // 두 번째 차트 범위를 첫 번째 차트에 적용
                    chartInstanceRef.current.scales.x.options.min = min2;
                    chartInstanceRef.current.scales.x.options.max = max2;
                    chartInstanceRef.current.scales.x._userMin = min2;
                    chartInstanceRef.current.scales.x._userMax = max2;
                  }
                  
                  // 양쪽 차트 모두 업데이트
                  chartInstanceRef.current.update('none');
                  chartInstanceRef2.current.update('none');
                  
                  console.log('차트 초기 동기화 완료');
                }
              } catch (error) {
                console.error('차트 초기 동기화 오류:', error);
              }
            }, 100);
          }
        }
      } catch (error) {
        console.error('차트 초기화 중 오류 발생:', error);
      }
    };
    
    // 안전한 실행을 위한 지연 호출
    const timeoutId = setTimeout(() => {
      initializeCharts();
    }, 0);
    
    // 컴포넌트 언마운트 정리
    return () => {
      clearTimeout(timeoutId);
      
      try {
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
          chartInstanceRef.current = null;
        }
      } catch (error) {
        console.error('차트1 정리 오류:', error);
      }
      
      try {
        if (chartInstanceRef2.current) {
          chartInstanceRef2.current.destroy();
          chartInstanceRef2.current = null;
        }
      } catch (error) {
        console.error('차트2 정리 오류:', error);
      }
      
      // 이벤트 리스너 정리
      if (chartRef.current && chart1MouseMoveHandler) {
        try {
          chartRef.current.removeEventListener('mousemove', chart1MouseMoveHandler);
        } catch (error) {
          console.error('이벤트 리스너1 정리 오류:', error);
        }
      }
      
      if (chartRef2.current && chart2MouseMoveHandler) {
        try {
          chartRef2.current.removeEventListener('mousemove', chart2MouseMoveHandler);
        } catch (error) {
          console.error('이벤트 리스너2 정리 오류:', error);
        }
      }
    };
  }, [timeUnit, dateRange, monitoringData, loading, isDarkMode]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

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
          borderRadius: '16px',
          ...(isFullscreen && {
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            '& > *:last-child': {
              flexGrow: 1
            }
          })
        }}
        ref={paperRef}
        >
          <WatcherBreadcrumbs 
            paths={[
              { 
                text: course?.courseName || '로딩중...', 
                to: `/watcher/class/${courseId}` 
              },
              { 
                text: assignment?.assignmentName || '로딩중...', 
                to: `/watcher/class/${courseId}/assignment/${assignmentId}` 
              },
              {
                text: `${student?.name || '로딩중...'} 모니터링`,
                to: `/watcher/class/${courseId}/assignment/${assignmentId}/monitoring/${userId}`
              }
            ]} 
          />

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ 
              fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
              mb: 2
            }}>
              {student?.name} 학생의 과제 진행 현황
            </Typography>
          </Box>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <ToggleButtonGroup
              value={timeUnit}
              exclusive
              onChange={handleTimeUnitChange}
              aria-label="시간 단위"
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  px: 2,
                  py: 0.5,
                  fontSize: '0.875rem',
                  color: (theme) => theme.palette.mode === 'dark' ? '#F8F8F2' : '#666',
                  borderColor: (theme) => theme.palette.mode === 'dark' ? '#44475A' : '#ddd',
                  backgroundColor: 'transparent',
                  '&.Mui-selected': {
                    backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#BD93F9' : '#6272A4',
                    color: '#F8F8F2',
                    '&:hover': {
                      backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#A77BF3' : '#4E5B85',
                      borderColor: (theme) => theme.palette.mode === 'dark' ? '#BD93F9' : '#6272A4'
                    }
                  },
                  '&:hover': {
                    borderColor: (theme) => theme.palette.mode === 'dark' ? '#BD93F9' : '#6272A4',
                    backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(189, 147, 249, 0.1)' : 'rgba(98, 114, 164, 0.1)',
                    color: (theme) => theme.palette.mode === 'dark' ? '#BD93F9' : '#6272A4'
                  }
                }
              }}
            >
              {TIME_UNITS.map((unit) => (
                <ToggleButton 
                  key={unit.value} 
                  value={unit.value}
                >
                  {unit.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title={isFullscreen ? "전체화면 나가기" : "전체화면"}>
                <IconButton
                  onClick={handleFullscreen}
                  size="small"
                  sx={{
                    borderRadius: 1,
                    border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? '#44475A' : '#ddd'}`,
                    color: (theme) => theme.palette.mode === 'dark' ? '#F8F8F2' : '#666',
                    backgroundColor: 'transparent',
                    '&:hover': {
                      borderColor: (theme) => theme.palette.mode === 'dark' ? '#BD93F9' : '#6272A4',
                      backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(189, 147, 249, 0.1)' : 'rgba(98, 114, 164, 0.1)',
                      color: (theme) => theme.palette.mode === 'dark' ? '#BD93F9' : '#6272A4'
                    }
                  }}
                >
                  {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </IconButton>
              </Tooltip>
              <Button
                variant="outlined"
                size="small"
                onClick={handleChartReset}
                sx={{
                  borderColor: (theme) => theme.palette.mode === 'dark' ? '#44475A' : '#ddd',
                  color: (theme) => theme.palette.mode === 'dark' ? '#F8F8F2' : '#666',
                  backgroundColor: 'transparent',
                  '&:hover': {
                    borderColor: (theme) => theme.palette.mode === 'dark' ? '#BD93F9' : '#6272A4',
                    backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(189, 147, 249, 0.1)' : 'rgba(98, 114, 164, 0.1)',
                    color: (theme) => theme.palette.mode === 'dark' ? '#BD93F9' : '#6272A4'
                  }
                }}
              >
                초기화
              </Button>
            </Box>
          </Box>
          <Box 
            ref={chartContainerRef}
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
              position: 'relative',
              backgroundColor: (theme) => theme.palette.background.default,
              borderRadius: 1,
              p: 1,
              height: isFullscreen ? 'calc(100vh - 150px)' : 'min(calc(100vh - 250px), 600px)',
              minHeight: 500,
              '& canvas': {
                borderRadius: 1
              }
            }}
          >
            <Box 
              sx={{ 
                position: 'relative',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Box 
                sx={{ 
                  height: '60%',
                  pb: 0,
                  mb: -1,
                  zIndex: 1,
                  position: 'relative'
                }}
              >
                <canvas ref={chartRef} />
              </Box>
              <Box 
                sx={{ 
                  height: '40%',
                  pt: 0,
                  mt: 0,
                  zIndex: 0
                }}
              >
                <canvas ref={chartRef2} />
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Fade>
  );
};

export default AssignmentMonitoring;