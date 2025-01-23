import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';

const Watcher = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    // TODO: API에서 수업 목록 가져오기
    setClasses([
      { id: 1, name: '자료구조' },
      { id: 2, name: '알고리즘' },
    ]);
  }, []);

  useEffect(() => {
    if (selectedClass) {
      // TODO: API에서 학생 목록 가져오기
      setStudents([
        { id: 1, name: '학생1', codeChanges: 50, compileCount: 10, submissionResult: 'Pass' },
        { id: 2, name: '학생2', codeChanges: 30, compileCount: 5, submissionResult: 'Fail' },
      ]);
    }
  }, [selectedClass]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        학생 모니터링
      </Typography>
      
      <FormControl fullWidth sx={{ mb: 4 }}>
        <InputLabel>수업 선택</InputLabel>
        <Select
          value={selectedClass}
          label="수업 선택"
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          {classes.map((cls) => (
            <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedClass && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>학생 이름</TableCell>
                <TableCell align="right">코드 변경량</TableCell>
                <TableCell align="right">컴파일 횟수</TableCell>
                <TableCell align="right">제출 결과</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell component="th" scope="row">
                    {student.name}
                  </TableCell>
                  <TableCell align="right">{student.codeChanges}</TableCell>
                  <TableCell align="right">{student.compileCount}</TableCell>
                  <TableCell align="right">{student.submissionResult}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default Watcher; 