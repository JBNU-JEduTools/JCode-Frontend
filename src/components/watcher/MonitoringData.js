import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Grid,
  CircularProgress,
  Card,
  CardContent,
  Box,
  IconButton,
  Chip,
  Fade
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { mockMonitoringData } from '../../mockData/classes';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

const MonitoringData = () => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { studentId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const fetchMonitoringData = async () => {
      try {
        // TODO: API 구현 필요 - GET /api/monitoring/{studentId}
        // Response: { 
        //   studentData: { name, studentId, totalCodeChanges, ... },
        //   submissionStats: { ... },
        //   timeSeriesData: [ ... ]
        // }
        // 목업 데이터 사용
        const data = mockMonitoringData[studentId];
        if (data) {
          setStudentData(data);
        } else {
          setError('학생 데이터를 찾을 수 없습니다.');
        }
      } catch (err) {
        setError('모니터링 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchMonitoringData();
  }, [studentId]);

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

  if (!studentData || !studentData.submissionStats) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography>
          데이터를 찾을 수 없습니다.
        </Typography>
      </Container>
    );
  }

  return (
    <Fade in={true} timeout={300}>
      <Container 
        maxWidth={false}
        sx={{ 
          mt: 2,
          px: 2,
        }}
      >
        <Paper 
          elevation={1}
          sx={{ 
            p: 2,
            minHeight: 'calc(100vh - 100px)',
            borderRadius: 0
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton 
              onClick={() => navigate(-1)} 
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
              {studentData.name} ({studentData.studentId}) - 모니터링 데이터
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* 요약 통계 */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
                  >
                    코드 변경
                  </Typography>
                  <Typography variant="h4">
                    {studentData.totalCodeChanges}회
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
                  >
                    컴파일 시도
                  </Typography>
                  <Typography variant="h4">
                    {studentData.totalCompiles}회
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
                  >
                    정답 제출
                  </Typography>
                  <Typography variant="h4">
                    {studentData.correctSubmissions}회
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* 제출 현황 도넛 차트 */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
                  >
                    문제 제출 현황
                  </Typography>
                  <Box sx={{ 
                    height: 300, 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <Box sx={{ width: '60%', height: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={studentData.submissionStats.stats}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {studentData.submissionStats.stats.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value, name) => [`${value}회`, name]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                    <Box sx={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.5,
                      width: '40%',
                      pl: 2
                    }}>
                      {studentData.submissionStats.stats.map((entry, index) => (
                        <Box 
                          key={`legend-${index}`}
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            gap: 1
                          }}
                        >
                          <Box 
                            sx={{ 
                              width: 12, 
                              height: 12, 
                              backgroundColor: (theme) => theme.palette.primary.main,
                              borderRadius: '50%'
                            }} 
                          />
                          <Typography variant="body2">
                            {entry.name} ({entry.value}회)
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* 최근 제출 기록 */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
                  >
                    최근 제출 기록
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell 
                            sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
                          >
                            문제
                          </TableCell>
                          <TableCell 
                            sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
                          >
                            제출 시간
                          </TableCell>
                          <TableCell 
                            sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
                          >
                            상태
                          </TableCell>
                          <TableCell 
                            sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
                          >
                            실행시간
                          </TableCell>
                          <TableCell 
                            sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
                          >
                            메모리
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {studentData.recentSubmissions?.map((submission) => (
                          <TableRow key={submission.id}>
                            <TableCell 
                              sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
                            >
                              {submission.problemName}
                            </TableCell>
                            <TableCell 
                              sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
                            >
                              {submission.submitTime}
                            </TableCell>
                            <TableCell 
                              sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
                            >
                              <Chip 
                                label={submission.status}
                                size="small"
                                color={
                                  submission.status === '정답' ? 'success' :
                                  submission.status === '오답' ? 'error' :
                                  submission.status === '컴파일 에러' ? 'warning' : 'info'
                                }
                              />
                            </TableCell>
                            <TableCell 
                              sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
                            >
                              {submission.runtime}
                            </TableCell>
                            <TableCell 
                              sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
                            >
                              {submission.memory}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* 시계열 그래프 */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
                  >
                    시간별 활동 현황
                  </Typography>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={studentData.timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                          dataKey="timestamp" 
                          tick={{ fontSize: 12 }}
                          tickMargin={10}
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          tickMargin={10}
                        />
                        <Tooltip 
                          formatter={(value, name) => [
                            `${value}회`,
                            name === 'codeChanges' ? '코드 변경' : '컴파일'
                          ]}
                          labelFormatter={(label) => `${label}`}
                        />
                        <Legend 
                          verticalAlign="top" 
                          height={36}
                          formatter={(value) => 
                            value === 'codeChanges' ? '코드 변경' : '컴파일'
                          }
                        />
                        <Line 
                          type="monotone" 
                          dataKey="codeChanges" 
                          name="코드 변경" 
                          stroke="#8884d8" 
                          strokeWidth={2}
                          dot={{ strokeWidth: 2 }}
                          activeDot={{ r: 6, strokeWidth: 2 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="compiles" 
                          name="컴파일" 
                          stroke="#82ca9d" 
                          strokeWidth={2}
                          dot={{ strokeWidth: 2 }}
                          activeDot={{ r: 6, strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Fade>
  );
};

export default MonitoringData; 