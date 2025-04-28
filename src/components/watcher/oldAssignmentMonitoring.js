// import React, { useState, useEffect, useRef, useMemo } from 'react';
// import { useParams } from 'react-router-dom';
// import {
//   Container,
//   Paper,
//   Box,
//   Select,
//   MenuItem,
//   FormControl,
//   InputLabel,
//   Button,
//   Stack,
//   ToggleButton,
//   ToggleButtonGroup,
//   useTheme,
//   Typography,
//   Chip,
//   CircularProgress,
//   IconButton,
//   Tooltip,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   List,
//   ListItem,
//   ListItemText,
//   Divider
// } from '@mui/material';
// import Chart from 'chart.js/auto';
// import 'chartjs-adapter-date-fns';
// import { ko } from 'date-fns/locale';
// import WatcherBreadcrumbs from '../common/WatcherBreadcrumbs';
// import zoomPlugin from 'chartjs-plugin-zoom';
// import crosshairPlugin from 'chartjs-plugin-crosshair';
// import RestartAltIcon from '@mui/icons-material/RestartAlt';
// import RefreshIcon from '@mui/icons-material/Refresh';
// import ZoomInIcon from '@mui/icons-material/ZoomIn';
// import ZoomOutIcon from '@mui/icons-material/ZoomOut';
// import CloseIcon from '@mui/icons-material/Close';
// import api from '../../api/axios';
// import annotationPlugin from 'chartjs-plugin-annotation';

// Chart.register(zoomPlugin);
// Chart.register(crosshairPlugin);
// Chart.register(annotationPlugin);

// // 컴포넌트 상단에 커스텀 플러그인 정의
// const noDataTextPlugin = {
//   id: 'noDataText',
//   beforeDraw: (chart) => {
//     const { ctx, width, height } = chart;
    
//     // 데이터가 없는 경우에만 메시지 표시
//     if (!chart.data.datasets[0].data.length || 
//         chart.data.datasets[0].data.every(d => d === 0)) {
      
//       // 배경 반투명하게 채우기
//       ctx.save();
//       ctx.fillStyle = chart.options.plugins.noDataText.backgroundColor || 'rgba(255, 255, 255, 0.7)';
//       ctx.fillRect(0, 0, width, height);
      
//       // 텍스트 설정
//       ctx.textAlign = 'center';
//       ctx.textBaseline = 'middle';
//       ctx.font = chart.options.plugins.noDataText.font || '16px "JetBrains Mono", "Noto Sans KR", sans-serif';
//       ctx.fillStyle = chart.options.plugins.noDataText.color || '#282A36';
      
//       // 텍스트 그리기
//       ctx.fillText(
//         chart.options.plugins.noDataText.text || '아직 학생이 코드를 입력하지 않았습니다',
//         width / 2,
//         height / 2
//       );
      
//       ctx.restore();
//     }
//   }
// };

// // Chart.js에 플러그인 등록
// Chart.register(noDataTextPlugin);

// const AssignmentMonitoring = () => {
//   const { courseId, assignmentId, userId } = useParams();
//   const [timeUnit, setTimeUnit] = useState('minute');
//   const [minuteValue, setMinuteValue] = useState('5');
//   const [user, setUser] = useState(null);
//   const totalBytesChartRef = useRef(null);
//   const changeChartRef = useRef(null);
//   const totalChartInstance = useRef(null);
//   const changeChartInstance = useRef(null);
//   const [data, setData] = useState(null);
//   const isUpdating = useRef(false);
//   const theme = useTheme();
//   const isDarkMode = useMemo(() => theme.palette.mode === 'dark', [theme.palette.mode]);
//   const [assignment, setAssignment] = useState(null);
//   const [course, setCourse] = useState(null);
//   const [student, setStudent] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [lastUpdated, setLastUpdated] = useState(null);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [autoRefresh, setAutoRefresh] = useState(true);
//   const autoRefreshIntervalRef = useRef(null);
//   const currentViewRef = useRef({ xMin: null, xMax: null });
//   const [error, setError] = useState(null);
  
//   // 실행 로그와 빌드 로그 상태 추가
//   const [runLogs, setRunLogs] = useState([]);
//   const [buildLogs, setBuildLogs] = useState([]);
//   const [selectedLog, setSelectedLog] = useState(null);
//   const [logDialogOpen, setLogDialogOpen] = useState(false);
//   const [logsLoading, setLogsLoading] = useState(false);
  
//   // 로그 주석(annotation) 표시 여부 관련 상태 추가
//   const [showRunLogs, setShowRunLogs] = useState(true); 
//   const [showBuildLogs, setShowBuildLogs] = useState(true);
//   const [showSuccessLogs, setShowSuccessLogs] = useState(true);
//   const [showFailLogs, setShowFailLogs] = useState(true);

//   // timeUnits를 직접 컴포넌트 내에서 정의
//   const timeUnits = {
//     minute: '분',
//     hour: '시간',
//     day: '일',
//     week: '주',
//     month: '월'
//   };

//   // 타임스탬프 변환 함수 (20250306_1519 형식을 Date 객체로 변환)
//   const parseTimestamp = (timestamp) => {
//     const year = parseInt(timestamp.substring(0, 4));
//     const month = parseInt(timestamp.substring(4, 6)) - 1; // 월은 0부터 시작
//     const day = parseInt(timestamp.substring(6, 8));
//     const hour = parseInt(timestamp.substring(9, 11));
//     const minute = parseInt(timestamp.substring(11, 13));
    
//     return new Date(year, month, day, hour, minute).getTime();
//   };

//   // 데이터 다운샘플링 함수
//   const downsampleData = (data, targetPoints = 500) => {
//     // 데이터가 없거나 배열이 아니거나 이미 타겟보다 적으면 그대로 반환
//     if (!data || !Array.isArray(data) || data.length <= targetPoints) return data || [];
    
//     const skip = Math.ceil(data.length / targetPoints);
//     return data.filter((_, index) => index % skip === 0);
//   };

//   // y축 ticks callback 함수 수정
//   const formatBytes = (bytes) => {
//     if (!Number.isInteger(bytes)) return '';
//     return `${bytes}B`;
//   };

//   // 차트 옵션 설정 - useMemo로 최적화
//   const getChartOptions = (isTotal = true) => {
//     const calculateStepSize = (chart) => {
//       if (!chart || !chart.data || !chart.data.datasets || chart.data.datasets.length === 0) return 100;
      
//       // x축의 현재 범위 내에서의 데이터만 필터링
//       const xMin = chart.scales.x.min;
//       const xMax = chart.scales.x.max;
//       const visibleData = chart.data.datasets[0].data.filter((_, index) => {
//         const timestamp = chart.data.labels[index];
//         return timestamp >= xMin && timestamp <= xMax;
//       });
      
//       // 보이는 범위 내의 최대/최소값 계산
//       const max = Math.max(...visibleData);
//       const min = Math.min(...visibleData);
//       const range = max - min;
      
//       const targetTicks = 15;
//       let stepSize = Math.ceil(range / targetTicks);
      
//       const magnitude = Math.pow(10, Math.floor(Math.log10(stepSize)));
//       const normalized = stepSize / magnitude;
      
//       if (normalized <= 1) stepSize = magnitude;
//       else if (normalized <= 2) stepSize = 2 * magnitude;
//       else if (normalized <= 5) stepSize = 5 * magnitude;
//       else stepSize = 10 * magnitude;
      
//       return stepSize;
//     };

//     return {
//       responsive: true,
//       maintainAspectRatio: false,
//       animation: false,
//       layout: {
//         padding: {
//           left: 0,
//           right: 60,
//           top: 40, // 상단 여백 증가
//           bottom: isTotal ? 0 : 20
//         }
//       },
//       interaction: {
//         mode: 'index',
//         intersect: false,
//       },
//       plugins: {
//         legend: {
//           display: false,
//         },
//         tooltip: {
//           enabled: true,
//           mode: 'index',
//           intersect: false,
//           position: 'nearest',
//           animation: false,
//           backgroundColor: isDarkMode ? '#44475A' : '#FFFFFF',
//           borderColor: isDarkMode ? '#6272A4' : '#E0E0E0',
//           borderWidth: 1,
//           titleColor: isDarkMode ? '#F8F8F2' : '#282A36',
//           bodyColor: isDarkMode ? '#F8F8F2' : '#282A36',
//           external: (context) => {
//             if (isUpdating.current) return;
//             isUpdating.current = true;

//             try {
//               const targetChart = context.chart === totalChartInstance.current 
//                 ? changeChartInstance.current 
//                 : totalChartInstance.current;
              
//               if (targetChart && context.tooltip && context.tooltip.dataPoints && context.tooltip.dataPoints.length > 0) {
//                 const tooltip = targetChart.tooltip;
//                 if (context.tooltip.opacity === 0) {
//                   tooltip.setActiveElements([], { x: 0, y: 0 });
//                   targetChart.update('none');
//                   return;
//                 }

//                 // 안전하게 데이터 포인트 확인
//                 const validDataPoints = context.tooltip.dataPoints.filter(dataPoint => 
//                   dataPoint !== undefined && 
//                   dataPoint.datasetIndex !== undefined && 
//                   dataPoint.dataIndex !== undefined
//                 );

//                 if (validDataPoints.length > 0) {
//                   const activeElements = validDataPoints.map(dataPoint => ({
//                     datasetIndex: dataPoint.datasetIndex,
//                     index: dataPoint.dataIndex,
//                   }));

//                   tooltip.setActiveElements(activeElements, {
//                     x: context.tooltip.x,
//                     y: context.tooltip.y,
//                   });
//                   targetChart.update('none');
//                 }
//               }
//             } catch (error) {
//               console.error('툴크 업데이트 중 오류 발생:', error);
//             } finally {
//               isUpdating.current = false;
//             }
//           },
//           callbacks: {
//             label: (context) => {
//               if (!context || !context.dataset || context.parsed === undefined || context.parsed.y === undefined) {
//                 return '';
//               }
//               const label = context.dataset.label || '';
//               const value = context.parsed.y;
//               return `${label}: ${formatBytes(value)}`;
//             }
//           }
//         },
//         crosshair: {
//           line: {
//             color: isDarkMode ? '#6272A4' : '#9E9E9E',
//             width: 1,
//             dashPattern: [5, 5]
//           },
//           sync: {
//             enabled: true,
//             group: 1,
//           },
//           zoom: {
//             enabled: false
//           }
//         },
//         zoom: {
//           limits: {
//             x: { min: 'original', max: 'original' },
//             y: { min: 'original', max: 'original' }
//           },
//           pan: {
//             enabled: true,
//             mode: 'xy',
//             onPan({ chart }) {
//               if (isUpdating.current) return;
//               isUpdating.current = true;

