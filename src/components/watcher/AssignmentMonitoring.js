import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  Typography,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Badge,
  Switch,
  FormControlLabel,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  useTheme
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import UpdateIcon from '@mui/icons-material/Update';
import CloseIcon from '@mui/icons-material/Close';
import WatcherBreadcrumbs from '../common/WatcherBreadcrumbs';
import TotalSizeChart from './charts/TotalSizeChart';
import ChangeChart from './charts/ChangeChart';
import ChartControls from './charts/ChartControls';
import {
  calculateIntervalValue,
  fetchMonitoringData,
  processChartData,
  fetchStudentInfo,
  fetchAssignmentInfo,
  fetchCourseInfo
} from './charts/ChartDataService';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';

// ChartHeader 컴포넌트
const ChartHeader = ({ student, assignment, course }) => {
  // 데이터가 로딩되었는지 확인
  const hasStudentData = student && Object.keys(student).length > 0;
  const hasAssignmentData = assignment && Object.keys(assignment).length > 0;
  const hasCourseData = course && Object.keys(course).length > 0;
  
  // // 디버깅용 로그 추가
  // console.log('ChartHeader - student 데이터:', student);
  // console.log('ChartHeader - student 속성:', hasStudentData ? Object.keys(student) : 'No student data');
  // console.log('ChartHeader - assignment 데이터:', assignment);
  
  // 학생 정보 가져오기
  const getStudentId = () => {
    if (!hasStudentData) return null;
    if (student.studentNum) return student.studentNum;
    if (student.studentId) return student.studentId;
    if (student.id) return student.id;
    return null;
  };
  
  const getStudentName = () => {
    if (!hasStudentData) return null;
    if (student.name) return student.name;
    if (student.userName) return student.userName;
    return null;
  };
  
  const getStudentEmail = () => {
    if (!hasStudentData) return null;
    if (student.email) return student.email;
    if (student.userEmail) return student.userEmail;
    return null;
  };
  
  // 과제 시작일/종료일 가져오기
  const getStartDate = () => {
    if (!hasAssignmentData) return null;
    
    // 속성 우선순위: startDate -> kickoffDate -> startDateTime
    if (assignment.startDate) return assignment.startDate;
    if (assignment.kickoffDate) return assignment.kickoffDate;
    if (assignment.startDateTime) return assignment.startDateTime;
    return null;
  };
  
  const getEndDate = () => {
    if (!hasAssignmentData) return null;
    
    // 속성 우선순위: endDate -> deadlineDate -> endDateTime
    if (assignment.endDate) return assignment.endDate;
    if (assignment.deadlineDate) return assignment.deadlineDate;
    if (assignment.endDateTime) return assignment.endDateTime;
    return null;
  };
  
  // 날짜 및 시간 포맷팅 함수
  const formatDateTime = (dateStr) => {
    if (!dateStr) return '날짜 미정';
    
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '날짜 오류';
      
      // 년-월-일 시:분 형식으로 표시
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false // 24시간제 사용
      });
    } catch (error) {
      //console.error('날짜 변환 오류:', error);
      return '날짜 오류';
    }
  };
  
  const studentId = getStudentId();
  const studentName = getStudentName();
  const studentEmail = getStudentEmail();
  const startDate = getStartDate();
  const endDate = getEndDate();
  
  return (
    <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }} elevation={1}>
      <Typography variant="h5" gutterBottom sx={{ 
        fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
        mb: 2
      }}>
        {hasAssignmentData ? assignment.assignmentName || assignment.name : '과제 정보 로딩 중...'}
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Chip 
          label={`학번: ${studentId || '로딩중...'}`}
          sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
        />
        <Chip 
          label={`이름: ${studentName || '로딩중...'}`}
          sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
        />
        <Chip 
          label={`이메일: ${studentEmail || '로딩중...'}`}
          sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
        />
      </Box>
      
      <Divider sx={{ my: 1 }} />
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {hasCourseData && (
          <Typography variant="body2" color="text.secondary">
            <strong>강의:</strong> {course.courseName}
          </Typography>
        )}
        
        {hasAssignmentData && (
          <Typography variant="body2" color="text.secondary">
            <strong>과제 기간:</strong> {formatDateTime(startDate)} ~ {formatDateTime(endDate)}
          </Typography>
        )}
        
        {!hasStudentData && !hasAssignmentData && (
          <Typography variant="body2" color="error">
            데이터를 불러오는 중 문제가 발생했습니다. 학생 또는 과제 정보를 찾을 수 없습니다.
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

const AssignmentPlotly = () => {
  const { courseId, assignmentId, userId } = useParams();
  const theme = useTheme();
  const { user: authUser } = useAuth(); // useAuth에서 현재 인증된 사용자 정보 가져오기
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [course, setCourse] = useState(null);
  const [student, setStudent] = useState(null);
  const [data, setData] = useState(null);
  const [timeUnit, setTimeUnit] = useState('minute');
  const [minuteValue, setMinuteValue] = useState('5');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // 실시간 업데이트 관련 상태
  const [liveUpdate, setLiveUpdate] = useState(false);
  const [liveUpdateStatus, setLiveUpdateStatus] = useState('idle'); // 'idle', 'updating', 'waiting'
  const liveUpdateIntervalRef = useRef(null);
  const lastUpdateTimeRef = useRef(null);
  const countdownRef = useRef(null);
  const [nextUpdateTime, setNextUpdateTime] = useState(60);

  // 로그 데이터 관련 상태 추가
  const [runLogs, setRunLogs] = useState([]);
  const [buildLogs, setBuildLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showRunLogs, setShowRunLogs] = useState(true);
  const [showBuildLogs, setShowBuildLogs] = useState(true);
  const [showSuccessLogs, setShowSuccessLogs] = useState(true);
  const [showFailLogs, setShowFailLogs] = useState(true);

  // timeUnits 정의
  const timeUnits = {
    minute: '분',
    hour: '시간',
    day: '일',
    week: '주',
    month: '월'
  };

  // 카운트다운 업데이트 함수
  const updateCountdown = () => {
    if (!liveUpdate) return;
    
    const now = new Date();
    const lastUpdate = lastUpdateTimeRef.current || now;
    const elapsedSeconds = Math.floor((now - lastUpdate) / 1000);
    const remainingSeconds = Math.max(0, 60 - elapsedSeconds);
    
    setNextUpdateTime(remainingSeconds);
    
    if (remainingSeconds === 0 && liveUpdate) {
      setLiveUpdateStatus('updating');
      handleDataRefresh(true);
    }
  };

  // 실시간 업데이트 토글 함수
  const toggleLiveUpdate = () => {
    const newLiveUpdate = !liveUpdate;
    setLiveUpdate(newLiveUpdate);
    
    if (newLiveUpdate) {
      // 실시간 업데이트 활성화
      setLiveUpdateStatus('waiting');
      lastUpdateTimeRef.current = new Date();
      
      // 카운트다운 타이머 시작
      if (countdownRef.current) clearInterval(countdownRef.current);
      countdownRef.current = setInterval(updateCountdown, 1000);
      
      // 첫 번째 업데이트 바로 실행
      handleDataRefresh(true);
    } else {
      // 실시간 업데이트 비활성화
      setLiveUpdateStatus('idle');
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    }
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  // 실행 로그 가져오기 함수
  const fetchRunLogs = async () => {
    try {
      setLogsLoading(true);
      const params = new URLSearchParams({
        course: courseId,
        assignment: assignmentId,
        user: userId
      });
      
      const response = await api.get(`/api/watcher/logs/run?${params}`);
      
      // 타임스탬프를 Date 객체로 변환하여 정렬
      const logs = response.data.run_logs ? response.data.run_logs.map(log => ({
        ...log,
        type: 'run',
        timestamp: new Date(log.timestamp).getTime()
      })).sort((a, b) => a.timestamp - b.timestamp) : [];
      
      setRunLogs(logs);
      // console.log('실행 로그 로드 완료:', logs);
    } catch (error) {
      //console.error('실행 로그를 불러오는데 실패했습니다:', error);
      setRunLogs([]);
    } finally {
      setLogsLoading(false);
    }
  };

  // 빌드 로그 가져오기 함수
  const fetchBuildLogs = async () => {
    try {
      setLogsLoading(true);
      const params = new URLSearchParams({
        course: courseId,
        assignment: assignmentId,
        user: userId
      });
      
      const response = await api.get(`/api/watcher/logs/build?${params}`);
      
      // 타임스탬프를 Date 객체로 변환하여 정렬
      const logs = response.data.build_logs ? response.data.build_logs.map(log => ({
        ...log,
        type: 'build',
        timestamp: new Date(log.timestamp).getTime()
      })).sort((a, b) => a.timestamp - b.timestamp) : [];
      
      setBuildLogs(logs);
      //console.log('빌드 로그 로드 완료:', logs);
    } catch (error) {
      //console.error('빌드 로그를 불러오는데 실패했습니다:', error);
      setBuildLogs([]);
    } finally {
      setLogsLoading(false);
    }
  };

  // 로그 토글 핸들러
  const handleToggleRunLogs = () => {
    setShowRunLogs(!showRunLogs);
  };

  const handleToggleBuildLogs = () => {
    setShowBuildLogs(!showBuildLogs);
  };

  const handleToggleSuccessLogs = () => {
    setShowSuccessLogs(!showSuccessLogs);
  };

  const handleToggleFailLogs = () => {
    setShowFailLogs(!showFailLogs);
  };

  // 로그 클릭 핸들러
  const handleLogClick = (log) => {
    setSelectedLog(log);
    setLogDialogOpen(true);
  };

  // 로그 다이얼로그 닫기
  const handleCloseLogDialog = () => {
    setLogDialogOpen(false);
    setSelectedLog(null);
  };

  // 필터링된 로그 데이터 계산
  const getFilteredLogs = () => {
    const filteredRunLogs = showRunLogs ? runLogs.filter(log => 
      (log.exit_code === 0 && showSuccessLogs) || 
      (log.exit_code !== 0 && showFailLogs)
    ) : [];
    
    const filteredBuildLogs = showBuildLogs ? buildLogs.filter(log => 
      (log.exit_code === 0 && showSuccessLogs) || 
      (log.exit_code !== 0 && showFailLogs)
    ) : [];
    
    return { runLogs: filteredRunLogs, buildLogs: filteredBuildLogs };
  };

  // 데이터 새로고침 함수
  const handleDataRefresh = async (isLiveUpdate = false) => {
    if (!isLiveUpdate) setIsRefreshing(true);
    if (isLiveUpdate) setLiveUpdateStatus('updating');
    
    try {
      const intervalValue = calculateIntervalValue(timeUnit, minuteValue);
      const response = await fetchMonitoringData(intervalValue, courseId, assignmentId, userId);
      const processedData = processChartData(response, assignment);
      
      setData(processedData);
      const now = new Date();
      setLastUpdated(now);
      
      // 로그 데이터 가져오기
      await Promise.all([
        fetchRunLogs(),
        fetchBuildLogs()
      ]);
      
      if (isLiveUpdate) {
        lastUpdateTimeRef.current = now;
        setLiveUpdateStatus('waiting');
      }
    } catch (error) {
      //console.error('데이터 새로고침 오류:', error);
      // 오류 발생 시에도 UI를 보여주기 위해 빈 데이터로 설정
      setData({
        timeData: [],
        timestamps: [],
        totalBytes: [],
        changeBytes: [],
        formattedTimes: [],
        additions: [],
        deletions: []
      });
      
      if (isLiveUpdate) {
        setLiveUpdateStatus('waiting');
      }
    } finally {
      if (!isLiveUpdate) setIsRefreshing(false);
    }
  };

  // 시간 단위 변경 핸들러
  const handleTimeUnitChange = (event) => {
    setTimeUnit(event.target.value);
  };

  // 분 단위 변경 핸들러
  const handleMinuteChange = (event) => {
    setMinuteValue(event.target.value);
  };

  // 초기 데이터 로드
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // 과제 정보 가져오기
        const assignmentData = await fetchAssignmentInfo(courseId, assignmentId);
        //console.log('과제 정보:', assignmentData);
        setAssignment(assignmentData);
        
        // 강의 정보 가져오기
        const courseData = await fetchCourseInfo(courseId);
        //console.log('강의 정보:', courseData);
        setCourse(courseData);
        
        // 학생 정보 가져오기 - 사용자 역할에 따라 다르게 처리
        if (userId) {
          try {
            if (authUser?.role === 'STUDENT') {
              // 학생인 경우 자신의 정보를 가져옴
              const meResponse = await api.get('/api/users/me');
              //console.log('내 정보:', meResponse.data);
              setStudent(meResponse.data);
            } else {
              // 교수/조교인 경우 해당 학생의 정보를 가져옴
              const studentData = await fetchStudentInfo(courseId, userId);
              //console.log('학생 정보:', studentData);
              if (studentData) {
                setStudent(studentData);
              }
            }
          } catch (userError) {
            //console.warn('학생 정보를 가져오는데 실패했습니다:', userError);
            // 학생 정보 오류가 있어도 계속 진행
          }
        }
        
        // 모니터링 데이터 가져오기
        try {
          const intervalValue = calculateIntervalValue(timeUnit, minuteValue);
          const monitoringData = await fetchMonitoringData(intervalValue, courseId, assignmentId, userId);
          const processedData = processChartData(monitoringData, assignmentData);
          setData(processedData);
          const now = new Date();
          setLastUpdated(now);
          lastUpdateTimeRef.current = now;
        } catch (monitoringError) {
          //console.error('모니터링 데이터 로드 실패:', monitoringError);
          // 기본 데이터로 설정
          setData({
            timeData: [],
            timestamps: [],
            totalBytes: [],
            changeBytes: [],
            formattedTimes: [],
            additions: [],
            deletions: []
          });
        }
        
        // 로그 데이터 가져오기
        await Promise.all([
          fetchRunLogs(),
          fetchBuildLogs()
        ]);
      } catch (error) {
        //console.error('초기 데이터 로딩 오류:', error);
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [courseId, assignmentId, userId, authUser]);

  // 데이터 변경에 따른 차트 업데이트 (timeUnit, minuteValue 변경시)
  useEffect(() => {
    if (!loading && courseId && assignmentId && userId) {
      const fetchUpdatedData = async () => {
        try {
          const intervalValue = calculateIntervalValue(timeUnit, minuteValue);
          const response = await fetchMonitoringData(intervalValue, courseId, assignmentId, userId);
          const processedData = processChartData(response, assignment);
          
          setData(processedData);
          const now = new Date();
          setLastUpdated(now);
          lastUpdateTimeRef.current = now;
        } catch (error) {
          //console.error('데이터 업데이트 오류:', error);
          // 오류 발생 시에도 UI 유지를 위해 기존 데이터 유지
        }
      };
      
      fetchUpdatedData();
    }
  }, [timeUnit, minuteValue]);

  // 로그 다이얼로그 렌더링
  const renderLogDialog = () => {
    if (!selectedLog) return null;
    
    const isRunLog = selectedLog.type === 'run';
    const title = isRunLog ? '실행 로그 정보' : '빌드 로그 정보';
    const statusText = selectedLog.exit_code === 0 ? '성공' : '실패';
    const statusColor = selectedLog.exit_code === 0 ? 
      (theme.palette.mode === 'dark' ? '#50FA7B' : '#4CAF50') : 
      (theme.palette.mode === 'dark' ? '#FF5555' : '#F44336');
    
    return (
      <Dialog 
        open={logDialogOpen} 
        onClose={handleCloseLogDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isRunLog ? '▶️' : '🔨'} {title}
            <Chip 
              label={statusText} 
              size="small" 
              sx={{ 
                ml: 1,
                backgroundColor: statusColor,
                color: '#FFF',
                fontWeight: 'bold'
              }} 
            />
          </Box>
          <IconButton 
            onClick={handleCloseLogDialog}
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <DialogContentText component="div">
            <Typography variant="subtitle1" gutterBottom>
              <strong>명령어:</strong> {selectedLog.command || '정보 없음'}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <strong>시간:</strong> {new Date(selectedLog.timestamp).toLocaleString()}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <strong>종료 코드:</strong> {selectedLog.exit_code}
            </Typography>
            {selectedLog.stdout && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>표준 출력:</strong>
                </Typography>
                <Paper sx={{ 
                  p: 2, 
                  backgroundColor: theme => theme.palette.mode === 'dark' ? '#282A36' : '#F5F5F5',
                  maxHeight: '200px',
                  overflow: 'auto' 
                }}>
                  <pre style={{ 
                    margin: 0, 
                    whiteSpace: 'pre-wrap', 
                    wordBreak: 'break-word',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '14px'
                  }}>
                    {selectedLog.stdout}
                  </pre>
                </Paper>
              </Box>
            )}
            {selectedLog.stderr && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>표준 에러:</strong>
                </Typography>
                <Paper sx={{ 
                  p: 2, 
                  backgroundColor: theme => theme.palette.mode === 'dark' ? '#282A36' : '#F5F5F5',
                  maxHeight: '200px',
                  overflow: 'auto' 
                }}>
                  <pre style={{ 
                    margin: 0, 
                    whiteSpace: 'pre-wrap', 
                    wordBreak: 'break-word',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '14px',
                    color: theme => theme.palette.mode === 'dark' ? '#FF5555' : '#F44336'
                  }}>
                    {selectedLog.stderr}
                  </pre>
                </Paper>
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLogDialog}>닫기</Button>
        </DialogActions>
      </Dialog>
    );
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

  // 필터링된 로그 데이터 가져오기
  const filteredLogs = getFilteredLogs();

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
              to: `/watcher/class/${course?.courseId}` 
            },
            { 
              text: assignment?.assignmentName || '로딩중...', 
              to: `/watcher/class/${course?.courseId}/assignment/${assignmentId}` 
            },
            {
              text: student?.name || '학생 모니터링',
              to: `/watcher/class/${course?.courseId}/assignment/${assignmentId}/plotly/${userId}`
            }
          ]} 
        />

        <ChartHeader 
          student={student}
          assignment={assignment}
          course={course}
        />

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2,
          flexWrap: 'wrap',
          gap: 1
        }}>
          <ChartControls 
            timeUnit={timeUnit}
            handleTimeUnitChange={handleTimeUnitChange}
            minuteValue={minuteValue}
            handleMinuteChange={handleMinuteChange}
            handleDataRefresh={handleDataRefresh}
            isRefreshing={isRefreshing}
            timeUnits={timeUnits}
          />
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            ml: 'auto'
          }}>
            {liveUpdate && (
              <Chip 
                color="primary"
                size="small"
                icon={<CircularProgress size={16} color="inherit" />}
                label="실시간 업데이트 중"
                sx={{ height: 28 }}
              />
            )}
            
            {lastUpdated && (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                마지막 업데이트: {lastUpdated.toLocaleTimeString('ko-KR')}
              </Typography>
            )}
            
            <FormControlLabel
              control={
                <Switch 
                  checked={liveUpdate}
                  onChange={toggleLiveUpdate}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                  실시간 업데이트
                </Typography>
              }
              sx={{ mr: 0 }}
            />
            
            <Tooltip title="지금 데이터 새로고침">
              <IconButton 
                onClick={() => handleDataRefresh(false)} 
                disabled={isRefreshing}
                color="primary"
                size="small"
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* 로그 필터 컨트롤 추가 */}
        <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControlLabel
            control={
              <Switch 
                checked={showRunLogs}
                onChange={handleToggleRunLogs}
                color="success"
              />
            }
            label="실행 로그"
          />
          <FormControlLabel
            control={
              <Switch 
                checked={showBuildLogs}
                onChange={handleToggleBuildLogs}
                color="info"
              />
            }
            label="빌드 로그"
          />
          <FormControlLabel
            control={
              <Switch 
                checked={showSuccessLogs}
                onChange={handleToggleSuccessLogs}
                color="success"
              />
            }
            label="성공 로그"
          />
          <FormControlLabel
            control={
              <Switch 
                checked={showFailLogs}
                onChange={handleToggleFailLogs}
                color="error"
              />
            }
            label="실패 로그"
          />
        </Box>

        <Box sx={{ width: '100%' }}>
          <TotalSizeChart 
            data={data} 
            student={student} 
            assignment={assignment}
            runLogs={filteredLogs.runLogs}
            buildLogs={filteredLogs.buildLogs}
          />

          <ChangeChart 
            data={data} 
            student={student} 
            assignment={assignment} 
          />
        </Box>
      </Paper>
      
      {/* 로그 상세 정보 다이얼로그 */}
      {renderLogDialog()}
    </Container>
  );
};

export default AssignmentPlotly;