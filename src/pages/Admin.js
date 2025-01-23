import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box
} from '@mui/material';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    role: 'student'
  });

  useEffect(() => {
    // TODO: API에서 사용자 목록 가져오기
    setUsers([
      { id: 1, email: 'student@jbnu.ac.kr', role: 'student' },
      { id: 2, email: 'professor@jbnu.ac.kr', role: 'professor' },
    ]);
  }, []);

  const handleAddUser = () => {
    // TODO: API 연동
    setUsers([...users, { ...newUser, id: users.length + 1 }]);
    setOpenDialog(false);
    setNewUser({ email: '', role: 'student' });
  };

  const handleUpdateRole = async (userId, newRole) => {
    // TODO: API 연동
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">
          사용자 관리
        </Typography>
        <Button variant="contained" onClick={() => setOpenDialog(true)}>
          사용자 추가
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>이메일</TableCell>
              <TableCell>역할</TableCell>
              <TableCell>작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <FormControl size="small">
                    <Select
                      value={user.role}
                      onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                    >
                      <MenuItem value="student">학생</MenuItem>
                      <MenuItem value="professor">교수</MenuItem>
                      <MenuItem value="assistant">조교</MenuItem>
                      <MenuItem value="admin">관리자</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>사용자 추가</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="이메일"
            type="email"
            fullWidth
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>역할</InputLabel>
            <Select
              value={newUser.role}
              label="역할"
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <MenuItem value="student">학생</MenuItem>
              <MenuItem value="professor">교수</MenuItem>
              <MenuItem value="assistant">조교</MenuItem>
              <MenuItem value="admin">관리자</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>취소</Button>
          <Button onClick={handleAddUser}>추가</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Admin; 