//               try {
//                 const targetChart = chart === totalChartInstance.current 
//                   ? changeChartInstance.current 
//                   : totalChartInstance.current;
                
//                 if (targetChart) {
//                   const xMin = Math.trunc(chart.scales.x.min);
//                   const xMax = Math.trunc(chart.scales.x.max);
//                   targetChart.options.scales.x.min = xMin;
//                   targetChart.options.scales.x.max = xMax;
                  
//                   // y축 범위 업데이트
//                   calculateYAxisRange(chart, chart === totalChartInstance.current);
//                   calculateYAxisRange(targetChart, targetChart === totalChartInstance.current);
                  
//                   // 차트 업데이트
//                   chart.update('none');
//                   targetChart.update('none');
//                 }
//               } finally {
//                 isUpdating.current = false;
//               }
//             }
//           },
//           zoom: {
//             wheel: {
//               enabled: true
//             },
//             pinch: {
//               enabled: true
//             },
//             mode: 'x',
//             drag: {
//               enabled: false
//             },
//             onZoom({ chart }) {
//               if (isUpdating.current) return;
//               isUpdating.current = true;

//               try {
//                 const targetChart = chart === totalChartInstance.current 
//                   ? changeChartInstance.current 
//                   : totalChartInstance.current;
                
//                 if (targetChart) {
//                   const xMin = Math.trunc(chart.scales.x.min);
//                   const xMax = Math.trunc(chart.scales.x.max);
//                   targetChart.options.scales.x.min = xMin;
//                   targetChart.options.scales.x.max = xMax;
                  
//                   // y축 범위 업데이트
//                   calculateYAxisRange(chart, chart === totalChartInstance.current);
//                   calculateYAxisRange(targetChart, targetChart === totalChartInstance.current);
                  
//                   // 차트 업데이트
//                   chart.update('none');
//                   targetChart.update('none');
//                 }
//               } finally {
//                 isUpdating.current = false;
//               }
//             }
//           }
//         },
//         // 데이터가 없을 때 표시할 메시지 설정
//         noDataText: {
//           text: '아직 학생이 코드를 입력하지 않았습니다',
//           font: '16px "JetBrains Mono", "Noto Sans KR", sans-serif',
//           color: isDarkMode ? '#F8F8F2' : '#282A36',
//           backgroundColor: isDarkMode ? 'rgba(40, 42, 54, 0.8)' : 'rgba(255, 255, 255, 0.8)'
//         },
//         // annotation 플러그인 설정 추가
//         annotation: {
//           annotations: {},
//           interaction: {
//             mode: 'point',  // nearest에서 point로 변경
//             axis: 'xy',
//             intersect: false
//           },
//           // 라벨이 항상 보이도록 설정
//           common: {
//             drawTime: 'afterDraw',
//             label: {
//               display: true,
//               drawTime: 'afterDraw'
//             }
//           }
//         }
//       },
//       scales: {
//         x: {
//           type: 'time',
//           time: {
//             unit: timeUnit,
//             displayFormats: {
//               minute: 'HH:mm',
//               hour: 'MM-dd HH:mm',
//               day: 'MM-dd',
//               week: 'yyyy-MM-dd',
//               month: 'yyyy-MM'
//             },
//             tooltipFormat: 'yyyy-MM-dd HH:mm',
//             adapters: {
//               date: {
//                 locale: ko
//               }
//             }
//           },
//           ticks: {
//             source: 'auto',
//             autoSkip: false,
//             maxRotation: 0,
//             color: isDarkMode ? '#F8F8F2' : '#282A36'
//           },
//           grid: {
//             display: true,
//             color: isDarkMode ? 'rgba(98, 114, 164, 0.1)' : 'rgba(189, 147, 249, 0.1)'
//           },
//           border: {
//             color: isDarkMode ? '#6272A4' : '#BD93F9'
//           },
//           adapters: {
//             date: {
//               locale: ko
//             }
//           }
//         },
//         y: {
//           position: 'right',
//           beginAtZero: isTotal ? false : true,
//           display: true,
//           ticks: {
//             padding: 8,
//             callback: (value) => formatBytes(value),
//             stepSize: 500,
//             display: true,
//             z: 1,
//             color: isDarkMode ? '#F8F8F2' : '#282A36',
//             autoSkip: true
//           },
//           grid: {
//             display: true,
//             drawBorder: false,
//             color: isDarkMode ? 'rgba(98, 114, 164, 0.2)' : 'rgba(98, 114, 164, 0.25)',
//             drawTicks: true,
//             tickColor: isDarkMode ? 'rgba(98, 114, 164, 0.4)' : 'rgba(98, 114, 164, 0.4)',
//             borderColor: isDarkMode ? 'rgba(98, 114, 164, 0.4)' : 'rgba(98, 114, 164, 0.4)',
//             borderWidth: 1,
//             z: 0
//           },
//           border: {
//             display: true,
//             color: isDarkMode ? '#6272A4' : '#E0E0E0',
//             width: 1,
//             dash: [2, 4]
//           },
//           afterDataLimits: (scale) => {
//             const chart = scale.chart;
//             const xMin = chart.scales.x.min;
//             const xMax = chart.scales.x.max;
//             const visibleData = chart.data.datasets[0].data.filter((_, index) => {
//               const timestamp = chart.data.labels[index];
//               return timestamp >= xMin && timestamp <= xMax;
//             });
            
//             if (visibleData.length > 0) {
//               if (isTotal) {
//                 const max = Math.max(...visibleData);
//                 const min = Math.min(...visibleData);
//                 // 최소값과 최대값 사이 간격의 10%를 여백으로 사용
//                 const range = max - min;
//                 const padding = range * 0.1;
//                 // 최소 500바이트의 여백 또는 10%의 여백 중 큰 값을 사용
//                 const minPadding = Math.max(500, padding);
                
//                 // 최소값이 0에 가깝지 않은 경우에만 최소값에서 약간의 여백을 뺌
//                 const calculatedMin = min > 1000 ? Math.max(0, min - minPadding) : 0;
//                 const roundedMax = Math.ceil((max + minPadding) / 500) * 500;
                
//                 scale.min = calculatedMin;
//                 scale.max = roundedMax;
//               } else {
//                 const maxPositive = Math.max(...visibleData, 0);
//                 const maxNegative = Math.abs(Math.min(...visibleData, 0));
//                 const maxValue = Math.max(maxPositive, maxNegative);
//                 const roundedMax = Math.ceil((maxValue * 1.1) / 500) * 500;
                
//                 scale.min = -roundedMax;
//                 scale.max = roundedMax;
//               }
//             }
//           }
//         }
//       }
//     };
//   };

//   // 데이터 존재 여부 확인 로직 수정
//   const hasData = (data) => {
//     return data && data.length > 0 && data.some(item => item.totalBytes > 0 || item.change !== 0);
//   };

//   // 차트 생성 함수 수정
//   const createChart = (canvas, config) => {
//     if (!canvas) return null;
    
//     const ctx = canvas.getContext('2d');
//     const isLine = config.type === 'line';
    
//     // 과제 시작일과 마감일 가져오기
//     const startTime = assignment ? new Date(assignment.startDateTime).getTime() : new Date().getTime() - 86400000;
//     const endTime = assignment ? new Date(assignment.endDateTime).getTime() : new Date().getTime();
    
//     // 기본 차트 옵션 설정
//     const chartOptions = getChartOptions(isLine);
    
//     // x축 범위 설정
//     chartOptions.scales.x.min = startTime;
//     chartOptions.scales.x.max = endTime;
    
//     // 줌 제한 설정
//     chartOptions.plugins.zoom.limits = {
//       x: {
//         min: startTime,
//         max: Math.max(endTime, new Date().getTime()),
//         minRange: 60 * 1000 // 최소 1분
//       },
//       y: { min: 'original', max: 'original' }
//     };
    
//     // 데이터셋 스타일 설정
//     if (isLine) {
//       if (config.data.datasets && config.data.datasets.length > 0) {
//         config.data.datasets[0].borderColor = isDarkMode ? '#BD93F9' : '#6272A4';
//         config.data.datasets[0].borderWidth = 2;
//         config.data.datasets[0].pointRadius = 0;
//         config.data.datasets[0].pointHoverRadius = 3;
//         config.data.datasets[0].fill = false;
//         config.data.datasets[0].stepped = 'before';
//       }
//     } else {
//       // 막대 차트 설정
//       if (config.data.datasets && config.data.datasets.length > 0) {
//         config.data.datasets[0].barPercentage = 0.8;
//         config.data.datasets[0].categoryPercentage = 0.9;
//       }
//     }
    
//     const chart = new Chart(ctx, {
//       ...config,
//       options: chartOptions
//     });
    
//     // annotation 추가
//     addAnnotationsToChart(chart, isLine);
    
//     return chart;
//   };

//   // 차트 업데이트 함수 수정
//   const updateCharts = () => {
//     const sampledData = data ? downsampleData(data) : [];
    
//     // 총 코드량 차트 업데이트 또는 생성
//     if (totalChartInstance.current) {
//       updateChartData(totalChartInstance.current, sampledData, true);
//     } else if (totalBytesChartRef.current) {
//       totalChartInstance.current = createChart(totalBytesChartRef.current, {
//         type: 'line',
//         data: {
//           labels: sampledData.map(d => d.timestamp),
//           datasets: [{
//             label: '총 코드량 (바이트)',
//             data: sampledData.map(d => d.totalBytes),
//             borderColor: isDarkMode ? '#BD93F9' : '#6272A4',
//             borderWidth: 2,
//             pointRadius: 0,
//             pointHoverRadius: 3,
//             fill: false,
//             stepped: 'before'
//           }]
//         }
//       });
//     }

//     // 코드 변화량 차트 업데이트 또는 생성
//     if (changeChartInstance.current) {
//       updateChartData(changeChartInstance.current, sampledData, false);
//     } else if (changeChartRef.current) {
//       changeChartInstance.current = createChart(changeChartRef.current, {
//         type: 'bar',
//         data: {
//           labels: sampledData.map(d => d.timestamp),
//           datasets: [{
//             label: '코드 변화량 (바이트)',
//             data: sampledData.map(d => d.change),
//             backgroundColor: sampledData.map(d => 
//               d.change >= 0 
//                 ? isDarkMode ? 'rgba(80, 250, 123, 0.5)' : 'rgba(98, 114, 164, 0.5)'
//                 : isDarkMode ? 'rgba(255, 85, 85, 0.5)' : 'rgba(255, 121, 198, 0.5)'
//             ),
//             borderColor: sampledData.map(d =>
//               d.change >= 0 
//                 ? isDarkMode ? '#50FA7B' : '#6272A4'
//                 : isDarkMode ? '#FF5555' : '#FF79C6'
//             ),
//             borderWidth: 1
//           }]
//         }
//       });
//     }
//   };

