// import React, { useState, useEffect, useRef } from 'react';
// import { useParams } from 'react-router-dom';
// import {
//   Container,
//   Paper,
//   Box,
//   Typography,
//   CircularProgress,
//   Chip,
//   IconButton,
//   Tooltip,
//   Badge,
//   Switch,
//   FormControlLabel,
//   Divider
// } from '@mui/material';
// import RefreshIcon from '@mui/icons-material/Refresh';
// import PlayArrowIcon from '@mui/icons-material/PlayArrow';
// import StopIcon from '@mui/icons-material/Stop';
// import UpdateIcon from '@mui/icons-material/Update';
// import WatcherBreadcrumbs from '../common/WatcherBreadcrumbs';
// import TotalSizeChart from './charts/TotalSizeChart';
// import ChangeChart from './charts/ChangeChart';
// import ChartControls from './charts/ChartControls';
// import {
//   calculateIntervalValue,
//   fetchMonitoringData,
//   processChartData,
//   fetchStudentInfo,
//   fetchAssignmentInfo,
//   fetchCourseInfo
// } from './charts/ChartDataService';

// // ChartHeader 컴포넌트
// const ChartHeader = ({ student, assignment, course }) => {
//   // 데이터가 로딩되었는지 확인
//   const hasStudentData = student && Object.keys(student).length > 0;
//   const hasAssignmentData = assignment && Object.keys(assignment).length > 0;
//   const hasCourseData = course && Object.keys(course).length > 0;
  
//   // 디버깅용 로그 추가
//   console.log('ChartHeader - student 데이터:', student);
//   console.log('ChartHeader - student 속성:', hasStudentData ? Object.keys(student) : 'No student data');
  
//   return (
//     <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }} elevation={1}>
//       <Typography variant="h5" gutterBottom sx={{ 
//         fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
//         mb: 2
//       }}>
//         {hasAssignmentData ? assignment.assignmentName : '과제 정보 로딩 중...'}
//       </Typography>
      
//       <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
//         <Chip 
//           label={`학번: ${hasStudentData && student.studentId ? student.studentId : (hasStudentData && student.studentNum ? student.studentNum : '로딩중...')}`}
//           sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
//         />
//         <Chip 
//           label={`이름: ${hasStudentData && student.userName ? student.userName : (hasStudentData && student.name ? student.name : '로딩중...')}`}
//           sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
//         />
//         <Chip 
//           label={`이메일: ${hasStudentData && student.userEmail ? student.userEmail : (hasStudentData && student.email ? student.email : '로딩중...')}`}
//           sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
//         />
//       </Box>
      
//       <Divider sx={{ my: 1 }} />
      
//       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//         {hasCourseData && (
//           <Typography variant="body2" color="text.secondary">
//             <strong>강의:</strong> {course.courseName}
//           </Typography>
//         )}
        
//         {hasAssignmentData && (
//           <Typography variant="body2" color="text.secondary">
//             <strong>과제 기간:</strong> {assignment.startDate ? new Date(assignment.startDate).toLocaleDateString('ko-KR') : '시작일 미정'} 
//             ~ {assignment.endDate ? new Date(assignment.endDate).toLocaleDateString('ko-KR') : '종료일 미정'}
//           </Typography>
//         )}
        
//         {!hasStudentData && !hasAssignmentData && (
//           <Typography variant="body2" color="error">
//             데이터를 불러오는 중 문제가 발생했습니다. 학생 또는 과제 정보를 찾을 수 없습니다.
//           </Typography>
//         )}
//       </Box>
//     </Paper>
//   );
// };

// const AssignmentPlotly = () => {
//   const { courseId, assignmentId, userId } = useParams();
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [assignment, setAssignment] = useState(null);
//   const [course, setCourse] = useState(null);
//   const [student, setStudent] = useState(null);
//   const [data, setData] = useState(null);
//   const [timeUnit, setTimeUnit] = useState('minute');
//   const [minuteValue, setMinuteValue] = useState('5');
//   const [lastUpdated, setLastUpdated] = useState(null);
//   const [isRefreshing, setIsRefreshing] = useState(false);
  
//   // 실시간 업데이트 관련 상태
//   const [liveUpdate, setLiveUpdate] = useState(false);
//   const [liveUpdateStatus, setLiveUpdateStatus] = useState('idle'); // 'idle', 'updating', 'waiting'
//   const liveUpdateIntervalRef = useRef(null);
//   const lastUpdateTimeRef = useRef(null);
//   const countdownRef = useRef(null);
//   const [nextUpdateTime, setNextUpdateTime] = useState(60);

//   // timeUnits 정의
//   const timeUnits = {
//     minute: '분',
//     hour: '시간',
//     day: '일',
//     week: '주',
//     month: '월'
//   };

