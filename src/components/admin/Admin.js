import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Fade,
  Tabs,
  Tab,
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { useTheme } from '../../contexts/ThemeContext';

const Admin = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    studentNum: ''
  });
  const [sort, setSort] = useState({
    field: 'name',
    order: 'asc'
  });
  const [users, setUsers] = useState({
    professors: [],
    assistants: [],
    students: []
  });
  const { isDarkMode } = useTheme();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedItem) {
      setFormData({
        name: selectedItem.name || '',
        studentNum: selectedItem.studentId || ''
      });
    } else {
      setFormData({
        name: '',
        studentNum: ''
      });
    }
  }, [selectedItem]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.studentNum) {
        toast.error('모든 필드를 입력해주세요.');
        return;
      }

      if (dialogType === 'edit') {
        await api.put(`/api/users/${selectedItem.id}`, {
          name: formData.name,
          studentNum: parseInt(formData.studentNum)
        });
        toast.success('사용자 정보가 수정되었습니다.');
      } else if (dialogType === 'add') {
        // 추가 로직은 여기에 구현
      }

      fetchUsers();
      handleCloseDialog();
    } catch (error) {
      console.error('사용자 정보 수정 실패:', error);
      toast.error('사용자 정보 수정에 실패했습니다.');
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/users');
      
      // 역할별로 사용자 분류
      const categorizedUsers = response.data.reduce((acc, user) => {
        switch (user.role) {
          case 'PROFESSOR':
            acc.professors.push({
              id: user.userId,
              name: user.name,
              studentId: user.studentNum?.toString() || '-',
              email: user.email
            });
            break;
          case 'ASSISTANT':
            acc.assistants.push({
              id: user.userId,
              name: user.name,
              studentId: user.studentNum?.toString() || '-',
              email: user.email
            });
            break;
          case 'STUDENT':
            acc.students.push({
              id: user.userId,
              name: user.name,
              studentId: user.studentNum?.toString() || '-',
              email: user.email
            });
            break;
          default:
            break;
        }
        return acc;
      }, {
        professors: [],
        assistants: [],
        students: []
      });

      setUsers(categorizedUsers);
      setLoading(false);
    } catch (error) {
      console.error('사용자 목록 조회 실패:', error);
      toast.error('사용자 목록을 불러오는데 실패했습니다.');
      setLoading(false);
    }
  };

  // 탭 변경 핸들러
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // 다이얼로그 열기
  const handleOpenDialog = (type, item = null) => {
    setDialogType(type);
    setSelectedItem(item);
    setOpenDialog(true);
  };

  // 다이얼로그 닫기
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedItem(null);
  };

  // 사용자 삭제 핸들러
  const handleDeleteUser = async () => {
    try {
      const token = sessionStorage.getItem('jwt');
      if (!token) {
        toast.error('인증 토큰이 없습니다. 다시 로그인해주세요.');
        return;
      }

      await api.delete(`/api/users/${selectedItem.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // 성공 토스트 메시지
      toast.success(`${selectedItem.name} (${selectedItem.email}) 사용자가 삭제되었습니다.`, {
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

      // 사용자 목록 새로고침
      fetchUsers();
      
      // 다이얼로그 닫기
      handleCloseDialog();
    } catch (error) {
      console.error('사용자 삭제 실패:', error);
      
      // 에러 메시지 표시
      const errorMessage = error.response?.status === 404 ? "존재하지 않는 사용자입니다."
        : error.response?.status === 403 ? "삭제 권한이 없습니다."
        : "사용자 삭제 중 오류가 발생했습니다.";

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

  // 정렬 토글 함수
  const toggleSort = (field) => {
    setSort(prev => ({
      field: field,
      order: prev.field === field ? (prev.order === 'asc' ? 'desc' : 'asc') : 'asc'
    }));
  };

  // 필터링 및 정렬된 사용자 목록 반환
  const getFilteredAndSortedUsers = (items) => {
    const filtered = items.filter(item => {
      const searchLower = searchQuery.toLowerCase();
      return (
        item.name?.toLowerCase().includes(searchLower) ||
        item.email?.toLowerCase().includes(searchLower) ||
        (item.studentId && item.studentId.toLowerCase().includes(searchLower))
      );
    });

    return filtered.sort((a, b) => {
      let aValue = a[sort.field] || '';
      let bValue = b[sort.field] || '';
      
      if (sort.field === 'studentId') {
        aValue = a.studentId || '';
        bValue = b.studentId || '';
      }

      return sort.order === 'asc'
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  };

  // 각 섹션별 데이터
  const sections = {
    professors: {
      title: '교수 관리',
      items: users.professors
    },
    assistants: {
      title: '조교 관리',
      items: users.assistants
    },
    students: {
      title: '학생 관리',
      items: users.students
    }
  };

  // 관리 테이블 렌더링
  const renderTable = (section) => {
    const columns = {
      professors: [
        { id: 'name', label: '이름' },
        { id: 'studentId', label: '교번' },
        { id: 'email', label: '이메일' }
      ],
      assistants: [
        { id: 'name', label: '이름' },
        { id: 'studentId', label: '학번' },
        { id: 'email', label: '이메일' }
      ],
      students: [
        { id: 'name', label: '이름' },
        { id: 'studentId', label: '학번' },
        { id: 'email', label: '이메일' }
      ]
    };

    const sectionKey = Object.keys(sections)[currentTab];

    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      );
    }

    return (
      <>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="이름, 이메일, 학번으로 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ 
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
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {columns[sectionKey].map((column) => (
                  <TableCell 
                    key={column.id}
                    sx={{ 
                      fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                      fontWeight: 600
                    }}
                  >
                    {column.label}
                    <IconButton size="small" onClick={() => toggleSort(column.id)} sx={{ ml: 1 }}>
                      <Box sx={{ 
                        transform: sort.field !== column.id ? 'rotate(0deg)' : (sort.order === 'asc' ? 'rotate(180deg)' : 'rotate(0deg)'),
                        transition: 'transform 0.2s ease-in-out',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <KeyboardArrowDownIcon fontSize="small" />
                      </Box>
                    </IconButton>
                  </TableCell>
                ))}
                <TableCell sx={{ 
                  fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                  fontWeight: 600
                }}>
                  관리
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getFilteredAndSortedUsers(section.items).map((item) => (
                <TableRow key={item.id}>
                  <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                    {item.name}
                  </TableCell>
                  {(sectionKey === 'students' || sectionKey === 'assistants' || sectionKey === 'professors') && (
                    <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                      {item.studentId}
                    </TableCell>
                  )}
                  <TableCell sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                    {item.email}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog('edit', item)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog('delete', item)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow 
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: (theme) => theme.palette.action.hover
                  }
                }}
                onClick={() => handleOpenDialog('add')}
              >
                <TableCell 
                  colSpan={4} 
                  align="center"
                  sx={{ 
                    fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                    color: 'primary.main',
                    py: 2
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <AddIcon />
                    <Typography sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
                      {sections[Object.keys(sections)[currentTab]].title.replace(' 관리', '') + ' 추가'}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        {getFilteredAndSortedUsers(section.items).length === 0 && (
          <Typography 
            sx={{ 
              mt: 2, 
              textAlign: 'center',
              fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif"
            }}
          >
            {searchQuery ? '검색 결과가 없습니다.' : '등록된 사용자가 없습니다.'}
          </Typography>
        )}
      </>
    );
  };

  // 다이얼로그 렌더링
  const renderDialog = () => {
    const sectionKey = Object.keys(sections)[currentTab];
    const section = sections[sectionKey];

    if (!openDialog) return null;

    return (
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
          {dialogType === 'add' ? `${section.title} 추가` :
           dialogType === 'edit' ? `${section.title} 수정` :
           `${section.title} 삭제`}
        </DialogTitle>
        <DialogContent>
          {dialogType !== 'delete' ? (
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                name="name"
                label="이름"
                value={formData.name}
                onChange={handleInputChange}
                required
                sx={{ mb: 2 }}
                InputProps={{
                  sx: { fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }
                }}
                InputLabelProps={{
                  sx: { fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }
                }}
              />
              <TextField
                fullWidth
                name="studentNum"
                label={sectionKey === 'professors' ? '교번' : '학번'}
                value={formData.studentNum}
                onChange={handleInputChange}
                required
                type="number"
                InputProps={{
                  sx: { fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }
                }}
                InputLabelProps={{
                  sx: { fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }
                }}
              />
            </Box>
          ) : (
            <Typography sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
              {selectedItem.name} ({selectedItem.email}) 사용자를 삭제하시겠습니까?
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDialog}
            sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
          >
            취소
          </Button>
          <Button 
            onClick={dialogType === 'delete' ? handleDeleteUser : handleSubmit}
            variant="contained"
            color={dialogType === 'delete' ? 'error' : 'primary'}
            sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
          >
            {dialogType === 'add' ? '추가' :
             dialogType === 'edit' ? '수정' : '삭제'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Fade in={true} timeout={300}>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark' ? '#282A36' : '#FFFFFF',
            border: (theme) =>
              `1px solid ${theme.palette.mode === 'dark' ? '#44475A' : '#E0E0E0'}`,
            borderRadius: '16px'
          }}
        >
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              {Object.values(sections).map((section) => (
                <Tab
                  key={section.title}
                  label={section.title}
                  sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}
                />
              ))}
            </Tabs>
          </Box>

          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif" }}>
              {sections[Object.keys(sections)[currentTab]].title}
            </Typography>
          </Box>

          <Card
            sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark' ? '#282A36' : '#FFFFFF',
              border: (theme) =>
                `1px solid ${theme.palette.mode === 'dark' ? '#44475A' : '#E0E0E0'}`,
              borderRadius: '12px'
            }}
          >
            <CardContent>
              {renderTable(sections[Object.keys(sections)[currentTab]])}
            </CardContent>
          </Card>
        </Paper>
        {renderDialog()}
      </Container>
    </Fade>
  );
};

export default Admin; 