//   // 차트 데이터 업데이트 함수 추가
//   const updateChartData = (chart, sampledData, isTotal) => {
//     if (!chart) return;

//     try {
//       // 현재 뷰 저장
//       const currentXMin = chart.scales.x.min;
//       const currentXMax = chart.scales.x.max;
//       const startTime = assignment ? new Date(assignment.startDateTime).getTime() : new Date().getTime() - 86400000;
//       const endTime = assignment ? Math.max(new Date(assignment.endDateTime).getTime(), new Date().getTime()) : new Date().getTime();
//       const hasCustomView = currentXMin !== undefined && currentXMax !== undefined &&
//                            (currentXMin !== startTime || currentXMax !== endTime);

//       // 데이터 업데이트
//       chart.data.labels = sampledData.map(d => d.timestamp);
      
//       if (isTotal) {
//         chart.data.datasets[0].data = sampledData.map(d => d.totalBytes);
//         chart.data.datasets[0].borderColor = isDarkMode ? '#BD93F9' : '#6272A4';
//         chart.data.datasets[0].borderWidth = 2;
//       } else {
//         chart.data.datasets[0].data = sampledData.map(d => d.change);
//         chart.data.datasets[0].backgroundColor = sampledData.map(d => 
//           d.change >= 0 
//             ? isDarkMode ? 'rgba(80, 250, 123, 0.5)' : 'rgba(98, 114, 164, 0.5)'
//             : isDarkMode ? 'rgba(255, 85, 85, 0.5)' : 'rgba(255, 121, 198, 0.5)'
//         );
//         chart.data.datasets[0].borderColor = sampledData.map(d =>
//           d.change >= 0 
//             ? isDarkMode ? '#50FA7B' : '#6272A4'
//             : isDarkMode ? '#FF5555' : '#FF79C6'
//         );
//       }

//       // 옵션 업데이트
//       Object.assign(chart.options, getChartOptions(isTotal));
      
//       // 시간 범위 설정
//       if (!hasCustomView) {
//         chart.options.scales.x.min = startTime;
//         chart.options.scales.x.max = endTime;
//       } else {
//         // 사용자가 설정한 뷰 유지
//         chart.options.scales.x.min = currentXMin;
//         chart.options.scales.x.max = currentXMax;
//       }

//       // 줌 제한 설정
//       chart.options.plugins.zoom.limits = {
//         x: {
//           min: startTime,
//           max: Math.max(endTime, new Date().getTime()),
//           minRange: 60 * 1000 // 최소 1분
//         },
//         y: { min: 'original', max: 'original' }
//       };

//       // 툴팁 초기화
//       chart.tooltip.setActiveElements([], { x: 0, y: 0 });
      
//       // annotation 업데이트
//       addAnnotationsToChart(chart, isTotal);

//       requestAnimationFrame(() => {
//         chart.update('none');
//       });
//     } catch (error) {
//       console.error('차트 업데이트 중 오류 발생:', error);
//     }
//   };

//   // 공통 유틸리티 함수들을 상단으로 이동
//   const calculateIntervalValue = (timeUnit, minuteValue) => {
//     const intervalMap = {
//       minute: parseInt(minuteValue),
//       hour: 60,
//       day: 1440,
//       week: 10080,
//       month: 43200
//     };
//     return intervalMap[timeUnit] || 1;
//   };

//   const processChartData = (rawData, assignment) => {
//     if (!rawData || !rawData.length) return [];
    
//     const chartData = rawData.map(item => ({
//       timestamp: parseTimestamp(item.timestamp),
//       totalBytes: item.total_size,
//       change: item.size_change
//     }));

//     // 과제 시작 시간 데이터 포인트 추가
//     if (assignment?.startDateTime && chartData.length > 0) {
//       const startTime = new Date(assignment.startDateTime).getTime();
//       const firstDataPoint = chartData[0];
      
//       if (firstDataPoint.timestamp > startTime) {
//         chartData.unshift({
//           timestamp: startTime,
//           totalBytes: 0,
//           change: 0
//         });
//       }
//     }

//     // 현재 시간까지 데이터 확장
//     const lastDataPoint = chartData[chartData.length - 1];
//     const currentTime = new Date().getTime();
    
//     if (lastDataPoint && lastDataPoint.timestamp < currentTime) {
//       let timeInterval = calculateTimeInterval(timeUnit, minuteValue);
//       let nextTimestamp = lastDataPoint.timestamp + timeInterval;
      
//       while (nextTimestamp <= currentTime) {
//         chartData.push({
//           timestamp: nextTimestamp,
//           totalBytes: lastDataPoint.totalBytes,
//           change: 0
//         });
//         nextTimestamp += timeInterval;
//       }
//     }

//     return chartData;
//   };

//   const calculateTimeInterval = (timeUnit, minuteValue) => {
//     const intervals = {
//       minute: parseInt(minuteValue) * 60 * 1000,
//       hour: 60 * 60 * 1000,
//       day: 24 * 60 * 60 * 1000,
//       week: 7 * 24 * 60 * 60 * 1000,
//       month: 30 * 24 * 60 * 60 * 1000
//     };
//     return intervals[timeUnit] || 5 * 60 * 1000;
//   };

//   const fetchMonitoringData = async (intervalValue, courseId, assignmentId, userId) => {
//     try {
//       // API 호출
//       const params = new URLSearchParams({
//         course: courseId,
//         assignment: assignmentId,
//         user: userId
//       });

//       const response = await api.get(`/api/watcher/graph_data/interval/${intervalValue}?${params}`);
      
//       // API 응답 데이터를 차트에 맞는 형식으로 변환
//       const chartData = processChartData(response.data.trends, assignment);
      
//       // 처리된 데이터 반환 (배열인지 확인)
//       return Array.isArray(chartData) ? chartData : [];
//     } catch (error) {
//       console.error('모니터링 데이터 조회 실패:', error);
//       return []; // 오류 발생 시 빈 배열 반환
//     }
//   };

//   // 로그 데이터를 가져오는 useEffect 추가
//   useEffect(() => {
//     if (!loading && courseId && assignmentId && userId) {
//       fetchRunLogs();
//       fetchBuildLogs();
//     }
//   }, [courseId, assignmentId, userId, loading]);

//   // 로그 데이터가 변경될 때 차트 annotation 업데이트
//   useEffect(() => {
//     if (totalChartInstance.current) {
//       addAnnotationsToChart(totalChartInstance.current, true);
//     }
//     if (changeChartInstance.current) {
//       addAnnotationsToChart(changeChartInstance.current, false);
//     }
//   }, [runLogs, buildLogs, isDarkMode]);

//   // 데이터 새로고침 함수에 로그 데이터 가져오기 추가
//   const handleDataRefresh = async (isSilent = false) => {
//     if (isRefreshing || (!isSilent && !totalChartInstance.current)) return;
    
//     try {
//       if (!isSilent) {
//         setIsRefreshing(true);
//       }
      
//       // 현재 차트 뷰 저장
//       const currentView = totalChartInstance.current ? {
//         xMin: totalChartInstance.current.scales.x.min,
//         xMax: totalChartInstance.current.scales.x.max
//       } : null;
      
//       const intervalValue = calculateIntervalValue(timeUnit, minuteValue);
//       const response = await fetchMonitoringData(intervalValue, courseId, assignmentId, userId);
//       const chartData = processChartData(response.data.trends, assignment);
      
//       if (!isSilent) {
//         setData(chartData);
//       } else {
//         updateChartsDirectly(chartData, currentView);
//       }
      
//       // 로그 데이터도 함께 새로고침
//       await Promise.all([
//         fetchRunLogs(),
//         fetchBuildLogs()
//       ]);
      
//       setLastUpdated(new Date());
//     } catch (error) {
//       console.error('데이터 새로고침 중 오류 발생:', error);
//       if (!isSilent) {
//         setError('데이터 업데이트에 실패했습니다.');
//       }
//     } finally {
//       if (!isSilent) {
//         setIsRefreshing(false);
//       }
//     }
//   };

//   const updateChartsDirectly = (chartData, currentView) => {
//     const sampledData = downsampleData(chartData);
    
//     [totalChartInstance, changeChartInstance].forEach((chartInstance, index) => {
//       if (!chartInstance.current) return;
      
//       const isTotal = index === 0;
//       try {
//         // 데이터 업데이트
//         chartInstance.current.data.labels = sampledData.map(d => d.timestamp);
//         chartInstance.current.data.datasets[0].data = sampledData.map(d => 
//           isTotal ? d.totalBytes : d.change
//         );
        
//         if (!isTotal) {
//           updateChangeChartColors(chartInstance.current, sampledData);
//         }
        
//         // 현재 뷰 유지
//         if (currentView) {
//           chartInstance.current.options.scales.x.min = currentView.xMin;
//           chartInstance.current.options.scales.x.max = currentView.xMax;
//         }
        
//         // 툴팁 초기화 및 차트 업데이트
//         chartInstance.current.tooltip.setActiveElements([], { x: 0, y: 0 });
//         chartInstance.current.update('none');
//       } catch (error) {
//         console.error(`${isTotal ? '총 코드량' : '코드 변화량'} 차트 업데이트 중 오류:`, error);
//       }
//     });
//   };

//   const updateChangeChartColors = (chart, data) => {
//     chart.data.datasets[0].backgroundColor = data.map(d => 
//       d.change >= 0 
//         ? isDarkMode ? 'rgba(80, 250, 123, 0.5)' : 'rgba(98, 114, 164, 0.5)'
//         : isDarkMode ? 'rgba(255, 85, 85, 0.5)' : 'rgba(255, 121, 198, 0.5)'
//     );
    
//     chart.data.datasets[0].borderColor = data.map(d =>
//       d.change >= 0 
//         ? isDarkMode ? '#50FA7B' : '#6272A4'
//         : isDarkMode ? '#FF5555' : '#FF79C6'
//     );
//   };

//   // 실행 로그 가져오기 함수
//   const fetchRunLogs = async () => {
//     try {
//       setLogsLoading(true);
//       const params = new URLSearchParams({
//         course: courseId,
//         assignment: assignmentId,
//         user: userId
//       });
      