//   // 카운트다운 업데이트 함수
//   const updateCountdown = () => {
//     if (!liveUpdate) return;
    
//     const now = new Date();
//     const lastUpdate = lastUpdateTimeRef.current || now;
//     const elapsedSeconds = Math.floor((now - lastUpdate) / 1000);
//     const remainingSeconds = Math.max(0, 60 - elapsedSeconds);
    
//     setNextUpdateTime(remainingSeconds);
    
//     if (remainingSeconds === 0 && liveUpdate) {
//       setLiveUpdateStatus('updating');
//       handleDataRefresh(true);
//     }
//   };

//   // 실시간 업데이트 토글 함수
//   const toggleLiveUpdate = () => {
//     const newLiveUpdate = !liveUpdate;
//     setLiveUpdate(newLiveUpdate);
    
//     if (newLiveUpdate) {
//       // 실시간 업데이트 활성화
//       setLiveUpdateStatus('waiting');
//       lastUpdateTimeRef.current = new Date();
      
//       // 카운트다운 타이머 시작
//       if (countdownRef.current) clearInterval(countdownRef.current);
//       countdownRef.current = setInterval(updateCountdown, 1000);
      
//       // 첫 번째 업데이트 바로 실행
//       handleDataRefresh(true);
//     } else {
//       // 실시간 업데이트 비활성화
//       setLiveUpdateStatus('idle');
//       if (countdownRef.current) {
//         clearInterval(countdownRef.current);
//         countdownRef.current = null;
//       }
//     }
//   };

//   // 컴포넌트 언마운트 시 타이머 정리
//   useEffect(() => {
//     return () => {
//       if (countdownRef.current) {
//         clearInterval(countdownRef.current);
//       }
//     };
//   }, []);

//   // 데이터 새로고침 함수
//   const handleDataRefresh = async (isLiveUpdate = false) => {
//     if (!isLiveUpdate) setIsRefreshing(true);
//     if (isLiveUpdate) setLiveUpdateStatus('updating');
    
//     try {
//       const intervalValue = calculateIntervalValue(timeUnit, minuteValue);
//       const response = await fetchMonitoringData(intervalValue, courseId, assignmentId, userId);
//       const processedData = processChartData(response, assignment);
      
//       setData(processedData);
//       const now = new Date();
//       setLastUpdated(now);
      
//       if (isLiveUpdate) {
//         lastUpdateTimeRef.current = now;
//         setLiveUpdateStatus('waiting');
//       }
//     } catch (error) {
//       console.error('데이터 새로고침 오류:', error);
//       // 오류 발생 시에도 UI를 보여주기 위해 빈 데이터로 설정
//       setData({
//         timeData: [],
//         timestamps: [],
//         totalBytes: [],
//         changeBytes: [],
//         formattedTimes: [],
//         additions: [],
//         deletions: []
//       });
      
//       if (isLiveUpdate) {
//         setLiveUpdateStatus('waiting');
//       }
//     } finally {
//       if (!isLiveUpdate) setIsRefreshing(false);
//     }
//   };

//   // 시간 단위 변경 핸들러
//   const handleTimeUnitChange = (event) => {
//     setTimeUnit(event.target.value);
//   };

//   // 분 단위 변경 핸들러
//   const handleMinuteChange = (event) => {
//     setMinuteValue(event.target.value);
//   };

//   // 초기 데이터 로드
//   useEffect(() => {
//     const fetchInitialData = async () => {
//       setLoading(true);
//       try {
//         // 과제 정보 가져오기
//         const assignmentData = await fetchAssignmentInfo(courseId, assignmentId);
//         console.log('과제 정보:', assignmentData);
//         setAssignment(assignmentData);
        
//         // 강의 정보 가져오기
//         const courseData = await fetchCourseInfo(courseId);
//         console.log('강의 정보:', courseData);
//         setCourse(courseData);
        
//         // 학생 정보 가져오기 (필요한 경우)
//         if (userId) {
//           try {
//             const studentData = await fetchStudentInfo(courseId, userId);
//             console.log('학생 정보:', studentData);
//             if (studentData) {
//               setStudent(studentData);
//             }
//           } catch (userError) {
//             console.warn('학생 정보를 가져오는데 실패했습니다:', userError);
//             // 학생 정보 오류가 있어도 계속 진행
//           }
//         }
        
