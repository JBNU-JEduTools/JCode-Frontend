import React, { useState } from 'react';
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
  Button,
  Box,
  TextField,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { mockStudents } from '../../mockData/adminData';

const StudentManagement = () => {
  const [students, setStudents] = useState(mockStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const handleSearch = () => {
    // TODO: API 구현 필요 - GET /api/admin/students?search={searchTerm}
    // Response: Array<{
    //   id: number,
    //   studentId: string,
    //   name: string,
    //   email: string,
    //   status: string,
    //   enrolledClasses: string[],
    //   createdAt: string
    // }>
    if (!searchTerm) {
      setStudents(mockStudents);
      return;
    }
    
    const filtered = mockStudents.filter(student => 
      student.studentId.includes(searchTerm) ||
      student.name.includes(searchTerm) ||
      student.email.includes(searchTerm)
    );
    setStudents(filtered);
  };

  const handleEdit = (student) => {
    // TODO: API 구현 필요 - PUT /api/admin/students/{studentId}
    // Request: { name: string, email: string, status: string }
    // Response: { success: boolean, message: string }
    setSelectedStudent(student);
    setEditDialogOpen(true);
  };

  const handleStatusToggle = (studentId) => {
    // TODO: API 구현 필요 - PUT /api/admin/students/{studentId}/status
    // Request: { status: '활성' | '비활성' }
    // Response: { success: boolean, message: string }
    setStudents(students.map(student => {
      if (student.id === studentId) {
        return {
          ...student,
          status: student.status === '활성' ? '비활성' : '활성'
        };
      }
      return student;
    }));
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          학생 계정 관리
        </Typography>

        {/* 검색 영역 */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            placeholder="학번, 이름 또는 이메일로 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1 }}
          />
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
          >
            검색
          </Button>
        </Box>

        {/* 학생 목록 테이블 */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>학번</TableCell>
                <TableCell>이름</TableCell>
                <TableCell>이메일</TableCell>
                <TableCell>수강 중인 수업</TableCell>
                <TableCell>상태</TableCell>
                <TableCell>가입일</TableCell>
                <TableCell>관리</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.studentId}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>
                    {student.enrolledClasses.map((className, index) => (
                      <Chip
                        key={index}
                        label={className}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={student.status}
                      color={student.status === '활성' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{student.createdAt}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(student)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleStatusToggle(student.id)}
                      color={student.status === '활성' ? 'error' : 'success'}
                    >
                      {student.status === '활성' ? <BlockIcon /> : <CheckCircleIcon />}
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 학생 정보 수정 다이얼로그 */}
        <Dialog 
          open={editDialogOpen} 
          onClose={() => setEditDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>학생 정보 수정</DialogTitle>
          <DialogContent>
            {selectedStudent && (
              <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="학번"
                  value={selectedStudent.studentId}
                  fullWidth
                  disabled
                />
                <TextField
                  label="이름"
                  value={selectedStudent.name}
                  fullWidth
                />
                <TextField
                  label="이메일"
                  value={selectedStudent.email}
                  fullWidth
                />
                <FormControl fullWidth>
                  <InputLabel>상태</InputLabel>
                  <Select
                    value={selectedStudent.status}
                    label="상태"
                  >
                    <MenuItem value="활성">활성</MenuItem>
                    <MenuItem value="비활성">비활성</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>취소</Button>
            <Button variant="contained">저장</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default StudentManagement; 