//       const response = await api.get(`/api/watcher/logs/run?${params}`);
      
//       // 타임스탬프를 Date 객체로 변환하여 정렬
//       const logs = response.data.run_logs.map(log => ({
//         ...log,
//         timestamp: new Date(log.timestamp).getTime()
//       })).sort((a, b) => a.timestamp - b.timestamp);
      
//       setRunLogs(logs);
//     } catch (error) {
//       console.error('실행 로그를 불러오는데 실패했습니다:', error);
//     } finally {
//       setLogsLoading(false);
//     }
//   };

//   // 빌드 로그 가져오기 함수
//   const fetchBuildLogs = async () => {
//     try {
//       setLogsLoading(true);
//       const params = new URLSearchParams({
//         course: courseId,
//         assignment: assignmentId,
//         user: userId
//       });
      
//       const response = await api.get(`/api/watcher/logs/build?${params}`);
      
//       // 타임스탬프를 Date 객체로 변환하여 정렬
//       const logs = response.data.build_logs.map(log => ({
//         ...log,
//         timestamp: new Date(log.timestamp).getTime()
//       })).sort((a, b) => a.timestamp - b.timestamp);
      
//       setBuildLogs(logs);
//     } catch (error) {
//       console.error('빌드 로그를 불러오는데 실패했습니다:', error);
//     } finally {
//       setLogsLoading(false);
//     }
//   };

//   // 로그 다이얼로그 열기 함수
//   const handleLogClick = (log, type) => {
//     setSelectedLog({ ...log, type });
//     setLogDialogOpen(true);
//   };

//   // 로그 다이얼로그 닫기 함수
//   const handleCloseLogDialog = () => {
//     setLogDialogOpen(false);
//     setSelectedLog(null);
//   };

//   // 로그 다이얼로그 렌더링 함수
//   const renderLogDialog = () => {
//     if (!selectedLog) return null;
    
//     const isRunLog = selectedLog.type === 'run';
//     const title = isRunLog ? '실행 로그 정보' : '빌드 로그 정보';
//     const statusText = selectedLog.exit_code === 0 ? '성공' : '실패';
//     const statusColor = selectedLog.exit_code === 0 ? 
//       (isDarkMode ? '#50FA7B' : '#4CAF50') : 
//       (isDarkMode ? '#FF5555' : '#F44336');
    
//     return (
//       <Dialog 
//         open={logDialogOpen} 
//         onClose={handleCloseLogDialog}
//         maxWidth="md"
//         fullWidth
//         PaperProps={{
//           style: {
//             borderRadius: '8px',
//             boxShadow: isDarkMode ? 
//               '0 4px 20px rgba(0, 0, 0, 0.3)' : 
//               '0 4px 20px rgba(0, 0, 0, 0.1)',
//             backgroundColor: isDarkMode ? '#282A36' : '#FFFFFF'
//           }
//         }}
//       >
//         <DialogTitle sx={{ 
//           fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'space-between',
//           padding: '20px 24px'
//         }}>
//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//             {isRunLog ? '▶️' : '🔨'} {title}
//             <Chip 
//               label={statusText} 
//               size="small" 
//               sx={{ 
//                 ml: 1,
//                 backgroundColor: statusColor,
//                 color: '#FFF',
//                 fontWeight: 'bold'
//               }} 
//             />
//           </Box>
//           <IconButton 
//             onClick={handleCloseLogDialog}
//             size="small"
//             sx={{ color: isDarkMode ? '#6272A4' : '#9E9E9E' }}
//           >
//             <CloseIcon fontSize="small" />
//           </IconButton>
//         </DialogTitle>
//         <DialogContent sx={{ 
//           padding: '24px',
//           backgroundColor: isDarkMode ? '#282A36' : '#FFFFFF'
//         }}>
//           <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
//             {/* 왼쪽 컬럼 */}
//             <Box>
//               <Typography variant="subtitle2" sx={{ 
//                 color: isDarkMode ? '#F8F8F2' : '#282A36',
//                 mb: 2,
//                 fontWeight: 'bold',
//                 fontSize: '1rem',
//                 borderBottom: `2px solid ${isDarkMode ? '#BD93F9' : '#6272A4'}`,
//                 paddingBottom: '8px'
//               }}>
//                 기본 정보
//               </Typography>
              
//               <Paper elevation={0} sx={{ 
//                 p: 3, 
//                 backgroundColor: isDarkMode ? '#44475A' : '#F5F5F5',
//                 borderRadius: '4px',
//                 mb: 2
//               }}>
//                 <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                   <Box>
//                     <Typography variant="caption" sx={{ 
//                       color: isDarkMode ? '#6272A4' : '#757575',
//                       display: 'block',
//                       mb: 1,
//                       fontWeight: 'bold'
//                     }}>
//                       상태
//                     </Typography>
//                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                       <Typography variant="body2" sx={{ 
//                         fontFamily: "'JetBrains Mono', monospace",
//                         color: statusColor,
//                         fontWeight: 'bold'
//                       }}>
//                         {statusText} (종료 코드: {selectedLog.exit_code})
//                       </Typography>
//                     </Box>
//                   </Box>
                  
//                   <Box>
//                     <Typography variant="caption" sx={{ 
//                       color: isDarkMode ? '#6272A4' : '#757575',
//                       display: 'block',
//                       mb: 1,
//                       fontWeight: 'bold'
//                     }}>
//                       타임스탬프
//                     </Typography>
//                     <Typography variant="body2" sx={{ 
//                       fontFamily: "'JetBrains Mono', monospace",
//                       color: isDarkMode ? '#F8F8F2' : '#282A36'
//                     }}>
//                       {new Date(selectedLog.timestamp).toLocaleString()}
//                     </Typography>
//                   </Box>
                  
//                   {isRunLog && (
//                     <Box>
//                       <Typography variant="caption" sx={{ 
//                         color: isDarkMode ? '#6272A4' : '#757575',
//                         display: 'block',
//                         mb: 1,
//                         fontWeight: 'bold'
//                       }}>
//                         프로세스 유형
//                       </Typography>
//                       <Typography variant="body2" sx={{ 
//                         fontFamily: "'JetBrains Mono', monospace",
//                         color: isDarkMode ? '#F8F8F2' : '#282A36'
//                       }}>
//                         {selectedLog.process_type}
//                       </Typography>
//                     </Box>
//                   )}
                  
//                   {/* {!isRunLog && (
//                     <Box>
//                       <Typography variant="caption" sx={{ 
//                         color: isDarkMode ? '#6272A4' : '#757575',
//                         display: 'block',
//                         mb: 1,
//                         fontWeight: 'bold'
//                       }}>
//                         파일 크기
//                       </Typography>
//                       <Typography variant="body2" sx={{ 
//                         fontFamily: "'JetBrains Mono', monospace",
//                         color: isDarkMode ? '#F8F8F2' : '#282A36'
//                       }}>
//                         {formatBytes(selectedLog.file_size)}
//                       </Typography>
//                     </Box>
//                   )} */}
//                 </Box>
//               </Paper>
//             </Box>
            
//             {/* 오른쪽 컬럼 */}
//             <Box>
//               <Typography variant="subtitle2" sx={{ 
//                 color: isDarkMode ? '#F8F8F2' : '#282A36',
//                 mb: 2,
//                 fontWeight: 'bold',
//                 fontSize: '1rem',
//                 borderBottom: `2px solid ${isDarkMode ? '#BD93F9' : '#6272A4'}`,
//                 paddingBottom: '8px'
//               }}>
//                 경로 정보
//               </Typography>
              
//               <Paper elevation={0} sx={{ 
//                 p: 3, 
//                 backgroundColor: isDarkMode ? '#44475A' : '#F5F5F5',
//                 borderRadius: '4px',
//                 mb: 2
//               }}>
//                 <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                   <Box>
//                     <Typography variant="caption" sx={{ 
//                       color: isDarkMode ? '#6272A4' : '#757575',
//                       display: 'block',
//                       mb: 1,
//                       fontWeight: 'bold'
//                     }}>
//                       작업 디렉토리
//                     </Typography>
//                     <Typography variant="body2" sx={{ 
//                       fontFamily: "'JetBrains Mono', monospace",
//                       wordBreak: 'break-all',
//                       color: isDarkMode ? '#F8F8F2' : '#282A36'
//                     }}>
//                       {selectedLog.cwd}
//                     </Typography>
//                   </Box>
                  
//                   <Box>
//                     <Typography variant="caption" sx={{ 
//                       color: isDarkMode ? '#6272A4' : '#757575',
//                       display: 'block',
//                       mb: 1,
//                       fontWeight: 'bold'
//                     }}>
//                       대상 파일
//                     </Typography>
//                     <Typography variant="body2" sx={{ 
//                       fontFamily: "'JetBrains Mono', monospace",
//                       wordBreak: 'break-all',
//                       color: isDarkMode ? '#F8F8F2' : '#282A36'
//                     }}>
//                       {selectedLog.target_path}
//                     </Typography>
//                   </Box>
                  
//                   {!isRunLog && (
//                     <Box>
//                       <Typography variant="caption" sx={{ 
//                         color: isDarkMode ? '#6272A4' : '#757575',
//                         display: 'block',
//                         mb: 1,
//                         fontWeight: 'bold'
//                       }}>
//                         바이너리 경로
//                       </Typography>
//                       <Typography variant="body2" sx={{ 
//                         fontFamily: "'JetBrains Mono', monospace",
//                         wordBreak: 'break-all',
//                         color: isDarkMode ? '#F8F8F2' : '#282A36'
//                       }}>
//                         {selectedLog.binary_path}
//                       </Typography>
//                     </Box>
//                   )}
//                 </Box>
//               </Paper>
//             </Box>
//           </Box>
          
//           {/* 명령어 정보 (전체 너비) */}
//           <Box sx={{ mt: 4 }}>
//             <Typography variant="subtitle2" sx={{ 
//               color: isDarkMode ? '#F8F8F2' : '#282A36',
//               mb: 2,
//               fontWeight: 'bold',
//               fontSize: '1rem',
//               borderBottom: `2px solid ${isDarkMode ? '#BD93F9' : '#6272A4'}`,
//               paddingBottom: '8px'
//             }}>
//               명령어
//             </Typography>
            