//         // 모니터링 데이터 가져오기
//         try {
//           const intervalValue = calculateIntervalValue(timeUnit, minuteValue);
//           const monitoringData = await fetchMonitoringData(intervalValue, courseId, assignmentId, userId);
//           const processedData = processChartData(monitoringData, assignmentData);
//           setData(processedData);
//           const now = new Date();
//           setLastUpdated(now);
//           lastUpdateTimeRef.current = now;
//         } catch (monitoringError) {
//           console.error('모니터링 데이터 로드 실패:', monitoringError);
//           // 기본 데이터로 설정
//           setData({
//             timeData: [],
//             timestamps: [],
//             totalBytes: [],
//             changeBytes: [],
//             formattedTimes: [],
//             additions: [],
//             deletions: []
//           });
//         }
//       } catch (error) {
//         console.error('초기 데이터 로딩 오류:', error);
//         setError('데이터를 불러오는데 실패했습니다.');
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     fetchInitialData();
//   }, [courseId, assignmentId, userId]);

//   // 데이터 변경에 따른 차트 업데이트 (timeUnit, minuteValue 변경시)
//   useEffect(() => {
//     if (!loading && courseId && assignmentId && userId) {
//       const fetchUpdatedData = async () => {
//         try {
//           const intervalValue = calculateIntervalValue(timeUnit, minuteValue);
//           const response = await fetchMonitoringData(intervalValue, courseId, assignmentId, userId);
//           const processedData = processChartData(response, assignment);
          
//           setData(processedData);
//           const now = new Date();
//           setLastUpdated(now);
//           lastUpdateTimeRef.current = now;
//         } catch (error) {
//           console.error('데이터 업데이트 오류:', error);
//           // 오류 발생 시에도 UI 유지를 위해 기존 데이터 유지
//         }
//       };
      
//       fetchUpdatedData();
//     }
//   }, [timeUnit, minuteValue]);

//   if (loading) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
//         <CircularProgress />
//       </Box>
//     );
//   }

//   if (error) {
//     return (
//       <Container maxWidth="md" sx={{ mt: 4 }}>
//         <Paper elevation={3} sx={{ p: 3 }}>
//           <Typography color="error" align="center">
//             {error}
//           </Typography>
//         </Paper>
//       </Container>
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
//               to: `/watcher/class/${course?.courseId}` 
//             },
//             { 
//               text: assignment?.assignmentName || '로딩중...', 
//               to: `/watcher/class/${course?.courseId}/assignment/${assignmentId}` 
//             },
//             {
//               text: student?.name || '학생 모니터링',
//               to: `/watcher/class/${course?.courseId}/assignment/${assignmentId}/plotly/${userId}`
//             }
//           ]} 
//         />

//         <ChartHeader 
//           student={student}
//           assignment={assignment}
//           course={course}
//         />

//         <Box sx={{ 
//           display: 'flex', 
//           justifyContent: 'space-between', 
//           alignItems: 'center', 
//           mb: 2,
//           flexWrap: 'wrap',
//           gap: 1
//         }}>
//           <ChartControls 
//             timeUnit={timeUnit}
//             handleTimeUnitChange={handleTimeUnitChange}
//             minuteValue={minuteValue}
//             handleMinuteChange={handleMinuteChange}
//             handleDataRefresh={handleDataRefresh}
//             isRefreshing={isRefreshing}
//             timeUnits={timeUnits}
//           />
          
//           <Box sx={{ 
//             display: 'flex', 
//             alignItems: 'center', 
//             gap: 1,
//             ml: 'auto'
//           }}>
//             {liveUpdate && (
//               <Chip 
//                 color="primary"
//                 size="small"
//                 icon={<CircularProgress size={16} color="inherit" />}
//                 label="실시간 업데이트 중"
//                 sx={{ height: 28 }}
//               />
//             )}
            
//             {lastUpdated && (
//               <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
//                 마지막 업데이트: {lastUpdated.toLocaleTimeString('ko-KR')}
//               </Typography>
//             )}
            
//             <FormControlLabel
//               control={
//                 <Switch 
//                   checked={liveUpdate}
//                   onChange={toggleLiveUpdate}
//                   color="primary"
//                 />
//               }
//               label={
//                 <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
//                   실시간 업데이트
//                 </Typography>
//               }
//               sx={{ mr: 0 }}
//             />
            
//             <Tooltip title="지금 데이터 새로고침">
//               <IconButton 
//                 onClick={() => handleDataRefresh(false)} 
//                 disabled={isRefreshing}
//                 color="primary"
//                 size="small"
//               >
//                 <RefreshIcon />
//               </IconButton>
//             </Tooltip>
//           </Box>
//         </Box>

//         <Box sx={{ width: '100%' }}>
//           <TotalSizeChart 
//             data={data} 
//             student={student} 
//             assignment={assignment} 
//           />

//           <ChangeChart 
//             data={data} 
//             student={student} 
//             assignment={assignment} 
//           />
//         </Box>
//       </Paper>
//     </Container>
//   );
// };

// export default AssignmentPlotly;