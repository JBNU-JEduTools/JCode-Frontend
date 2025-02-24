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
  Select,
  MenuItem,
  InputAdornment,
  Fade
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import api from '../../api/axios';

const ProfessorManagement = () => {
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    password: '',
    student_num: '',
    school: 'JBNU',
    role: 'PROFESSOR'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortField, setSortField] = useState('email');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');

  // 교수 목록 조회
  const fetchUsers = async () => {
    try {
      const response = await api.get('/users?role=PROFESSOR');
      const professorUsers = response.data.filter(user => user.role === 'PROFESSOR');
      setUsers(professorUsers);
      setLoading(false);
    } catch (error) {
      setError('교수 목록을 불러오는데 실패했습니다.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 교수 추가
  const handleAddUser = async () => {
    try {
      const response = await api.post('/users/professor', {
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
      console.error('교수 추가 실패:', error);
      setError('교수 추가에 실패했습니다.');
    }
  };

  // 교수 삭제
  const handleDeleteUser = async (email) => {
    try {
      await api.delete(`/users/${email}`);
      await fetchUsers();
    } catch (error) {
      setError('교수 삭제에 실패했습니다.');
    }
  };

  const getFilteredAndSortedUsers = () => {
    // 검색어로 필터링
    const filtered = users.filter(user => {
      const searchLower = searchQuery.toLowerCase();
      const emailMatch = user.email?.toLowerCase().includes(searchLower);
      const nameMatch = user.name?.toLowerCase().includes(searchLower);
      return emailMatch || nameMatch;
    });

    // 정렬
    return filtered.sort((a, b) => {
      const field = sortField;
      const aValue = String(a[field] || '');
      const bValue = String(b[field] || '');
      
      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      }
      return bValue.localeCompare(aValue);
    });
  };

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  if (loading) return <Typography>로딩 중...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
          교수 계정 관리
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <TextField
            size="small"
            placeholder="이메일 또는 이름으로 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ 
              width: 300,
              '& .MuiInputBase-root': {
                fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button 
            variant="contained" 
            onClick={() => setOpenDialog(true)}
          >
            교수 추가
          </Button>
        </Box>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell 
                sx={{ 
                  fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                  fontWeight: 'bold'
                }}
              >
                이메일
                <IconButton
                  size="small"
                  onClick={() => toggleSort('email')}
                  sx={{ ml: 1 }}
                >
                  {sortOrder === 'asc' ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
                </IconButton>
              </TableCell>
              <TableCell 
                sx={{ 
                  fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                  fontWeight: 'bold'
                }}
              >
                이름
                <IconButton
                  size="small"
                  onClick={() => toggleSort('name')}
                  sx={{ ml: 1 }}
                >
                  {sortOrder === 'asc' ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
                </IconButton>
              </TableCell>
              <TableCell 
                sx={{ 
                  fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                  fontWeight: 'bold'
                }}
              >
                학교
              </TableCell>
              <TableCell 
                sx={{ 
                  fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                  fontWeight: 'bold'
                }}
              >
                작업
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getFilteredAndSortedUsers().map((user) => (
              <TableRow 
                key={user.email}
                sx={{ 
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
                  }
                }}
              >
                <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                  {user.email}
                </TableCell>
                <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                  {user.name}
                </TableCell>
                <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                  {user.school}
                </TableCell>
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

      {getFilteredAndSortedUsers().length === 0 && (
        <Typography 
          sx={{ 
            mt: 2, 
            textAlign: 'center',
            fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
          }}
        >
          {searchQuery ? '검색 결과가 없습니다.' : '등록된 교수가 없습니다.'}
        </Typography>
      )}

      {/* 교수 추가 다이얼로그 */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>교수 추가</DialogTitle>
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
            label="교번"
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

export default ProfessorManagement; 