//             <Paper elevation={0} sx={{ 
//               p: 3, 
//               backgroundColor: isDarkMode ? '#44475A' : '#F5F5F5',
//               borderRadius: '4px',
//               fontFamily: "'JetBrains Mono', monospace",
//               fontSize: '0.9rem',
//               overflowX: 'auto',
//               color: isDarkMode ? '#F8F8F2' : '#282A36'
//             }}>
//               {selectedLog.cmdline}
//             </Paper>
//           </Box>
//         </DialogContent>
//       </Dialog>
//     );
//   };

//   // 차트에 annotation 추가 함수 수정
//   const addAnnotationsToChart = (chart, isTotal = true) => {
//     if (!chart || !chart.options) return;
    
//     // 기존 annotation 초기화
//     chart.options.plugins.annotation = {
//       annotations: {},
//       interaction: {
//         mode: 'point',  // nearest에서 point로 변경
//         axis: 'xy',
//         intersect: false
//       }
//     };
    
//     // 막대 그래프(코드 변화량 차트)에는 annotation을 표시하지 않음
//     if (!isTotal) {
//       return;
//     }
    
//     // 실행 로그 annotation 추가 (showRunLogs가 true일 때만)
//     if(showRunLogs) {
//       runLogs.forEach((log, index) => {
//         const isSuccess = log.exit_code === 0;
        
//         // 성공/실패 필터링 적용
//         if ((isSuccess && !showSuccessLogs) || (!isSuccess && !showFailLogs)) {
//           return;
//         }
        
//         const logId = `run-${index}`;
//         // 실행 로그 주변에 박스 추가 (모든 로그에 대해)
//         const boxId = `run-box-${index}`;
//         const oneSecond = 1000; // 1초 (밀리초 단위)
        
//         // 라벨만 따로 추가 (항상 표시)
//         const labelId = `run-label-${index}`;
//         chart.options.plugins.annotation.annotations[labelId] = {
//           type: 'line',
//           xMin: log.timestamp,
//           xMax: log.timestamp,
//           borderColor: 'transparent',
//           borderWidth: 0,
//           drawTime: 'afterDatasetsDraw',
//           label: {
//             display: true,
//             content: `실행 ${isSuccess ? '성공' : '실패'}`,
//             position: 'end',
//             yAdjust: 0, 
//             xAdjust: 0,
//             backgroundColor: isSuccess ? 
//               (isDarkMode ? 'rgba(80, 250, 123, 0.7)' : 'rgba(76, 175, 80, 0.7)') : 
//               (isDarkMode ? 'rgba(255, 85, 85, 0.7)' : 'rgba(244, 67, 54, 0.7)'),
//             color: isDarkMode ? '#282A36' : '#FFFFFF',
//             font: {
//               size: 10,
//               weight: 'bold'
//             },
//             padding: 4
//           }
//         };
        
//         // 박스 추가
//         chart.options.plugins.annotation.annotations[boxId] = {
//           type: 'box',
//           backgroundColor: isSuccess ? 
//             (isDarkMode ? 'rgba(80, 250, 123, 0.05)' : 'rgba(76, 175, 80, 0.05)') : 
//             (isDarkMode ? 'rgba(255, 85, 85, 0.05)' : 'rgba(244, 67, 54, 0.05)'),
//           borderColor: isSuccess ? 
//             (isDarkMode ? 'rgba(80, 250, 123, 0.2)' : 'rgba(76, 175, 80, 0.2)') : 
//             (isDarkMode ? 'rgba(255, 85, 85, 0.2)' : 'rgba(244, 67, 54, 0.2)'),
//           borderWidth: 1,
//           xMin: log.timestamp - oneSecond,
//           xMax: log.timestamp + oneSecond,
//           yScaleID: 'y',
//           drawTime: 'beforeDatasetsDraw',
//           label: {
//             display: false
//           },
//           enter: function({element}) {
//             // 박스 크기 확대
//             element.options.backgroundColor = isSuccess ? 
//               (isDarkMode ? 'rgba(80, 250, 123, 0.15)' : 'rgba(76, 175, 80, 0.15)') : 
//               (isDarkMode ? 'rgba(255, 85, 85, 0.15)' : 'rgba(244, 67, 54, 0.15)');
//             element.options.borderColor = isSuccess ? 
//               (isDarkMode ? 'rgba(80, 250, 123, 0.5)' : 'rgba(76, 175, 80, 0.5)') : 
//               (isDarkMode ? 'rgba(255, 85, 85, 0.5)' : 'rgba(244, 67, 54, 0.5)');
//             element.options.borderWidth = 2;
            
//             // 라벨 강조
//             const label = chart.options.plugins.annotation.annotations[labelId].label;
//             label.font.size = 12;
//             label.backgroundColor = isSuccess ? 
//               (isDarkMode ? 'rgba(80, 250, 123, 0.9)' : 'rgba(76, 175, 80, 0.9)') : 
//               (isDarkMode ? 'rgba(255, 85, 85, 0.9)' : 'rgba(244, 67, 54, 0.9)');
            
//             return true;
//           },
//           leave: function({element}) {
//             // 원래 크기로 복원
//             element.options.backgroundColor = isSuccess ? 
//               (isDarkMode ? 'rgba(80, 250, 123, 0.05)' : 'rgba(76, 175, 80, 0.05)') : 
//               (isDarkMode ? 'rgba(255, 85, 85, 0.05)' : 'rgba(244, 67, 54, 0.05)');
//             element.options.borderColor = isSuccess ? 
//               (isDarkMode ? 'rgba(80, 250, 123, 0.2)' : 'rgba(76, 175, 80, 0.2)') : 
//               (isDarkMode ? 'rgba(255, 85, 85, 0.2)' : 'rgba(244, 67, 54, 0.2)');
//             element.options.borderWidth = 1;
            
//             // 라벨 복원
//             const label = chart.options.plugins.annotation.annotations[labelId].label;
//             label.font.size = 10;
//             label.backgroundColor = isSuccess ? 
//               (isDarkMode ? 'rgba(80, 250, 123, 0.7)' : 'rgba(76, 175, 80, 0.7)') : 
//               (isDarkMode ? 'rgba(255, 85, 85, 0.7)' : 'rgba(244, 67, 54, 0.7)');
            
//             return true;
//           },
//           click: function() {
//             // 박스 클릭 시 해당 로그 정보를 보여주는 다이얼로그 표시
//             handleLogClick(log, 'run');
//           }
//         };
//       });
//     }
    
//     // 빌드 로그 annotation 추가 (showBuildLogs가 true일 때만)
//     if(showBuildLogs) {
//       buildLogs.forEach((log, index) => {
//         const isSuccess = log.exit_code === 0;
        
//         // 성공/실패 필터링 적용
//         if ((isSuccess && !showSuccessLogs) || (!isSuccess && !showFailLogs)) {
//           return;
//         }
        
//         const logId = `build-${index}`;
//         // 빌드 로그 주변에 박스 추가 (모든 로그에 대해)
//         const boxId = `build-box-${index}`;
//         const oneSecond = 1000; // 1초 (밀리초 단위)
        
//         // 라벨만 따로 추가 (항상 표시)
//         const labelId = `build-label-${index}`;
//         chart.options.plugins.annotation.annotations[labelId] = {
//           type: 'line',
//           xMin: log.timestamp,
//           xMax: log.timestamp,
//           borderColor: 'transparent',
//           borderWidth: 0,
//           drawTime: 'afterDatasetsDraw',
//           label: {
//             display: true,
//             content: `빌드 ${isSuccess ? '성공' : '실패'}`,
//             position: 'end',
//             yAdjust: 0,
//             xAdjust: 0,
//             backgroundColor: isSuccess ? 
//               (isDarkMode ? 'rgba(139, 233, 253, 0.7)' : 'rgba(33, 150, 243, 0.7)') : 
//               (isDarkMode ? 'rgba(255, 184, 108, 0.7)' : 'rgba(255, 152, 0, 0.7)'),
//             color: isDarkMode ? '#282A36' : '#FFFFFF',
//             font: {
//               size: 10,
//               weight: 'bold'
//             },
//             padding: 4
//           }
//         };
        
//         // 박스 추가
//         chart.options.plugins.annotation.annotations[boxId] = {
//           type: 'box',
//           backgroundColor: isSuccess ? 
//             (isDarkMode ? 'rgba(139, 233, 253, 0.05)' : 'rgba(33, 150, 243, 0.05)') : 
//             (isDarkMode ? 'rgba(255, 184, 108, 0.05)' : 'rgba(255, 152, 0, 0.05)'),
//           borderColor: isSuccess ? 
//             (isDarkMode ? 'rgba(139, 233, 253, 0.2)' : 'rgba(33, 150, 243, 0.2)') : 
//             (isDarkMode ? 'rgba(255, 184, 108, 0.2)' : 'rgba(255, 152, 0, 0.2)'),
//           borderWidth: 1,
//           xMin: log.timestamp - oneSecond,
//           xMax: log.timestamp + oneSecond,
//           yScaleID: 'y',
//           drawTime: 'beforeDatasetsDraw',
//           label: {
//             display: false
//           },
//           enter: function({element}) {
//             // 박스 크기 확대
//             element.options.backgroundColor = isSuccess ? 
//               (isDarkMode ? 'rgba(139, 233, 253, 0.15)' : 'rgba(33, 150, 243, 0.15)') : 
//               (isDarkMode ? 'rgba(255, 184, 108, 0.15)' : 'rgba(255, 152, 0, 0.15)');
//             element.options.borderColor = isSuccess ? 
//               (isDarkMode ? 'rgba(139, 233, 253, 0.5)' : 'rgba(33, 150, 243, 0.5)') : 
//               (isDarkMode ? 'rgba(255, 184, 108, 0.5)' : 'rgba(255, 152, 0, 0.5)');
//             element.options.borderWidth = 2;
            
//             // 라벨 강조
//             const label = chart.options.plugins.annotation.annotations[labelId].label;
//             label.font.size = 12;
//             label.backgroundColor = isSuccess ? 
//               (isDarkMode ? 'rgba(139, 233, 253, 0.9)' : 'rgba(33, 150, 243, 0.9)') : 
//               (isDarkMode ? 'rgba(255, 184, 108, 0.9)' : 'rgba(255, 152, 0, 0.9)');
            
//             return true;
//           },
//           leave: function({element}) {
//             // 원래 크기로 복원
//             element.options.backgroundColor = isSuccess ? 
//               (isDarkMode ? 'rgba(139, 233, 253, 0.05)' : 'rgba(33, 150, 243, 0.05)') : 
//               (isDarkMode ? 'rgba(255, 184, 108, 0.05)' : 'rgba(255, 152, 0, 0.05)');
//             element.options.borderColor = isSuccess ? 
//               (isDarkMode ? 'rgba(139, 233, 253, 0.2)' : 'rgba(33, 150, 243, 0.2)') : 
//               (isDarkMode ? 'rgba(255, 184, 108, 0.2)' : 'rgba(255, 152, 0, 0.2)');
//             element.options.borderWidth = 1;
            
