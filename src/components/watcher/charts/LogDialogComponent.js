import React from 'react';
import { 
  Box, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  Typography, 
  IconButton, 
  Chip, 
  Paper 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

/**
 * 로그 정보를 표시하는 다이얼로그 컴포넌트
 * 
 * @param {Object} props 
 * @param {boolean} props.open - 다이얼로그 표시 여부
 * @param {Function} props.onClose - 닫기 이벤트 핸들러
 * @param {Object} props.selectedLog - 표시할 로그 데이터
 * @param {boolean} props.isDarkMode - 다크모드 여부
 */
const LogDialogComponent = ({ open, onClose, selectedLog, isDarkMode }) => {
  if (!selectedLog) return null;
  
  // isRun 필드를 사용하여 로그 타입 결정
  const isRunLog = selectedLog.isRun === true;
  const title = isRunLog ? '실행 로그 정보' : '빌드 로그 정보';
  const statusText = selectedLog.exit_code === 0 ? '성공' : '실패';
  const statusColor = selectedLog.exit_code === 0 ? 
    (isDarkMode ? '#50FA7B' : '#4CAF50') : 
    (isDarkMode ? '#FF5555' : '#F44336');
  
  // 안전하게 timestamp 표시
  const formattedTime = selectedLog.timestamp ? 
    new Date(selectedLog.timestamp).toLocaleString() : '정보 없음';
  
  // 명령어가 없는 경우 대체 텍스트 사용
  const commandText = selectedLog.cmdline || selectedLog.command || '알 수 없음';
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: {
          borderRadius: '8px',
          boxShadow: isDarkMode ? 
            '0 4px 20px rgba(0, 0, 0, 0.3)' : 
            '0 4px 20px rgba(0, 0, 0, 0.1)',
          backgroundColor: isDarkMode ? '#282A36' : '#FFFFFF'
        }
      }}
    >
      <DialogTitle sx={{ 
        fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 24px'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isRunLog ? '▶️' : '🔨'} {title}
          <Chip 
            label={statusText} 
            size="small" 
            sx={{ 
              ml: 1,
              backgroundColor: statusColor,
              color: '#FFF',
              fontWeight: 'bold'
            }} 
          />
        </Box>
        <IconButton 
          onClick={onClose}
          size="small"
          sx={{ color: isDarkMode ? '#6272A4' : '#9E9E9E' }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ 
        padding: '24px',
        backgroundColor: isDarkMode ? '#282A36' : '#FFFFFF'
      }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {/* 왼쪽 컬럼 */}
          <Box>
            <Typography variant="subtitle2" sx={{ 
              color: isDarkMode ? '#F8F8F2' : '#282A36',
              mb: 2,
              fontWeight: 'bold',
              fontSize: '1rem',
              borderBottom: `2px solid ${isDarkMode ? '#BD93F9' : '#6272A4'}`,
              paddingBottom: '8px'
            }}>
              기본 정보
            </Typography>
            
            <Paper elevation={0} sx={{ 
              p: 3, 
              backgroundColor: isDarkMode ? '#44475A' : '#F5F5F5',
              borderRadius: '4px',
              mb: 2
            }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ 
                    color: isDarkMode ? '#6272A4' : '#757575',
                    display: 'block',
                    mb: 1,
                    fontWeight: 'bold'
                  }}>
                    상태
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ 
                      fontFamily: "'JetBrains Mono', monospace",
                      color: statusColor,
                      fontWeight: 'bold'
                    }}>
                      {statusText} (종료 코드: {selectedLog.exit_code})
                    </Typography>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="caption" sx={{ 
                    color: isDarkMode ? '#6272A4' : '#757575',
                    display: 'block',
                    mb: 1,
                    fontWeight: 'bold'
                  }}>
                    타임스탬프
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    fontFamily: "'JetBrains Mono', monospace",
                    color: isDarkMode ? '#F8F8F2' : '#282A36'
                  }}>
                    {formattedTime}
                  </Typography>
                </Box>
                
                {selectedLog.process_type && (
                  <Box>
                    <Typography variant="caption" sx={{ 
                      color: isDarkMode ? '#6272A4' : '#757575',
                      display: 'block',
                      mb: 1,
                      fontWeight: 'bold'
                    }}>
                      프로세스 유형
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      fontFamily: "'JetBrains Mono', monospace",
                      color: isDarkMode ? '#F8F8F2' : '#282A36'
                    }}>
                      {selectedLog.process_type}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Box>
          
          {/* 오른쪽 컬럼 */}
          <Box>
            <Typography variant="subtitle2" sx={{ 
              color: isDarkMode ? '#F8F8F2' : '#282A36',
              mb: 2,
              fontWeight: 'bold',
              fontSize: '1rem',
              borderBottom: `2px solid ${isDarkMode ? '#BD93F9' : '#6272A4'}`,
              paddingBottom: '8px'
            }}>
              경로 정보
            </Typography>
            
            <Paper elevation={0} sx={{ 
              p: 3, 
              backgroundColor: isDarkMode ? '#44475A' : '#F5F5F5',
              borderRadius: '4px',
              mb: 2
            }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {selectedLog.cwd && (
                  <Box>
                    <Typography variant="caption" sx={{ 
                      color: isDarkMode ? '#6272A4' : '#757575',
                      display: 'block',
                      mb: 1,
                      fontWeight: 'bold'
                    }}>
                      작업 디렉토리
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      fontFamily: "'JetBrains Mono', monospace",
                      wordBreak: 'break-all',
                      color: isDarkMode ? '#F8F8F2' : '#282A36'
                    }}>
                      {selectedLog.cwd}
                    </Typography>
                  </Box>
                )}
                
                {selectedLog.target_path && (
                  <Box>
                    <Typography variant="caption" sx={{ 
                      color: isDarkMode ? '#6272A4' : '#757575',
                      display: 'block',
                      mb: 1,
                      fontWeight: 'bold'
                    }}>
                      대상 파일
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      fontFamily: "'JetBrains Mono', monospace",
                      wordBreak: 'break-all',
                      color: isDarkMode ? '#F8F8F2' : '#282A36'
                    }}>
                      {selectedLog.target_path}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Box>
        </Box>
        
        {/* 명령어 정보 (전체 너비) */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle2" sx={{ 
            color: isDarkMode ? '#F8F8F2' : '#282A36',
            mb: 2,
            fontWeight: 'bold',
            fontSize: '1rem',
            borderBottom: `2px solid ${isDarkMode ? '#BD93F9' : '#6272A4'}`,
            paddingBottom: '8px'
          }}>
            명령어
          </Typography>
          
          <Paper elevation={0} sx={{ 
            p: 3, 
            backgroundColor: isDarkMode ? '#44475A' : '#F5F5F5',
            borderRadius: '4px',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.9rem',
            overflowX: 'auto',
            color: isDarkMode ? '#F8F8F2' : '#282A36'
          }}>
            {commandText}
          </Paper>
        </Box>
        
        {/* 표준 출력 */}
        {selectedLog.stdout && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle2" sx={{ 
              color: isDarkMode ? '#F8F8F2' : '#282A36',
              mb: 2,
              fontWeight: 'bold',
              fontSize: '1rem',
              borderBottom: `2px solid ${isDarkMode ? '#BD93F9' : '#6272A4'}`,
              paddingBottom: '8px'
            }}>
              표준 출력
            </Typography>
            
            <Paper elevation={0} sx={{ 
              p: 3, 
              backgroundColor: isDarkMode ? '#44475A' : '#F5F5F5',
              borderRadius: '4px',
              maxHeight: '200px',
              overflow: 'auto'
            }}>
              <pre style={{ 
                margin: 0, 
                whiteSpace: 'pre-wrap', 
                wordBreak: 'break-word',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '14px',
                color: isDarkMode ? '#F8F8F2' : '#282A36'
              }}>
                {selectedLog.stdout}
              </pre>
            </Paper>
          </Box>
        )}
        
        {/* 표준 에러 */}
        {selectedLog.stderr && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle2" sx={{ 
              color: isDarkMode ? '#F8F8F2' : '#282A36',
              mb: 2,
              fontWeight: 'bold',
              fontSize: '1rem',
              borderBottom: `2px solid ${isDarkMode ? '#BD93F9' : '#6272A4'}`,
              paddingBottom: '8px'
            }}>
              표준 에러
            </Typography>
            
            <Paper elevation={0} sx={{ 
              p: 3, 
              backgroundColor: isDarkMode ? '#44475A' : '#F5F5F5',
              borderRadius: '4px',
              maxHeight: '200px',
              overflow: 'auto'
            }}>
              <pre style={{ 
                margin: 0, 
                whiteSpace: 'pre-wrap', 
                wordBreak: 'break-word',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '14px',
                color: isDarkMode ? '#FF5555' : '#F44336'
              }}>
                {selectedLog.stderr}
              </pre>
            </Paper>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LogDialogComponent; 