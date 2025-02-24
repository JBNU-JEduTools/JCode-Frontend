import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Button,
  Box,
  IconButton
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { mockClasses } from '../../mockData/classes';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [className, setClassName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { classId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // TODO: API 구현 필요 - GET /api/classes/{classId}/students
        // Response: { 
        //   className: string,
        //   students: Array<{ id, studentId, name, email, lastActive }>
        // }
        // 목업 데이터에서 해당 수업 찾기
        const classData = mockClasses.find(c => c.id === parseInt(classId));
        if (classData) {
          setStudents(classData.students);
          setClassName(classData.name);
        } else {
          setError('수업을 찾을 수 없습니다.');
        }
      } catch (err) {
        setError('학생 목록을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [classId]);

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
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={7} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton 
            onClick={() => navigate('/watcher')} 
            sx={{ 
              mr: 2,
              '&:hover': {
                backgroundColor: (theme) => theme.palette.action.hover
              }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography 
            variant="h5"
            sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
          >
            {className} - 수강생 목록
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>학번</TableCell>
                <TableCell>이름</TableCell>
                <TableCell>이메일</TableCell>
                <TableCell>최근 활동</TableCell>
                <TableCell>상세 보기</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.studentId}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.lastActive}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => navigate(`/watcher/student/${student.id}`)}
                      sx={{ 
                        fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                        fontSize: '0.75rem',
                        py: 0.5,
                        px: 1.5,
                        minHeight: '28px',
                        borderRadius: '14px',
                        textTransform: 'none',
                        backgroundColor: (theme) => theme.palette.primary.main,
                        '&:hover': {
                          backgroundColor: (theme) => theme.palette.primary.dark
                        }
                      }}
                    >
                      모니터링
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {students.length === 0 && (
          <Typography 
            sx={{ 
              mt: 2, 
              textAlign: 'center',
              fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
            }}
          >
            수강생이 없습니다.
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default StudentList; 