//             // 라벨 복원
//             const label = chart.options.plugins.annotation.annotations[labelId].label;
//             label.font.size = 10;
//             label.backgroundColor = isSuccess ? 
//               (isDarkMode ? 'rgba(139, 233, 253, 0.7)' : 'rgba(33, 150, 243, 0.7)') : 
//               (isDarkMode ? 'rgba(255, 184, 108, 0.7)' : 'rgba(255, 152, 0, 0.7)');
            
//             return true;
//           },
//           click: function() {
//             // 박스 클릭 시 해당 로그 정보를 보여주는 다이얼로그 표시
//             handleLogClick(log, 'build');
//           }
//         };
//       });
//     }
    
//     // 차트 업데이트
//     chart.update('none');
//   };

//   // 데이터 로드 및 차트 초기화
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setIsRefreshing(true);

//         // 과제 정보 조회
//         const assignmentResponse = await api.get(`/api/courses/${courseId}/assignments`);
//         const currentAssignment = assignmentResponse.data.find(a => a.assignmentId === parseInt(assignmentId));
//         setAssignment(currentAssignment);

//         // 강의 정보 조회
//         const coursesResponse = await api.get(`/api/courses/${courseId}/details`);
//         setCourse(coursesResponse.data);

//         // 학생 정보 조회 - 사용자 역할에 따라 다르게 처리
//         // 사용자 정보가 있는 경우에만 처리
//         if (user) {
//           if (user.role === 'STUDENT') {
//             // 학생인 경우 자신의 정보를 student 상태에 설정
//             setStudent(user);
//           } else {
//             // 교수/조교인 경우 해당 학생의 정보를 가져옴
//             const studentsResponse = await api.get(`/api/courses/${courseId}/users`);
//             const currentStudent = studentsResponse.data.find(s => s.userId === parseInt(userId));
            
//             if (!currentStudent) {
//               throw new Error('학생 정보를 찾을 수 없습니다.');
//             }
//             setStudent(currentStudent);
//           }
//         }

//         // interval 값 계산
//         const intervalValue = calculateIntervalValue(timeUnit, minuteValue);

//         // 모니터링 데이터 조회
//         const params = new URLSearchParams({
//           course: courseId,
//           assignment: assignmentId,
//           user: userId
//         });

//         const monitoringResponse = await api.get(`/api/watcher/graph_data/interval/${intervalValue}?${params}`);
        
//         // processChartData 함수를 사용하여 데이터 처리
//         const chartData = processChartData(monitoringResponse.data.trends, currentAssignment);
        
//         setData(chartData);
//         setLastUpdated(new Date());
//         setLoading(false);
//         setIsRefreshing(false);
//       } catch (error) {
//         console.error('데이터 로드 실패:', error);
//         setError('데이터를 불러오는데 실패했습니다.');
//         setLoading(false);
//         setIsRefreshing(false);
//       }
//     };

//     // user 정보가 있을 때만 fetchData 실행
//     if (user) {
//       fetchData();
//     }
//   }, [courseId, assignmentId, userId, timeUnit, minuteValue, user]); // user를 의존성 배열에 추가

//   // user 정보를 가져오는 useEffect 추가 (다른 useEffect들 위에 배치)
//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const response = await api.get('/api/users/me');
//         setUser(response.data);
//       } catch (error) {
//         console.error('사용자 정보를 불러오는데 실패했습니다:', error);
//         setError('사용자 정보를 불러오는데 실패했습니다.');
//       }
//     };
//     fetchUser();
//   }, []);

//   // useEffect 수정
//   useEffect(() => {
//     if (autoRefresh && !loading) {
//       if (autoRefreshIntervalRef.current) {
//         clearInterval(autoRefreshIntervalRef.current);
//       }
      
//       autoRefreshIntervalRef.current = setInterval(() => {
//         handleDataRefresh(true);
//       }, 60000);
      
//       handleDataRefresh(true);
//     } else {
//       if (autoRefreshIntervalRef.current) {
//         clearInterval(autoRefreshIntervalRef.current);
//         autoRefreshIntervalRef.current = null;
//       }
//     }
    
//     return () => {
//       if (autoRefreshIntervalRef.current) {
//         clearInterval(autoRefreshIntervalRef.current);
//         autoRefreshIntervalRef.current = null;
//       }
//     };
//   }, [autoRefresh, loading, timeUnit, minuteValue]);

//   // 데이터가 변경될 때마다 차트 업데이트
//   useEffect(() => {
//     updateCharts();
//   }, [data]);

//   // 테마 변경 감지 및 차트 업데이트
//   useEffect(() => {
//     if (totalChartInstance.current) {
//       totalChartInstance.current.destroy();
//       totalChartInstance.current = null;
//     }
//     if (changeChartInstance.current) {
//       changeChartInstance.current.destroy();
//       changeChartInstance.current = null;
//     }
//     updateCharts();
//   }, [isDarkMode]);

//   // 컴포넌트 언마운트 시 차트 정리
//   useEffect(() => {
//     return () => {
//       if (totalChartInstance.current) {
//         totalChartInstance.current.destroy();
//         totalChartInstance.current = null;
//       }
//       if (changeChartInstance.current) {
//         changeChartInstance.current.destroy();
//         changeChartInstance.current = null;
//       }
//     };
//   }, []);

//   // 시간 단위 변경 핸들러
//   const handleTimeUnitChange = (event, newValue) => {
//     if (isUpdating.current || !newValue) return;
//     isUpdating.current = true;

//     try {
//       setTimeUnit(newValue);
      
//       // 부분적인 로딩 상태로 설정
//       setIsRefreshing(true);
      
//       // 비동기적으로 데이터 가져오기
//       const fetchTimeUnitData = async () => {
//         try {
//           // interval 값 계산
//           const intervalValue = calculateIntervalValue(newValue, minuteValue);
          
//           // 데이터 가져오기
//           const newData = await fetchMonitoringData(
//             intervalValue,
//             courseId,
//             assignmentId,
//             userId
//           );
          
//           // 차트 인스턴스 초기화
//           if (totalChartInstance.current) {
//             totalChartInstance.current.destroy();
//             totalChartInstance.current = null;
//           }
//           if (changeChartInstance.current) {
//             changeChartInstance.current.destroy();
//             changeChartInstance.current = null;
//           }
          
//           // 데이터 업데이트 및 차트 다시 그리기
//           setData(newData);
//           setLastUpdated(new Date());
          
//           // 로딩 상태 해제
//           setIsRefreshing(false);
//         } catch (error) {
//           console.error('데이터 업데이트 실패:', error);
//           setError('데이터를 업데이트하는데 실패했습니다.');
//           setIsRefreshing(false);
//         } finally {
//           isUpdating.current = false;
//         }
//       };
      
//       fetchTimeUnitData();
//     } catch (error) {
//       console.error('시간 단위 변경 실패:', error);
//       isUpdating.current = false;
//       setIsRefreshing(false);
//     }
//   };

//   const handleMinuteChange = (event) => {
//     if (isUpdating.current) return;
//     isUpdating.current = true;

//     try {
//       const newMinuteValue = event.target.value;
//       setMinuteValue(newMinuteValue);
//       setTimeUnit('minute');
      
//       // 부분적인 로딩 상태로 설정
//       setIsRefreshing(true);
      
//       // 비동기적으로 데이터 가져오기
//       const fetchMinuteData = async () => {
//         try {
//           // interval 값 계산
//           const intervalValue = calculateIntervalValue('minute', newMinuteValue);
          
//           // 데이터 가져오기
//           const newData = await fetchMonitoringData(
//             intervalValue,
//             courseId,
//             assignmentId,
//             userId
//           );
          
//           // 차트 인스턴스 초기화
//           if (totalChartInstance.current) {
//             totalChartInstance.current.destroy();
//             totalChartInstance.current = null;
//           }
//           if (changeChartInstance.current) {
//             changeChartInstance.current.destroy();
//             changeChartInstance.current = null;
//           }
          
//           // 데이터 업데이트 및 차트 다시 그리기
//           setData(newData);
//           setLastUpdated(new Date());
          
//           // 로딩 상태 해제
//           setIsRefreshing(false);
//         } catch (error) {
//           console.error('데이터 업데이트 실패:', error);
//           setError('데이터를 업데이트하는데 실패했습니다.');
//           setIsRefreshing(false);
//         } finally {
//           isUpdating.current = false;
//         }
//       };
      
//       fetchMinuteData();
//     } catch (error) {
//       console.error('분 단위 변경 실패:', error);
//       isUpdating.current = false;
//       setIsRefreshing(false);
//     }
//   };

//   // y축 범위를 계산하는 함수 수정
//   const calculateYAxisRange = (chart, isTotal) => {
//     const xMin = chart.scales.x.min;
//     const xMax = chart.scales.x.max;
//     const visibleData = chart.data.datasets[0].data.filter((_, index) => {
//       const timestamp = chart.data.labels[index];
//       return timestamp >= xMin && timestamp <= xMax;
//     });
    
//     if (visibleData.length > 0) {
//       if (isTotal) {
//         // 총 코드량 차트
//         const max = Math.max(...visibleData);
//         const min = Math.min(...visibleData);
//         // 최소값과 최대값 사이 간격의 10%를 여백으로 사용
//         const range = max - min;
//         const padding = range * 0.1;
//         // 최소 500바이트의 여백 또는 10%의 여백 중 큰 값을 사용
//         const minPadding = Math.max(500, padding);
        
//         // 최소값이 0에 가깝지 않은 경우에만 최소값에서 약간의 여백을 뺌
//         const calculatedMin = min > 1000 ? Math.max(0, min - minPadding) : 0;
//         const roundedMax = Math.ceil((max + minPadding) / 500) * 500;
        
//         chart.options.scales.y.min = calculatedMin;
//         chart.options.scales.y.max = roundedMax;
//       } else {
//         // 변화량 차트
//         const maxPositive = Math.max(...visibleData, 0);
//         const maxNegative = Math.abs(Math.min(...visibleData, 0));
//         const maxValue = Math.max(maxPositive, maxNegative);
//         // 500의 배수로 올림
//         const roundedMax = Math.ceil((maxValue * 1.1) / 500) * 500;
        
