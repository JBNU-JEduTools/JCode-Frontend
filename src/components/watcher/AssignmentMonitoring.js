import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  Typography,
  Chip,
  CircularProgress
} from '@mui/material';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import { ko } from 'date-fns/locale';
import { timeUnits } from '../../mocks/monitoringData';
import WatcherBreadcrumbs from '../common/WatcherBreadcrumbs';
import zoomPlugin from 'chartjs-plugin-zoom';
import crosshairPlugin from 'chartjs-plugin-crosshair';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import api from '../../api/axios';

Chart.register(zoomPlugin);
Chart.register(crosshairPlugin);

const AssignmentMonitoring = () => {
  const { courseId, assignmentId, userId } = useParams();
  const [timeUnit, setTimeUnit] = useState('minute');
  const [minuteValue, setMinuteValue] = useState('5');
  const totalBytesChartRef = useRef(null);
  const changeChartRef = useRef(null);
  const totalChartInstance = useRef(null);
  const changeChartInstance = useRef(null);
  const [data, setData] = useState(null);
  const isUpdating = useRef(false);
  const theme = useTheme();
  const isDarkMode = useMemo(() => theme.palette.mode === 'dark', [theme.palette.mode]);
  const [assignment, setAssignment] = useState(null);
  const [course, setCourse] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // 타임스탬프 변환 함수 (20250306_1519 형식을 Date 객체로 변환)
  const parseTimestamp = (timestamp) => {
    const year = parseInt(timestamp.substring(0, 4));
    const month = parseInt(timestamp.substring(4, 6)) - 1; // 월은 0부터 시작
    const day = parseInt(timestamp.substring(6, 8));
    const hour = parseInt(timestamp.substring(9, 11));
    const minute = parseInt(timestamp.substring(11, 13));
    
    return new Date(year, month, day, hour, minute).getTime();
  };

  // 데이터 다운샘플링 함수
  const downsampleData = (data, targetPoints = 500) => {
    if (!data || data.length <= targetPoints) return data;
    
    const skip = Math.ceil(data.length / targetPoints);
    return data.filter((_, index) => index % skip === 0);
  };

  // 차트 옵션 설정 - useMemo로 최적화
  const getChartOptions = (isTotal = true) => {
    const calculateStepSize = (chart) => {
      if (!chart || !chart.data || !chart.data.datasets || chart.data.datasets.length === 0) return 100;
      
      const values = chart.data.datasets[0].data;
      const max = Math.max(...values);
      const min = Math.min(...values);
      const range = max - min;
      
      const targetTicks = 15;
      let stepSize = Math.ceil(range / targetTicks);
      
      const magnitude = Math.pow(10, Math.floor(Math.log10(stepSize)));
      const normalized = stepSize / magnitude;
      
      if (normalized <= 1) stepSize = magnitude;
      else if (normalized <= 2) stepSize = 2 * magnitude;
      else if (normalized <= 5) stepSize = 5 * magnitude;
      else stepSize = 10 * magnitude;
      
      return stepSize;
    };

    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      layout: {
        padding: {
          left: 0,
          right: 60,
          top: isTotal ? 20 : 10,
          bottom: isTotal ? 0 : 20
        }
      },
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        tooltip: {
          enabled: true,
          mode: 'index',
          intersect: false,
          position: 'nearest',
          animation: false,
          backgroundColor: isDarkMode ? '#44475A' : '#FFFFFF',
          borderColor: isDarkMode ? '#6272A4' : '#E0E0E0',
          borderWidth: 1,
          titleColor: isDarkMode ? '#F8F8F2' : '#282A36',
          bodyColor: isDarkMode ? '#F8F8F2' : '#282A36',
          external: (context) => {
            if (isUpdating.current) return;
            isUpdating.current = true;

            try {
              const targetChart = context.chart === totalChartInstance.current 
                ? changeChartInstance.current 
                : totalChartInstance.current;
              
              if (targetChart) {
                const tooltip = targetChart.tooltip;
                if (context.tooltip.opacity === 0) {
                  tooltip.setActiveElements([], { x: 0, y: 0 });
                  targetChart.update('none');
                  return;
                }

                const activeElements = context.tooltip.dataPoints.map(dataPoint => ({
                  datasetIndex: dataPoint.datasetIndex,
                  index: dataPoint.dataIndex,
                }));

                tooltip.setActiveElements(activeElements, {
                  x: context.tooltip.x,
                  y: context.tooltip.y,
                });
                targetChart.update('none');
              }
            } finally {
              isUpdating.current = false;
            }
          }
        },
        crosshair: {
          line: {
            color: isDarkMode ? '#6272A4' : '#9E9E9E',
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
            mode: 'xy',
            onPan({ chart }) {
              if (isUpdating.current) return;
              isUpdating.current = true;

              try {
                const targetChart = chart === totalChartInstance.current 
                  ? changeChartInstance.current 
                  : totalChartInstance.current;
                
                if (targetChart) {
                  const xMin = Math.trunc(chart.scales.x.min);
                  const xMax = Math.trunc(chart.scales.x.max);
                  targetChart.options.scales.x.min = xMin;
                  targetChart.options.scales.x.max = xMax;
                  targetChart.update('none');
                }
              } finally {
                isUpdating.current = false;
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
            mode: 'x',
            drag: {
              enabled: false
            },
            onZoom({ chart }) {
              if (isUpdating.current) return;
              isUpdating.current = true;

              try {
                const targetChart = chart === totalChartInstance.current 
                  ? changeChartInstance.current 
                  : totalChartInstance.current;
                
                if (targetChart) {
                  const xMin = Math.trunc(chart.scales.x.min);
                  const xMax = Math.trunc(chart.scales.x.max);
                  targetChart.options.scales.x.min = xMin;
                  targetChart.options.scales.x.max = xMax;
                  targetChart.update('none');
                }
              } finally {
                isUpdating.current = false;
              }
            }
          }
        }
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: timeUnit,
            displayFormats: {
              minute: 'HH:mm',
              hour: 'MM-dd HH:mm',
              day: 'MM-dd',
              week: 'yyyy-MM-dd',
              month: 'yyyy-MM'
            },
            tooltipFormat: 'yyyy-MM-dd HH:mm',
            adapters: {
              date: {
                locale: ko
              }
            }
          },
          ticks: {
            source: 'auto',
            autoSkip: true,
            maxRotation: 0,
            color: isDarkMode ? '#F8F8F2' : '#282A36'
          },
          grid: {
            display: true,
            color: isDarkMode ? 'rgba(98, 114, 164, 0.1)' : 'rgba(189, 147, 249, 0.1)'
          },
          border: {
            color: isDarkMode ? '#6272A4' : '#BD93F9'
          },
          adapters: {
            date: {
              locale: ko
            }
          }
        },
        y: {
          position: 'right',
          beginAtZero: isTotal,
          display: true,
          ticks: {
            padding: 8,
            callback: (value) => Number.isInteger(value) ? `${value} B` : '',
            stepSize: (context) => calculateStepSize(context.chart),
            display: true,
            z: 1,
            color: isDarkMode ? '#F8F8F2' : '#282A36'
          },
          grid: {
            display: true,
            drawBorder: false,
            color: isDarkMode ? 'rgba(98, 114, 164, 0.2)' : 'rgba(98, 114, 164, 0.25)',
            drawTicks: true,
            tickColor: isDarkMode ? 'rgba(98, 114, 164, 0.4)' : 'rgba(98, 114, 164, 0.4)',
            borderColor: isDarkMode ? 'rgba(98, 114, 164, 0.4)' : 'rgba(98, 114, 164, 0.4)',
            borderWidth: 1,
            z: 0
          },
          border: {
            display: true,
            color: isDarkMode ? '#6272A4' : '#E0E0E0',
            width: 1,
            dash: [2, 4]
          }
        }
      }
    };
  };

  // 차트 생성 함수
  const createChart = (canvas, config) => {
    if (!canvas) return null;
    if (!data || data.length === 0 || !assignment) return null;
    
    const ctx = canvas.getContext('2d');
    
    // 과제 시작일과 마감일 가져오기
    const startTime = new Date(assignment.startDateTime).getTime();
    const endTime = new Date(assignment.endDateTime).getTime();

    console.log('Assignment Info:', {
      startDateTime: assignment.startDateTime,
      endDateTime: assignment.endDateTime,
      parsedStartTime: new Date(startTime).toLocaleString(),
      parsedEndTime: new Date(endTime).toLocaleString(),
      startTime,
      endTime
    });

    const isBar = config.type === 'bar';
    const options = {
      ...getChartOptions(config.type === 'line'),
      scales: {
        ...getChartOptions(config.type === 'line').scales,
        x: {
          ...getChartOptions(config.type === 'line').scales.x,
          min: startTime,
          max: endTime,
          display: true,
          offset: isBar,
          grid: {
            ...getChartOptions(config.type === 'line').scales.x.grid,
            offset: isBar
          }
        },
        y: {
          ...getChartOptions(config.type === 'line').scales.y,
          display: true,
          ticks: {
            ...getChartOptions(config.type === 'line').scales.y.ticks,
            display: true
          }
        }
      },
      plugins: {
        ...getChartOptions(config.type === 'line').plugins,
        zoom: {
          ...getChartOptions(config.type === 'line').plugins.zoom,
          limits: {
            x: {
              min: startTime,
              max: endTime,
              minRange: 60 * 1000 // 최소 1분
            },
            y: { min: 'original', max: 'original' }
          }
        }
      }
    };

    if (isBar) {
      config.data.datasets[0].barPercentage = 0.8;
      config.data.datasets[0].categoryPercentage = 0.9;
    }

    return new Chart(ctx, {
      ...config,
      options
    });
  };
  // 차트 업데이트 함수
  const updateCharts = () => {
    if (!data || !assignment) return;
    const sampledData = downsampleData(data);
    
    // 과제 시작일과 마감일 가져오기
    const startTime = new Date(assignment.startDateTime).getTime();
    const endTime = new Date(assignment.endDateTime).getTime();
    console.log('startTime', startTime);
    console.log('endTime', endTime);
    const updateChartInstance = (chart, isTotal) => {
      if (!chart) return;

      // 데이터 업데이트
      chart.data.labels = sampledData.map(d => d.timestamp);
      if (isTotal) {
        chart.data.datasets[0].data = sampledData.map(d => d.totalBytes);
      } else {
        chart.data.datasets[0].data = sampledData.map(d => d.change);
        chart.data.datasets[0].backgroundColor = sampledData.map(d => 
          d.change >= 0 
            ? isDarkMode ? 'rgba(80, 250, 123, 0.5)' : 'rgba(98, 114, 164, 0.5)'
            : isDarkMode ? 'rgba(255, 85, 85, 0.5)' : 'rgba(255, 121, 198, 0.5)'
        );
        chart.data.datasets[0].borderColor = sampledData.map(d =>
          d.change >= 0 
            ? isDarkMode ? '#50FA7B' : '#6272A4'
            : isDarkMode ? '#FF5555' : '#FF79C6'
        );
      }

      // 옵션 업데이트
      Object.assign(chart.options, getChartOptions(isTotal));
      
      // 시간 범위 설정 (과제 시작일과 마감일 사이)
      chart.options.scales.x.min = startTime;
      chart.options.scales.x.max = endTime;

      // 줌 제한 설정
      chart.options.plugins.zoom.limits = {
        x: {
          min: startTime,
          max: endTime,
          minRange: 60 * 1000 // 최소 1분
        },
        y: { min: 'original', max: 'original' }
      };

      requestAnimationFrame(() => {
        chart.update('none');
      });
    };

    // 차트 업데이트 또는 생성
    if (totalChartInstance.current) {
      updateChartInstance(totalChartInstance.current, true);
    } else if (totalBytesChartRef.current) {
      totalChartInstance.current = createChart(totalBytesChartRef.current, {
        type: 'line',
        data: {
          labels: sampledData.map(d => d.timestamp),
          datasets: [{
            label: '총 코드량 (바이트)',
            data: sampledData.map(d => d.totalBytes),
            borderColor: isDarkMode ? '#BD93F9' : '#6272A4',
            borderWidth: 2,
            pointRadius: 0,
            fill: false
          }]
        }
      });
    }

    if (changeChartInstance.current) {
      updateChartInstance(changeChartInstance.current, false);
    } else if (changeChartRef.current) {
      changeChartInstance.current = createChart(changeChartRef.current, {
        type: 'bar',
        data: {
          labels: sampledData.map(d => d.timestamp),
          datasets: [{
            label: '코드 변화량 (바이트)',
            data: sampledData.map(d => d.change),
            backgroundColor: sampledData.map(d => d.change >= 0 ? 'rgba(54, 162, 235, 0.5)' : 'rgba(255, 99, 132, 0.5)'),
            borderColor: sampledData.map(d => d.change >= 0 ? 'rgb(54, 162, 235)' : 'rgb(255, 99, 132)'),
            borderWidth: 1
          }]
        }
      });
    }
  };

  // 데이터 로드 및 차트 초기화
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 과제 정보 조회
        const assignmentResponse = await api.get(`/api/courses/${courseId}/assignments`);
        const currentAssignment = assignmentResponse.data.find(a => a.assignmentId === parseInt(assignmentId));
        setAssignment(currentAssignment);

        console.log('Fetched Assignment:', {
          assignment: currentAssignment,
          startDateTime: currentAssignment?.startDateTime,
          endDateTime: currentAssignment?.endDateTime,
          parsedStartTime: currentAssignment?.startDateTime ? new Date(currentAssignment.startDateTime).toLocaleString() : null,
          parsedEndTime: currentAssignment?.endDateTime ? new Date(currentAssignment.endDateTime).toLocaleString() : null
        });

        // 강의 정보 조회
        const coursesResponse = await api.get(`/api/courses/${courseId}/admin/details`);
        setCourse(coursesResponse.data);

        // 학생 정보 조회
        const studentsResponse = await api.get(`/api/courses/${courseId}/users`);
        const currentStudent = studentsResponse.data.find(s => s.userId === parseInt(userId));
        setStudent(currentStudent);

        // interval 값 계산
        let intervalValue = 1; // 기본값
        if (timeUnit === 'minute') {
          intervalValue = parseInt(minuteValue);
        } else if (timeUnit === 'hour') {
          intervalValue = 60; // 60분 = 1시간
        } else if (timeUnit === 'day') {
          intervalValue = 1440; // 1440분 = 24시간 = 1일
        } else if (timeUnit === 'week') {
          intervalValue = 10080; // 10080분 = 7일 = 1주
        } else if (timeUnit === 'month') {
          intervalValue = 43200; // 43200분 = 30일 = 1개월 (근사값)
        }

        // 모니터링 데이터 조회
        const params = new URLSearchParams({
          course: 1,
          assignment: 3,
          user: 16
        });
        const monitoringResponse = await api.get(`/api/watcher/graph_data/interval/${intervalValue}?${params}`);
        
        console.log('Monitoring Data:', {
          intervalValue,
          dataPoints: monitoringResponse.data.trends.length,
          firstPoint: monitoringResponse.data.trends[0],
          lastPoint: monitoringResponse.data.trends[monitoringResponse.data.trends.length - 1]
        });

        // API 응답 데이터를 차트에 맞는 형식으로 변환
        const chartData = monitoringResponse.data.trends.map(item => ({
          timestamp: parseTimestamp(item.timestamp),
          totalBytes: item.total_size,
          change: item.size_change
        }));

        // 과제 시작 시간에 초기 데이터 포인트 추가
        if (currentAssignment && currentAssignment.startDateTime && chartData.length > 0) {
          const startTime = new Date(currentAssignment.startDateTime).getTime();
          const firstDataPoint = chartData[0];
          
          // 첫 데이터 포인트가 시작 시간 이후인 경우에만 추가
          if (firstDataPoint.timestamp > startTime) {
            chartData.unshift({
              timestamp: startTime,
              totalBytes: 0,
              change: 0
            });
          }
        }
        
        setData(chartData);
        setLoading(false);
      } catch (error) {
        console.error('데이터 조회 실패:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, assignmentId, userId, timeUnit, minuteValue]);

  // 데이터가 변경될 때마다 차트 업데이트
  useEffect(() => {
    updateCharts();
  }, [data]);

  // 테마 변경 감지 및 차트 업데이트
  useEffect(() => {
    if (totalChartInstance.current) {
      totalChartInstance.current.destroy();
      totalChartInstance.current = null;
    }
    if (changeChartInstance.current) {
      changeChartInstance.current.destroy();
      changeChartInstance.current = null;
    }
    updateCharts();
  }, [isDarkMode]);

  // 컴포넌트 언마운트 시 차트 정리
  useEffect(() => {
    return () => {
      if (totalChartInstance.current) {
        totalChartInstance.current.destroy();
        totalChartInstance.current = null;
      }
      if (changeChartInstance.current) {
        changeChartInstance.current.destroy();
        changeChartInstance.current = null;
      }
    };
  }, []);

  // 시간 단위 변경 핸들러
  const handleTimeUnitChange = (event, newValue) => {
    if (isUpdating.current || !newValue) return;
    isUpdating.current = true;

    try {
      setTimeUnit(newValue);
      
      // 차트 인스턴스 초기화
      if (totalChartInstance.current) {
        totalChartInstance.current.destroy();
        totalChartInstance.current = null;
      }
      if (changeChartInstance.current) {
        changeChartInstance.current.destroy();
        changeChartInstance.current = null;
      }
      
      // API 호출을 위해 로딩 상태로 변경
      setLoading(true);
    } finally {
      isUpdating.current = false;
    }
  };

  const handleMinuteChange = (event) => {
    if (isUpdating.current) return;
    isUpdating.current = true;

    try {
      const newMinuteValue = event.target.value;
      setMinuteValue(newMinuteValue);
      setTimeUnit('minute');
      
      // 차트 인스턴스 초기화
      if (totalChartInstance.current) {
        totalChartInstance.current.destroy();
        totalChartInstance.current = null;
      }
      if (changeChartInstance.current) {
        changeChartInstance.current.destroy();
        changeChartInstance.current = null;
      }
      
      // API 호출을 위해 로딩 상태로 변경
      setLoading(true);
    } finally {
      isUpdating.current = false;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
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
              to: `/watcher/class/${courseId}`
            },
            {
              text: assignment?.assignmentName || '로딩중...',
              to: `/watcher/class/${courseId}/assignment/${assignmentId}`
            },
            {
              text: '코드 변화량',
              to: `/watcher/class/${courseId}/assignment/${assignmentId}/monitoring/${userId}`
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
              label={`학번: ${student?.studentNum || '로딩중...'}`}
              sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
            />
            <Chip 
              label={`이름: ${student?.name || '로딩중...'}`}
              sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
            />
            <Chip 
              label={`이메일: ${student?.email || '로딩중...'}`}
              sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
            />
          </Box>
        </Box>

        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>분</InputLabel>
            <Select
              value={minuteValue}
              label="분"
              onChange={handleMinuteChange}
              onClick={() => setTimeUnit('minute')}
            >
              <MenuItem value="1">1분</MenuItem>
              <MenuItem value="3">3분</MenuItem>
              <MenuItem value="5">5분</MenuItem>
              <MenuItem value="10">10분</MenuItem>
              <MenuItem value="15">15분</MenuItem>
              <MenuItem value="30">30분</MenuItem>
              <MenuItem value="60">60분</MenuItem>
            </Select>
          </FormControl>
          <ToggleButtonGroup
            value={timeUnit}
            exclusive
            onChange={handleTimeUnitChange}
            size="small"
          >
            <ToggleButton value="hour">시간</ToggleButton>
            <ToggleButton value="day">일</ToggleButton>
            <ToggleButton value="week">주</ToggleButton>
            <ToggleButton value="month">월</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ height: '400px', mb: 2 }}>
          <canvas ref={totalBytesChartRef} />
        </Box>

        <Box sx={{ height: '200px' }}>
          <canvas ref={changeChartRef} />
        </Box>
      </Paper>
    </Container>
  );
};

export default AssignmentMonitoring;
