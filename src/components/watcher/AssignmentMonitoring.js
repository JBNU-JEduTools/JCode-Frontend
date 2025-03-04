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
  useTheme
} from '@mui/material';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import { ko } from 'date-fns/locale';
import { getMonitoringData, timeUnits } from '../../mocks/monitoringData';
import WatcherBreadcrumbs from '../common/WatcherBreadcrumbs';
import zoomPlugin from 'chartjs-plugin-zoom';
import crosshairPlugin from 'chartjs-plugin-crosshair';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';

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
            mode: 'xy',
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
              day: 'yyyy-MM-dd',
              week: 'yyyy-MM-dd',
              month: 'yyyy-MM'
            },
            stepSize: 1
          },
          adapters: {
            date: {
              locale: ko
            }
          },
          display: true,
          ticks: {
            source: 'data',
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 10,
            padding: 8,
            align: 'center',
            color: isDarkMode ? '#F8F8F2' : '#282A36'
          },
          offset: !isTotal,
          grid: {
            display: true,
            drawBorder: false,
            color: isDarkMode ? 'rgba(98, 114, 164, 0.2)' : 'rgba(98, 114, 164, 0.25)',
            offset: !isTotal,
            tickColor: isDarkMode ? 'rgba(98, 114, 164, 0.4)' : 'rgba(98, 114, 164, 0.4)',
            borderColor: isDarkMode ? 'rgba(98, 114, 164, 0.4)' : 'rgba(98, 114, 164, 0.4)',
            borderWidth: 1
          },
          border: {
            display: true,
            color: isDarkMode ? '#6272A4' : '#E0E0E0',
            width: 1,
            dash: [2, 4]
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
    const ctx = canvas.getContext('2d');
    const currentTime = new Date().getTime();
    const defaultRange = 24 * 60 * 60 * 1000;

    const isBar = config.type === 'bar';
    const options = {
      ...getChartOptions(config.type === 'line'),
      scales: {
        ...getChartOptions(config.type === 'line').scales,
        x: {
          ...getChartOptions(config.type === 'line').scales.x,
          min: currentTime - defaultRange,
          max: currentTime,
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

  // 줌 리셋 함수
  const handleResetZoom = () => {
    if (isUpdating.current) return;
    isUpdating.current = true;

    try {
      const currentTime = new Date().getTime();
      const defaultRange = 24 * 60 * 60 * 1000;
      const min = currentTime - defaultRange;
      const max = currentTime;

      if (totalChartInstance.current) {
        totalChartInstance.current.options.scales.x.min = min;
        totalChartInstance.current.options.scales.x.max = max;
        totalChartInstance.current.update('none');
      }
      if (changeChartInstance.current) {
        changeChartInstance.current.options.scales.x.min = min;
        changeChartInstance.current.options.scales.x.max = max;
        changeChartInstance.current.update('none');
      }
    } finally {
      isUpdating.current = false;
    }
  };

  // 줌 인/아웃 함수
  const handleZoom = (factor) => {
    if (isUpdating.current || !totalChartInstance.current) return;
    isUpdating.current = true;

    try {
      const chart = totalChartInstance.current;
      const range = chart.scales.x.max - chart.scales.x.min;
      const center = (chart.scales.x.max + chart.scales.x.min) / 2;
      const newRange = range * factor;
      const newMin = Math.trunc(center - newRange / 2);
      const newMax = Math.trunc(center + newRange / 2);
      
      chart.options.scales.x.min = newMin;
      chart.options.scales.x.max = newMax;
      chart.update('none');
      
      if (changeChartInstance.current) {
        changeChartInstance.current.options.scales.x.min = newMin;
        changeChartInstance.current.options.scales.x.max = newMax;
        changeChartInstance.current.update('none');
      }
    } finally {
      isUpdating.current = false;
    }
  };

  // 차트 업데이트 함수
  const updateCharts = () => {
    if (!data) return;
    const currentTime = new Date().getTime();
    const defaultRange = 24 * 60 * 60 * 1000;
    const sampledData = downsampleData(data);

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
      chart.options.scales.x.min = currentTime - defaultRange;
      chart.options.scales.x.max = currentTime;

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
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (24 * 60 * 60 * 1000));
    const newData = getMonitoringData(startDate, endDate, timeUnit, minuteValue);
    setData(newData);
  }, [timeUnit, minuteValue]);

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
      
      // 분 단위가 아닌 다른 단위로 변경할 때는 차트 인스턴스 초기화
      if (totalChartInstance.current) {
        totalChartInstance.current.destroy();
        totalChartInstance.current = null;
      }
      if (changeChartInstance.current) {
        changeChartInstance.current.destroy();
        changeChartInstance.current = null;
      }
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
      
      if (totalChartInstance.current) {
        totalChartInstance.current.destroy();
        totalChartInstance.current = null;
      }
      if (changeChartInstance.current) {
        changeChartInstance.current.destroy();
        changeChartInstance.current = null;
      }
    } finally {
      isUpdating.current = false;
    }
  };

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
              text: '과제 모니터링',
              to: `/watcher/class/${courseId}/assignment/${assignmentId}`
            },
            {
              text: '코드 변화량',
              to: `/watcher/class/${courseId}/assignment/${assignmentId}/monitoring/${userId}`
            }
          ]}
        />

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