//         chart.options.scales.y.min = -roundedMax;
//         chart.options.scales.y.max = roundedMax;
//       }
//     }
//   };

//   // 로그 주석 토글 핸들러 추가
//   const handleToggleLogAnnotations = () => {
//     setShowRunLogs(!showRunLogs);
//     setShowBuildLogs(!showBuildLogs);
    
//     // 즉시 차트 업데이트
//     if (totalChartInstance.current) {
//       addAnnotationsToChart(totalChartInstance.current, true);
//     }
//     if (changeChartInstance.current) {
//       addAnnotationsToChart(changeChartInstance.current, false);
//     }
//   };

//   // 실행 로그 토글 핸들러
//   const handleToggleRunLogs = () => {
//     setShowRunLogs(!showRunLogs);
    
//     // 차트 업데이트
//     if (totalChartInstance.current) {
//       addAnnotationsToChart(totalChartInstance.current, true);
//     }
//   };

//   // 빌드 로그 토글 핸들러
//   const handleToggleBuildLogs = () => {
//     setShowBuildLogs(!showBuildLogs);
    
//     // 차트 업데이트
//     if (totalChartInstance.current) {
//       addAnnotationsToChart(totalChartInstance.current, true);
//     }
//   };

//   // 성공/실패 로그 토글 핸들러 추가
//   const handleToggleSuccessLogs = () => {
//     setShowSuccessLogs(!showSuccessLogs);
    
//     if (totalChartInstance.current) {
//       addAnnotationsToChart(totalChartInstance.current, true);
//     }
//   };

//   const handleToggleFailLogs = () => {
//     setShowFailLogs(!showFailLogs);
    
//     if (totalChartInstance.current) {
//       addAnnotationsToChart(totalChartInstance.current, true);
//     }
//   };

//   // 변경된 상태가 차트에 반영되도록 수정
//   useEffect(() => {
//     if (totalChartInstance.current) {
//       addAnnotationsToChart(totalChartInstance.current, true);
//     }
//     if (changeChartInstance.current) {
//       addAnnotationsToChart(changeChartInstance.current, false);
//     }
//   }, [showRunLogs, showBuildLogs, showSuccessLogs, showFailLogs]);

//   if (loading) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <Container maxWidth={false} sx={{ mt: 2, px: 2 }}>
//       <Paper elevation={0} sx={{
//         p: 3,
//         backgroundColor: (theme) =>
//           theme.palette.mode === 'dark' ? '#282A36' : '#FFFFFF',
//         border: (theme) =>
//           `1px solid ${theme.palette.mode === 'dark' ? '#44475A' : '#E0E0E0'}`,
//         borderRadius: '16px'
//       }}>
//         <WatcherBreadcrumbs
//           paths={[
//             {
//               text: course?.courseName || '로딩중...',
//               to: `/watcher/class/${courseId}`
//             },
//             {
//               text: assignment?.assignmentName || '로딩중...',
//               to: `/watcher/class/${courseId}/assignment/${assignmentId}`
//             },
//             {
//               text: 'Watcher',
//               to: `/watcher/class/${courseId}/assignment/${assignmentId}/monitoring/${userId}`
//             }
//           ]}
//         />

//         <Box sx={{ mb: 4 }}>
//           <Typography variant="h5" gutterBottom sx={{ 
//             fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
//             mb: 2
//           }}>
//             {assignment?.assignmentName}
//           </Typography>
//           <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
//             <Chip 
//               label={`학번: ${student?.studentNum || '로딩중...'}`}
//               sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
//             />
//             <Chip 
//               label={`이름: ${student?.name || '로딩중...'}`}
//               sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
//             />
//             <Chip 
//               label={`이메일: ${student?.email || '로딩중...'}`}
//               sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
//             />
//           </Box>
//         </Box>

//         <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//             <FormControl size="small" sx={{ minWidth: 120 }}>
//               <InputLabel>분</InputLabel>
//               <Select
//                 value={minuteValue}
//                 label="분"
//                 onChange={handleMinuteChange}
//                 onClick={() => setTimeUnit('minute')}
//                 sx={{
//                   backgroundColor: isDarkMode ? 'rgba(68, 71, 90, 0.5)' : 'rgba(248, 248, 242, 0.9)',
//                   '& .MuiOutlinedInput-notchedOutline': {
//                     borderColor: isDarkMode ? '#6272A4' : '#BD93F9'
//                   },
//                   '&:hover .MuiOutlinedInput-notchedOutline': {
//                     borderColor: isDarkMode ? '#8BE9FD' : '#6272A4'
//                   }
//                 }}
//               >
//                 <MenuItem value="1">1분</MenuItem>
//                 <MenuItem value="3">3분</MenuItem>
//                 <MenuItem value="5">5분</MenuItem>
//                 <MenuItem value="10">10분</MenuItem>
//                 <MenuItem value="15">15분</MenuItem>
//                 <MenuItem value="30">30분</MenuItem>
//                 <MenuItem value="60">60분</MenuItem>
//               </Select>
//             </FormControl>
//             <ToggleButtonGroup
//               value={timeUnit}
//               exclusive
//               onChange={handleTimeUnitChange}
//               size="small"
//               sx={{
//                 '& .MuiToggleButton-root': {
//                   color: isDarkMode ? '#F8F8F2' : '#282A36',
//                   borderColor: isDarkMode ? '#6272A4' : '#BD93F9',
//                   '&.Mui-selected': {
//                     backgroundColor: isDarkMode ? 'rgba(189, 147, 249, 0.2)' : 'rgba(98, 114, 164, 0.2)',
//                     color: isDarkMode ? '#BD93F9' : '#6272A4',
//                     fontWeight: 'bold'
//                   },
//                   '&:hover': {
//                     backgroundColor: isDarkMode ? 'rgba(189, 147, 249, 0.1)' : 'rgba(98, 114, 164, 0.1)'
//                   }
//                 }
//               }}
//             >
//               <ToggleButton value="hour">시간</ToggleButton>
//               <ToggleButton value="day">일</ToggleButton>
//               <ToggleButton value="week">주</ToggleButton>
//               <ToggleButton value="month">월</ToggleButton>
//             </ToggleButtonGroup>
            
//             <Tooltip title="새로고침">
//               <IconButton 
//                 onClick={() => handleDataRefresh(false)} 
//                 disabled={isRefreshing}
//                 color="primary"
//                 sx={{
//                   backgroundColor: isDarkMode ? 'rgba(189, 147, 249, 0.1)' : 'rgba(98, 114, 164, 0.1)',
//                   '&:hover': {
//                     backgroundColor: isDarkMode ? 'rgba(189, 147, 249, 0.2)' : 'rgba(98, 114, 164, 0.2)'
//                   }
//                 }}
//               >
//                 <RefreshIcon />
//               </IconButton>
//             </Tooltip>
//             <Tooltip title={autoRefresh ? "자동 새로고침 중지" : "자동 새로고침 시작"}>
//               <IconButton 
//                 onClick={() => setAutoRefresh(!autoRefresh)} 
//                 color={autoRefresh ? (isDarkMode ? "info" : "secondary") : "default"}
//                 sx={{
//                   backgroundColor: autoRefresh ? 
//                     (isDarkMode ? 'rgba(139, 233, 253, 0.1)' : 'rgba(255, 121, 198, 0.1)') : 
//                     'transparent',
//                   '&:hover': {
//                     backgroundColor: autoRefresh ? 
//                       (isDarkMode ? 'rgba(139, 233, 253, 0.2)' : 'rgba(255, 121, 198, 0.2)') : 
//                       (isDarkMode ? 'rgba(248, 248, 242, 0.1)' : 'rgba(40, 42, 54, 0.1)')
//                   }
//                 }}
//               >
//                 <RestartAltIcon />
//               </IconButton>
//             </Tooltip>
            
//             {isRefreshing && <CircularProgress size={24} />}
//             {autoRefresh && <CircularProgress 
//               size={16} 
//               sx={{ 
//                 color: isDarkMode ? 'info.main' : 'secondary.main',
//                 opacity: 0.8
//               }} 
//             />}
//             {lastUpdated && (
//               <Typography variant="caption" sx={{ 
//                 ml: 1,
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: 0.5
//               }}>
//                 <span role="img" aria-label="시간" style={{ fontSize: '1rem' }}>🕒</span>
//                 마지막 업데이트: {lastUpdated.toLocaleTimeString()}
//                 {autoRefresh && (
//                   <span style={{ 
//                     color: isDarkMode ? '#8be9fd' : '#7b1fa2',
//                     fontWeight: 'normal'
//                   }}>
//                     {" (1분마다 자동 업데이트 중)"}
//                   </span>
//                 )}
//               </Typography>
//             )}
//           </Box>
          
//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//             {/* 로그 필터 컨테이너 */}
//             <Box sx={{ 
//               display: 'flex', 
//               gap: 2,
//               bgcolor: isDarkMode ? 'rgba(68, 71, 90, 0.2)' : 'rgba(240, 240, 240, 0.5)',
//               borderRadius: '8px',
//               p: 1,
//               border: `1px solid ${isDarkMode ? 'rgba(98, 114, 164, 0.2)' : 'rgba(189, 147, 249, 0.2)'}`,
//               boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.05)'
//             }}>
//               {/* 로그 유형 필터 */}
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
//                 <Typography variant="caption" sx={{ 
//                   color: isDarkMode ? '#BD93F9' : '#6272A4',
//                   fontWeight: 'bold',
//                   textAlign: 'center',
//                   fontSize: '0.7rem'
//                 }}>
//                   로그 유형
//                 </Typography>
//                 <Box sx={{ display: 'flex', gap: 1 }}>
//                   <Tooltip title={showRunLogs ? "실행 로그 숨기기" : "실행 로그 표시하기"}>
//                     <Button
//                       variant={showRunLogs ? "contained" : "outlined"}
//                       size="small"
//                       onClick={handleToggleRunLogs}
//                       sx={{
//                         borderRadius: '8px',
//                         minWidth: '80px',
//                         fontSize: '0.75rem',
//                         fontWeight: 'bold',
//                         height: '28px',
//                         backgroundColor: showRunLogs ? 
//                           (isDarkMode ? 'rgba(80, 250, 123, 0.7)' : '#4CAF50') : 
//                           'transparent',
//                         color: showRunLogs ? 
//                           (isDarkMode ? '#282A36' : '#fff') : 
//                           (isDarkMode ? '#F8F8F2' : '#4CAF50'),
//                         border: `1px solid ${isDarkMode ? 'rgba(80, 250, 123, 0.5)' : '#4CAF50'}`,
//                         '&:hover': {
//                           backgroundColor: showRunLogs ? 
//                             (isDarkMode ? 'rgba(80, 250, 123, 0.9)' : '#388E3C') : 
//                             (isDarkMode ? 'rgba(80, 250, 123, 0.1)' : 'rgba(76, 175, 80, 0.1)')
//                         }
//                       }}
//                     >
//                       실행
//                     </Button>
//                   </Tooltip>
                  
