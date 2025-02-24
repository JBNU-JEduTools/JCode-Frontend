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
  Button,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Fade,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../../api/axios';

const AssistantManagement = () => {
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    password: '',
    student_num: '',
    school: 'JBNU',
    role: 'ASSISTANCE'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 조교 목록 조회
  const fetchUsers = async () => {
    try {
      const response = await api.get('/users?role=ASSISTANCE');
      const assistantUsers = response.data.filter(user => user.role === 'ASSISTANCE');
      setUsers(assistantUsers);
      setLoading(false);
    } catch (error) {
      setError('조교 목록을 불러오는데 실패했습니다.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 조교 추가
  const handleAddUser = async () => {
    try {
      const response = await api.post('/users/assistance', {
        email: newUser.email,
        name: newUser.name,
        password: newUser.password,
        student_num: newUser.student_num
      });
      if (response.status === 200) {
        await fetchUsers();
        setOpenDialog(false);
        setNewUser({ 
          email: '', 
          name: '', 
          password: '',
          student_num: '',
          school: 'JBNU' 
        });
      }
    } catch (error) {
      console.error('조교 추가 실패:', error);
      setError('조교 추가에 실패했습니다.');
    }
  };

  // 조교 삭제
  const handleDeleteUser = async (email) => {
    try {
      await api.delete(`/users/${email}`);
      await fetchUsers();
    } catch (error) {
      setError('조교 삭제에 실패했습니다.');
    }
  };

  if (loading) return <Typography>로딩 중...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">조교 계정 관리</Typography>
        <Button variant="contained" onClick={() => setOpenDialog(true)}>
          조교 추가
        </Button>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>이메일</TableCell>
              <TableCell>이름</TableCell>
              <TableCell>학교</TableCell>
              <TableCell>작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.email}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.school}</TableCell>
                <TableCell>
                  <IconButton 
                    color="error" 
                    size="small"
                    onClick={() => handleDeleteUser(user.email)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>조교 추가</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="이메일"
            type="email"
            fullWidth
            required
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          <TextField
            margin="dense"
            label="이름"
            fullWidth
            required
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="비밀번호"
            type="password"
            fullWidth
            required
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          />
          <TextField
            margin="dense"
            label="학번"
            fullWidth
            required
            value={newUser.student_num}
            onChange={(e) => setNewUser({ ...newUser, student_num: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>취소</Button>
          <Button onClick={handleAddUser}>추가</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssistantManagement; 