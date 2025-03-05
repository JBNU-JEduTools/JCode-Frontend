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
import api from '../../api/axios';
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

const WebIDELogoutOverlay = ({ onClose }) => {
  const handleLogout = async () => {
    try {
      // code-server 로그아웃
      const codeServerFrame = document.createElement('iframe');
      codeServerFrame.style.display = 'none';
      codeServerFrame.src = '/code-server/logout';
      document.body.appendChild(codeServerFrame);

      // jcode 로그아웃
      const jcodeFrame = document.createElement('iframe');
      jcodeFrame.style.display = 'none';
      jcodeFrame.src = '/jcode/logout';
      document.body.appendChild(jcodeFrame);

      // 프레임 제거
      setTimeout(() => {
        document.body.removeChild(codeServerFrame);
        document.body.removeChild(jcodeFrame);
        onClose();
      }, 1000);
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: '50%',
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
        }
      }}
      onClick={handleLogout}
    >
      <IconButton
        size="large"
        sx={{
          color: '#fff',
          '&:hover': {
            backgroundColor: 'transparent',
          }
        }}
      >
        <LogoutIcon />
      </IconButton>
    </Box>
  );
};

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
              }
              .logout-btn {
                background-color: rgba(0, 0, 0, 0.6);
                color: white;
                border: none;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
              }
              .logout-btn:hover {
                background-color: rgba(0, 0, 0, 0.8);
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.3);
              }
              .logout-menu {
                position: absolute;
                bottom: 70px;
                right: 10px;
                background-color: rgba(0, 0, 0, 0.8);
                border-radius: 8px;
                padding: 8px 0;
                display: none;
                flex-direction: column;
                min-width: 180px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
              }
              .logout-menu.show {
                display: flex;
              }
              .logout-menu-item {
                color: white;
                padding: 10px 16px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: background-color 0.2s;
                border: none;
                background: none;
                width: 100%;
                text-align: left;
                font-family: 'JetBrains Mono', 'Noto Sans KR', sans-serif;
                font-size: 14px;
              }
              .logout-menu-item:hover {
                background-color: rgba(255, 255, 255, 0.1);
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
              <button class="logout-btn" id="logoutBtn" title="로그아웃 옵션">
                <svg xmlns="http://www.w3.org/2000/svg" height="28" viewBox="0 0 24 24" width="28" fill="white">
                  <path d="M0 0h24v24H0z" fill="none"/>
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                </svg>
              </button>
              <div class="logout-menu" id="logoutMenu">
                <button class="logout-menu-item" id="ideLogout">
                  <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="white">
                    <path d="M0 0h24v24H0z" fill="none"/>
                    <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                  </svg>
                  IDE 로그아웃
                </button>
                <button class="logout-menu-item" id="fullLogout">
                  <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="white">
                    <path d="M0 0h24v24H0z" fill="none"/>
                    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                  </svg>
                  전체 로그아웃
                </button>
              </div>
            </div>
            <iframe src="${finalUrl}" class="iframe-container"></iframe>
            <script>
              const logoutBtn = document.getElementById('logoutBtn');
              const logoutMenu = document.getElementById('logoutMenu');
              const ideLogout = document.getElementById('ideLogout');
              const fullLogout = document.getElementById('fullLogout');

              // 메뉴 토글
              logoutBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                logoutMenu.classList.toggle('show');
              });

              // 메뉴 외부 클릭시 닫기
              document.addEventListener('click', function(e) {
                if (!logoutMenu.contains(e.target) && !logoutBtn.contains(e.target)) {
                  logoutMenu.classList.remove('show');
                }
              });

              // IDE 로그아웃
              ideLogout.addEventListener('click', function() {
                const codeServerFrame = document.createElement('iframe');
                codeServerFrame.style.display = 'none';
                codeServerFrame.src = '/code-server/logout';
                document.body.appendChild(codeServerFrame);

                setTimeout(() => {
                  document.body.removeChild(codeServerFrame);
                  window.close();
                }, 1000);
              });

              // 전체 로그아웃
              fullLogout.addEventListener('click', function() {
                const codeServerFrame = document.createElement('iframe');
                codeServerFrame.style.display = 'none';
                codeServerFrame.src = '/code-server/logout';
                document.body.appendChild(codeServerFrame);

                const jcodeFrame = document.createElement('iframe');
                jcodeFrame.style.display = 'none';
                jcodeFrame.src = '/jcode/logout';
                document.body.appendChild(jcodeFrame);

                setTimeout(() => {
                  document.body.removeChild(codeServerFrame);
                  document.body.removeChild(jcodeFrame);
                  window.close();
                }, 1000);
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