//                   <Tooltip title={showBuildLogs ? "빌드 로그 숨기기" : "빌드 로그 표시하기"}>
//                     <Button
//                       variant={showBuildLogs ? "contained" : "outlined"}
//                       size="small"
//                       onClick={handleToggleBuildLogs}
//                       sx={{
//                         borderRadius: '8px',
//                         minWidth: '80px',
//                         fontSize: '0.75rem',
//                         fontWeight: 'bold',
//                         height: '28px',
//                         backgroundColor: showBuildLogs ? 
//                           (isDarkMode ? 'rgba(139, 233, 253, 0.7)' : '#2196F3') : 
//                           'transparent',
//                         color: showBuildLogs ? 
//                           (isDarkMode ? '#282A36' : '#fff') : 
//                           (isDarkMode ? '#F8F8F2' : '#2196F3'),
//                         border: `1px solid ${isDarkMode ? 'rgba(139, 233, 253, 0.5)' : '#2196F3'}`,
//                         '&:hover': {
//                           backgroundColor: showBuildLogs ? 
//                             (isDarkMode ? 'rgba(139, 233, 253, 0.9)' : '#1976D2') : 
//                             (isDarkMode ? 'rgba(139, 233, 253, 0.1)' : 'rgba(33, 150, 243, 0.1)')
//                         }
//                       }}
//                     >
//                       빌드
//                     </Button>
//                   </Tooltip>
//                 </Box>
//               </Box>
              
//               {/* 로그 상태 필터 */}
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
//                 <Typography variant="caption" sx={{ 
//                   color: isDarkMode ? '#BD93F9' : '#6272A4',
//                   fontWeight: 'bold',
//                   textAlign: 'center',
//                   fontSize: '0.7rem'
//                 }}>
//                   로그 상태
//                 </Typography>
//                 <Box sx={{ display: 'flex', gap: 1 }}>
//                   <Tooltip title={showSuccessLogs ? "성공 로그 숨기기" : "성공 로그 표시하기"}>
//                     <Button
//                       variant={showSuccessLogs ? "contained" : "outlined"}
//                       size="small"
//                       onClick={handleToggleSuccessLogs}
//                       sx={{
//                         borderRadius: '8px',
//                         minWidth: '80px',
//                         fontSize: '0.75rem',
//                         fontWeight: 'bold',
//                         height: '28px',
//                         backgroundColor: showSuccessLogs ? 
//                           (isDarkMode ? 'rgba(80, 250, 123, 0.7)' : '#4CAF50') : 
//                           'transparent',
//                         color: showSuccessLogs ? 
//                           (isDarkMode ? '#282A36' : '#fff') : 
//                           (isDarkMode ? '#F8F8F2' : '#4CAF50'),
//                         border: `1px solid ${isDarkMode ? 'rgba(80, 250, 123, 0.5)' : '#4CAF50'}`,
//                         '&:hover': {
//                           backgroundColor: showSuccessLogs ? 
//                             (isDarkMode ? 'rgba(80, 250, 123, 0.9)' : '#388E3C') : 
//                             (isDarkMode ? 'rgba(80, 250, 123, 0.1)' : 'rgba(76, 175, 80, 0.1)')
//                         }
//                       }}
//                     >
//                       성공
//                     </Button>
//                   </Tooltip>
                  
//                   <Tooltip title={showFailLogs ? "실패 로그 숨기기" : "실패 로그 표시하기"}>
//                     <Button
//                       variant={showFailLogs ? "contained" : "outlined"}
//                       size="small"
//                       onClick={handleToggleFailLogs}
//                       sx={{
//                         borderRadius: '8px',
//                         minWidth: '80px',
//                         fontSize: '0.75rem',
//                         fontWeight: 'bold',
//                         height: '28px',
//                         backgroundColor: showFailLogs ? 
//                           (isDarkMode ? 'rgba(255, 85, 85, 0.7)' : '#F44336') : 
//                           'transparent',
//                         color: showFailLogs ? 
//                           (isDarkMode ? '#282A36' : '#fff') : 
//                           (isDarkMode ? '#F8F8F2' : '#F44336'),
//                         border: `1px solid ${isDarkMode ? 'rgba(255, 85, 85, 0.5)' : '#F44336'}`,
//                         '&:hover': {
//                           backgroundColor: showFailLogs ? 
//                             (isDarkMode ? 'rgba(255, 85, 85, 0.9)' : '#D32F2F') : 
//                             (isDarkMode ? 'rgba(255, 85, 85, 0.1)' : 'rgba(244, 67, 54, 0.1)')
//                         }
//                       }}
//                     >
//                       실패
//                     </Button>
//                   </Tooltip>
//                 </Box>
//               </Box>
//             </Box>
            
//             {/* 차트 줌 컨트롤 추가 */}
//             <Box sx={{ 
//               display: 'flex', 
//               gap: 1, 
//               alignItems: 'center',
//               bgcolor: isDarkMode ? 'rgba(68, 71, 90, 0.2)' : 'rgba(240, 240, 240, 0.5)',
//               borderRadius: '8px',
//               p: 1,
//               border: `1px solid ${isDarkMode ? 'rgba(98, 114, 164, 0.2)' : 'rgba(189, 147, 249, 0.2)'}`,
//               boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.05)'
//             }}>
//               <Typography variant="caption" sx={{ 
//                 color: isDarkMode ? '#BD93F9' : '#6272A4',
//                 fontWeight: 'bold',
//                 fontSize: '0.7rem'
//               }}>
//                 줌
//               </Typography>
//               <Tooltip title="차트 확대">
//                 <IconButton 
//                   onClick={() => {
//                     if (totalChartInstance.current) {
//                       totalChartInstance.current.zoom(1.2);
//                       changeChartInstance.current?.zoom(1.2);
//                     }
//                   }}
//                   size="small"
//                   sx={{
//                     backgroundColor: isDarkMode ? 'rgba(80, 250, 123, 0.1)' : 'rgba(76, 175, 80, 0.1)',
//                     '&:hover': {
//                       backgroundColor: isDarkMode ? 'rgba(80, 250, 123, 0.2)' : 'rgba(76, 175, 80, 0.2)'
//                     }
//                   }}
//                 >
//                   <ZoomInIcon fontSize="small" />
//                 </IconButton>
//               </Tooltip>
//               <Tooltip title="차트 축소">
//                 <IconButton 
//                   onClick={() => {
//                     if (totalChartInstance.current) {
//                       totalChartInstance.current.zoom(0.8);
//                       changeChartInstance.current?.zoom(0.8);
//                     }
//                   }}
//                   size="small"
//                   sx={{
//                     backgroundColor: isDarkMode ? 'rgba(255, 85, 85, 0.1)' : 'rgba(244, 67, 54, 0.1)',
//                     '&:hover': {
//                       backgroundColor: isDarkMode ? 'rgba(255, 85, 85, 0.2)' : 'rgba(244, 67, 54, 0.2)'
//                     }
//                   }}
//                 >
//                   <ZoomOutIcon fontSize="small" />
//                 </IconButton>
//               </Tooltip>
//               <Tooltip title="차트 초기화">
//                 <IconButton 
//                   onClick={() => {
//                     if (totalChartInstance.current) {
//                       totalChartInstance.current.resetZoom();
//                       changeChartInstance.current?.resetZoom();
//                     }
//                   }}
//                   size="small"
//                   sx={{
//                     backgroundColor: isDarkMode ? 'rgba(255, 184, 108, 0.1)' : 'rgba(255, 152, 0, 0.1)',
//                     '&:hover': {
//                       backgroundColor: isDarkMode ? 'rgba(255, 184, 108, 0.2)' : 'rgba(255, 152, 0, 0.2)'
//                     }
//                   }}
//                 >
//                   <RestartAltIcon fontSize="small" />
//                 </IconButton>
//               </Tooltip>
//             </Box>
//           </Box>
//         </Box>

//         <Paper elevation={0} sx={{ 
//           height: '400px', 
//           mb: 2, 
//           p: 1,
//           border: `1px solid ${isDarkMode ? '#44475A' : '#E0E0E0'}`,
//           borderRadius: '8px',
//           position: 'relative'
//         }}>
//           <Typography 
//             variant="subtitle2" 
//             sx={{ 
//               position: 'absolute', 
//               top: 8, 
//               left: 16, 
//               color: isDarkMode ? '#BD93F9' : '#6272A4',
//               fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
//               fontWeight: 'bold',
//               zIndex: 1
//             }}
//           >
//             총 코드량 (바이트)
//           </Typography>
//           <canvas ref={totalBytesChartRef} />
//         </Paper>

//         <Paper elevation={0} sx={{ 
//           height: '200px', 
//           p: 1,
//           border: `1px solid ${isDarkMode ? '#44475A' : '#E0E0E0'}`,
//           borderRadius: '8px',
//           position: 'relative'
//         }}>
//           <Typography 
//             variant="subtitle2" 
//             sx={{ 
//               position: 'absolute', 
//               top: 8, 
//               left: 16, 
//               color: isDarkMode ? '#FF79C6' : '#9C27B0',
//               fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
//               fontWeight: 'bold',
//               zIndex: 1
//             }}
//           >
//             코드 변화량 (바이트)
//           </Typography>
//           <canvas ref={changeChartRef} />
//         </Paper>
        
//         {/* 로그 정보 다이얼로그 */}
//         {renderLogDialog()}
        
//         {/* 로그 로딩 표시 */}
//         {logsLoading && (
//           <Box sx={{ 
//             position: 'fixed', 
//             bottom: 20, 
//             right: 20, 
//             display: 'flex', 
//             alignItems: 'center', 
//             gap: 1,
//             backgroundColor: isDarkMode ? 'rgba(40, 42, 54, 0.8)' : 'rgba(255, 255, 255, 0.8)',
//             padding: '8px 12px',
//             borderRadius: '8px',
//             boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
//             zIndex: 1000
//           }}>
//             <CircularProgress size={20} />
//             <Typography variant="caption">로그 데이터 로딩 중...</Typography>
//           </Box>
//         )}
//       </Paper>
//     </Container>
//   );
// };

// export default AssignmentMonitoring;
