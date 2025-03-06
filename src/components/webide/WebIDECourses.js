import React, { useEffect, useState } from 'react';
import { 
  Container, 
  CircularProgress, 
  Typography, 
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  FormControl,
  Select,
  MenuItem,
  Stack,
  Paper,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import api, { auth } from '../../api/axios';
import CodeIcon from '@mui/icons-material/Code';
import { selectStyles } from '../../styles/selectStyles';
import AddIcon from '@mui/icons-material/Add';
import { toast } from 'react-toastify';
import { useTheme } from '../../contexts/ThemeContext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import ReactDOM from 'react-dom';

const IDE_URL = process.env.REACT_APP_IDE_URL;


const WebIDECourses = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedTerm, setSelectedTerm] = useState('all');
  const [joinDialog, setJoinDialog] = useState({
    open: false,
    courseKey: ''
  });
  const navigate = useNavigate();

  // 고유한 연도와 학기 목록 추출
  const years = [...new Set(courses.map(course => course.courseYear))].sort((a, b) => b - a);
  const terms = [...new Set(courses.map(course => course.courseTerm))].sort();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/api/users/me/courses');
        console.log('API Response:', response.data);
        console.log('Response type:', typeof response.data);
        if (Array.isArray(response.data)) {
          setCourses(response.data);
          // 수업이 있을 때만 현재 연도와 학기로 설정
          if (response.data.length > 0) {
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentMonth = currentDate.getMonth() + 1;
            const currentTerm = currentMonth >= 9 ? 2 : 1;
            setSelectedYear(currentYear);
            setSelectedTerm(currentTerm);
          } else {
            // 수업이 없을 때는 전체 연도와 전체 학기로 설정
            setSelectedYear('all');
            setSelectedTerm('all');
          }
        } else {
          setCourses([]);
          // 에러 시에도 전체 연도와 전체 학기로 설정
          setSelectedYear('all');
          setSelectedTerm('all');
        }
        setLoading(false);
      } catch (err) {
        console.error('API Error:', err);
        setError('수업 목록을 불러오는데 실패했습니다.');
        setCourses([]);
        setLoading(false);
        // 에러 시에도 전체 연도와 전체 학기로 설정
        setSelectedYear('all');
        setSelectedTerm('all');
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
      window.auth = auth;
  }, [auth]);

  const handleWebIDEOpen = async (courseId) => {
    try {
      const response = await api.post('/api/redirect', {
        userEmail: user.email,
        courseId: courseId
      }, {
        withCredentials: true
      });

      let finalUrl = null;
      if (response.request && response.request.responseURL) {
        finalUrl = response.request.responseURL;
      } else if (response.data && response.data.url) {
        finalUrl = response.data.url;
      }

      if (!finalUrl) {
        throw new Error("Final redirect URL not found in response");
      }

      // 새 탭 열기
      const newWindow = window.open('', '_blank');
      
      // 새 탭에 HTML 콘텐츠 작성
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>JCode Web IDE</title>
            <style>
              body { 
                margin: 0; 
                padding: 0; 
                font-family: 'JetBrains Mono', 'Noto Sans KR', sans-serif;
              }
              .header {
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 10px;
                z-index: 1000;
                display: flex;
                flex-direction: column;
                gap: 12px;
                align-items: center;
              }
              .logout-btn, .refresh-btn {
                background-color: rgba(0, 0, 0, 0.7);
                color: white;
                border: none;
                border-radius: 12px;
                width: 42px;
                height: 42px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                position: relative;
              }
              .logout-btn:hover, .refresh-btn:hover {
                background-color: rgba(0, 0, 0, 0.85);
                transform: translateY(-2px);
              }
              .refresh-btn svg {
                stroke: white;
              }
              .refresh-btn::after, .logout-btn::after {
                content: attr(title);
                position: absolute;
                right: calc(100% + 10px);
                top: 50%;
                transform: translateY(-50%);
                background-color: rgba(0, 0, 0, 0.85);
                color: white;
                padding: 6px 12px;
                border-radius: 8px;
                font-size: 12px;
                white-space: nowrap;
                opacity: 0;
                visibility: hidden;
                transition: all 0.2s ease;
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
              }
              .refresh-btn:hover::after, .logout-btn:hover::after {
                opacity: 1;
                visibility: visible;
                transform: translateY(-50%) translateX(-5px);
              }
              .confirm-dialog {
                display: none;
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: rgba(0, 0, 0, 0.85);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                border-radius: 12px;
                padding: 20px;
                min-width: 300px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.2);
                z-index: 1001;
                color: white;
                font-family: 'JetBrains Mono', 'Noto Sans KR', sans-serif;
              }
              .confirm-dialog.show {
                display: block;
              }
              .confirm-dialog-title {
                font-size: 16px;
                margin-bottom: 16px;
                text-align: center;
              }
              .confirm-dialog-buttons {
                display: flex;
                justify-content: center;
                gap: 12px;
                margin-top: 20px;
              }
              .confirm-dialog-button {
                padding: 8px 16px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-family: inherit;
                font-size: 14px;
                transition: all 0.2s ease;
              }
              .confirm-dialog-button.cancel {
                background-color: transparent;
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.2);
              }
              .confirm-dialog-button.confirm {
                background-color: #f44336;
                color: white;
              }
              .confirm-dialog-button:hover {
                transform: translateY(-1px);
              }
              .confirm-dialog-button.cancel:hover {
                background-color: rgba(255, 255, 255, 0.1);
              }
              .confirm-dialog-button.confirm:hover {
                background-color: #d32f2f;
              }
              .dialog-overlay {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(4px);
                -webkit-backdrop-filter: blur(4px);
                z-index: 1000;
              }
              .dialog-overlay.show {
                display: block;
              }
              .iframe-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border: none;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <button class="refresh-btn" id="refreshBtn" title="새로고침">
                <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <polyline points="1 20 1 14 7 14"></polyline>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14L5.64 18.36a9 9 0 0 0 14.85-3.36"></path>
                </svg>
              </button>
              <button class="logout-btn" id="logoutBtn" title="로그아웃">
                <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="white">
                  <path d="M0 0h24v24H0z" fill="none"/>
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                </svg>
              </button>
            </div>
            <div class="dialog-overlay" id="dialogOverlay"></div>
            <div class="confirm-dialog" id="confirmDialog">
              <div class="confirm-dialog-title">정말 로그아웃 하시겠습니까?</div>
              <div class="confirm-dialog-buttons">
                <button class="confirm-dialog-button cancel" id="cancelLogout">취소</button>
                <button class="confirm-dialog-button confirm" id="confirmLogout">로그아웃</button>
              </div>
            </div>
            <iframe id="ideFrame" class="iframe-container" src="${finalUrl}"></iframe>
            <script>
              const refreshBtn = document.getElementById('refreshBtn');
              const logoutBtn = document.getElementById('logoutBtn');
              const confirmDialog = document.getElementById('confirmDialog');
              const dialogOverlay = document.getElementById('dialogOverlay');
              const cancelLogout = document.getElementById('cancelLogout');
              const confirmLogout = document.getElementById('confirmLogout');
              const ideFrame = document.getElementById('ideFrame');
              const IDE_URL = '${IDE_URL}';

              // 새로고침 버튼 클릭 시 iframe 새로고침
              refreshBtn.addEventListener('click', function() {
                ideFrame.src = ideFrame.src;
              });

              // 로그아웃 버튼 클릭 시 확인 다이얼로그 표시
              logoutBtn.addEventListener('click', function() {
                confirmDialog.classList.add('show');
                dialogOverlay.classList.add('show');
              });

              // 취소 버튼 클릭 시 다이얼로그 닫기
              cancelLogout.addEventListener('click', function() {
                confirmDialog.classList.remove('show');
                dialogOverlay.classList.remove('show');
              });

              // 오버레이 클릭 시 다이얼로그 닫기
              dialogOverlay.addEventListener('click', function() {
                confirmDialog.classList.remove('show');
                dialogOverlay.classList.remove('show');
              });

              // 로그아웃 확인
              confirmLogout.addEventListener('click', async function() {
                try {
                  const response = await fetch(IDE_URL + '/logout', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                      'Content-Type': 'application/json'
                    }
                  });

                  if (response.ok) {
                    await window.opener.auth.logout();
                    window.close();
                  } else {
                    console.error('IDE 로그아웃 실패:', response.status);
                  }
                } catch (error) {
                  console.error('로그아웃 중 오류 발생:', error);
                }
              });
            </script>
          </body>
        </html>
      `);
      newWindow.document.close();

    } catch (err) {
      toast.error('Web-IDE 연결에 실패했습니다. 잠시 후 다시 시도해주세요.', {
        icon: ({theme, type}) => <ErrorIcon sx={{ 
          color: '#fff',
          fontSize: '1.5rem',
          mr: 1
        }}/>,
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
  };

  const handleJoinCourse = async () => {
    try {
      await api.post('/api/users/me/courses', {
        courseKey: joinDialog.courseKey
      });
      
      // 수업 목록 새로고침
      const response = await api.get('/api/users/me/courses');
      setCourses(response.data);
      
      // 다이얼로그 닫기 및 초기화
      setJoinDialog({
        open: false,
        courseKey: ''
      });
      
      // 성공 토스트
      toast.success('수업 참가가 완료되었습니다.', {
        icon: ({theme, type}) => <CheckCircleIcon sx={{ 
          color: '#fff',
          fontSize: '1.5rem',
          mr: 1
        }}/>,
        style: {
          background: isDarkMode ? '#2e7d32' : '#4caf50',
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
    } catch (error) {
      const errorMessage = error.response?.status === 400 ? "올바르지 않은 참가 코드 형식입니다."
        : error.response?.status === 404 ? "존재하지 않는 수업입니다."
        : error.response?.status === 401 ? "잘못된 참가 코드입니다."
        : error.response?.status === 409 ? "이미 참가한 수업입니다."
        : "수업 참가 중 오류가 발생했습니다.";
      
      // 에러 토스트
      toast.error(errorMessage, {
        icon: ({theme, type}) => <ErrorIcon sx={{ 
          color: '#fff',
          fontSize: '1.5rem',
          mr: 1
        }}/>,
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
  };

  // 필터링된 강의 목록
  const filteredCourses = courses.filter(course => {
    const yearMatch = selectedYear === 'all' || course.courseYear === selectedYear;
    const termMatch = selectedTerm === 'all' || course.courseTerm === selectedTerm;
    return yearMatch && termMatch;
  });

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography color="error">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Fade in={true} timeout={300}>
      <Container maxWidth="lg" sx={{ mt: 4 }}>  
        <Paper elevation={0} sx={{ 
          p: 3,
          backgroundColor: (theme) => 
            theme.palette.mode === 'dark' ? '#282A36' : '#FFFFFF',
          border: (theme) =>
            `1px solid ${theme.palette.mode === 'dark' ? '#44475A' : '#E0E0E0'}`,
          borderRadius: '16px'
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 3 
          }}>
            <Typography variant="h5">
              수강 중인 강의 ({filteredCourses.length})
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center">
              <FormControl sx={{ minWidth: 100 }}>
                <Select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  displayEmpty
                  size="small"
                  MenuProps={selectStyles.menuProps}
                  sx={{
                    ...selectStyles.select,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#E0E0E0'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#E0E0E0'
                    }
                  }}
                >
                  <MenuItem value="all" sx={selectStyles.menuItem}>
                    전체 연도
                  </MenuItem>
                  {years.map(year => (
                    <MenuItem key={year} value={year} sx={selectStyles.menuItem}>
                      {year}년
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 90 }}>
                <Select
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  displayEmpty
                  size="small"
                  MenuProps={selectStyles.menuProps}
                  sx={selectStyles.select}
                >
                  <MenuItem value="all" sx={selectStyles.menuItem}>
                    전체 학기
                  </MenuItem>
                  {terms.map(term => (
                    <MenuItem key={term} value={term} sx={selectStyles.menuItem}>
                      {term}학기
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Box>
          
          {filteredCourses.length === 0 ? (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card sx={{ 
                  mb: 3,
                  backgroundColor: (theme) => 
                    theme.palette.mode === 'dark' ? '#44475A' : '#FFFFFF',
                }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">
                      해당하는 강의가 없습니다.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card 
                  onClick={() => setJoinDialog({ ...joinDialog, open: true })}
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
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
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography 
                      variant="h5" 
                      component="h2" 
                      gutterBottom
                      sx={{ 
                        fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                        color: (theme) => 
                          theme.palette.mode === 'dark' ? '#F8F8F2' : 'text.secondary'
                      }}
                    >
                      새 수업 참가
                    </Typography>
                    <Chip 
                      icon={<AddIcon sx={{ fontSize: '1rem' }} />}
                      label="수업 참가하기"
                      color="primary"
                      size="small"
                      sx={{ 
                        mb: 2,
                        fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                        backgroundColor: 'transparent',
                        border: '1px dashed',
                        borderRadius: '20px',
                        borderColor: (theme) =>
                          theme.palette.mode === 'dark' ? '#FF79C6' : 'primary.main',
                        color: (theme) =>
                          theme.palette.mode === 'dark' ? '#FF79C6' : 'primary.main',
                        '& .MuiChip-icon': {
                          color: (theme) =>
                            theme.palette.mode === 'dark' ? '#FF79C6' : 'primary.main'
                        }
                      }}
                    />
                    <Typography 
                      color="text.secondary" 
                      sx={{ 
                        fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                        fontSize: '0.875rem',
                        color: (theme) => 
                          theme.palette.mode === 'dark' ? '#F8F8F2' : 'text.secondary'
                      }}
                    >
                      교수님으로부터 받은 참가 코드로 새로운 수업에 참가하세요.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={3}>
              {filteredCourses.map((course) => (
                <Grid item xs={12} sm={6} md={4} key={course.courseId}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
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
                      },
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
                          theme.palette.mode === 'dark' ? '#44475A' : '#FAFAFA'
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography 
                        variant="h5" 
                        component="h2" 
                        gutterBottom
                        sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
                      >
                        {course.courseName}
                      </Typography>
                      <Chip 
                        label={course.courseCode}
                        color="primary"
                        size="small"
                        sx={{ 
                          mb: 2,
                          fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
                        }}
                      />
                      <Typography 
                        color="text.secondary" 
                        gutterBottom
                        sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
                      >
                        담당 교수: {course.courseProfessor} 교수님
                      </Typography>
                      <Typography 
                        color="text.secondary" 
                        variant="body2"
                        sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
                      >
                        {course.courseYear}년 {course.courseTerm}학기
                      </Typography>
                      <Typography 
                        color="text.secondary" 
                        variant="body2"
                        sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
                      >
                        {course.courseClss}분반
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<CodeIcon sx={{ fontSize: '1rem' }} />}
                        onClick={() => handleWebIDEOpen(course.courseId)}
                        size="small"
                        sx={{
                          fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                          fontSize: '0.75rem',
                          py: 0.5,
                          px: 1.5,
                          minHeight: '28px',
                          borderRadius: '20px',
                          textTransform: 'none'
                        }}
                      >
                        JCode 실행
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
              <Grid item xs={12} sm={6} md={4}>
                <Card 
                  onClick={() => setJoinDialog({ ...joinDialog, open: true })}
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
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
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography 
                      variant="h5" 
                      component="h2" 
                      gutterBottom
                      sx={{ 
                        fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                        color: (theme) => 
                          theme.palette.mode === 'dark' ? '#F8F8F2' : 'text.secondary'
                      }}
                    >
                      새 수업 참가
                    </Typography>
                    <Chip 
                      icon={<AddIcon sx={{ fontSize: '1rem' }} />}
                      label="수업 참가하기"
                      color="primary"
                      size="small"
                      sx={{ 
                        mb: 2,
                        fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                        backgroundColor: 'transparent',
                        border: '1px dashed',
                        borderRadius: '20px',
                        borderColor: (theme) =>
                          theme.palette.mode === 'dark' ? '#FF79C6' : 'primary.main',
                        color: (theme) =>
                          theme.palette.mode === 'dark' ? '#FF79C6' : 'primary.main',
                        '& .MuiChip-icon': {
                          color: (theme) =>
                            theme.palette.mode === 'dark' ? '#FF79C6' : 'primary.main'
                        }
                      }}
                    />
                    <Typography 
                      color="text.secondary" 
                      sx={{ 
                        fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                        fontSize: '0.875rem',
                        color: (theme) => 
                          theme.palette.mode === 'dark' ? '#F8F8F2' : 'text.secondary'
                      }}
                    >
                      교수님으로부터 받은 참가 코드로 새로운 수업에 참가하세요.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          <Dialog
            open={joinDialog.open}
            onClose={() => setJoinDialog({ open: false, courseKey: '' })}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
              수업 참가
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="참가 코드"
                  value={joinDialog.courseKey}
                  onChange={(e) => {
                    setJoinDialog({ ...joinDialog, courseKey: e.target.value });
                  }}
                  placeholder="참가 코드를 입력하세요"
                  helperText="교수님으로부터 받은 참가 코드를 입력해주세요"
                  InputProps={{
                    sx: { 
                      fontFamily: "'JetBrains Mono', monospace",
                    }
                  }}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => setJoinDialog({ open: false, courseKey: '' })}
              >
                취소
              </Button>
              <Button 
                onClick={handleJoinCourse}
                variant="contained"
                disabled={!joinDialog.courseKey.trim()}
              >
                참가
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
      </Container>
    </Fade>
  );
};

export default WebIDECourses; 