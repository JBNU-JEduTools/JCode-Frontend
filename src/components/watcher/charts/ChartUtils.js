// 차트 스타일 및 유틸리티 함수
import Plotly from 'plotly.js-dist';

// 다크모드에 따른 공통 스타일 설정
export const getChartStyles = (isDarkMode) => {
  return {
    font: {
      family: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
      color: isDarkMode ? '#F8F8F2' : '#282A36'
    },
    paper_bgcolor: isDarkMode ? 'rgba(40, 42, 54, 0.8)' : '#FFFFFF',
    plot_bgcolor: isDarkMode ? 'rgba(40, 42, 54, 0.4)' : '#FFFFFF',
    gridcolor: isDarkMode ? '#44475A' : '#E0E0E0',
    zerolinecolor: isDarkMode ? '#44475A' : '#E0E0E0',
    colors: {
      primary: isDarkMode ? '#BD93F9' : '#6272A4',
      addition: isDarkMode ? '#50FA7B' : '#4E5C8E',
      deletion: isDarkMode ? '#FF5555' : '#FF79C6'
    },
    hoverlabel: {
      bgcolor: isDarkMode ? '#44475A' : '#FFFFFF',
      bordercolor: isDarkMode ? '#6272A4' : '#E0E0E0',
      font: {
        family: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
        color: isDarkMode ? '#F8F8F2' : '#282A36',
        size: 12
      }
    },
    legend: {
      x: 0.01,
      y: 0.99,
      bgcolor: isDarkMode ? 'rgba(68, 71, 90, 0.7)' : 'rgba(255, 255, 255, 0.7)',
      bordercolor: isDarkMode ? '#6272A4' : '#E0E0E0'
    },
    axis: {
      showspikes: true,
      spikecolor: isDarkMode ? '#BD93F9' : '#6272A4',
      spikethickness: 1,
      spikemode: 'across'
    }
  };
};

// 시간 포맷 설정 (x축에 표시되는 형식)
export const getTimeFormatStops = () => {
  return [
    {
      dtickrange: [null, 1000], // 1초 미만
      value: '%m-%d %H:%M:%S.%L'
    },
    {
      dtickrange: [1000, 60000], // 1초-1분
      value: '%m-%d %H:%M:%S'
    },
    {
      dtickrange: [60000, 3600000], // 1분-1시간
      value: '%m-%d %H:%M'
    },
    {
      dtickrange: [3600000, 86400000], // 1시간-1일
      value: '%m-%d %H:%M'
    },
    {
      dtickrange: [86400000, 604800000], // 1일-1주
      value: '%m-%d'
    },
    {
      dtickrange: [604800000, null], // 1주 이상
      value: '%Y-%m-%d'
    }
  ];
};

// // 툴팁에 표시할 날짜 형식 설정
// export const getTooltipDateFormat = (date) => {
//   if (!date) return '';
  
//   // 날짜가 문자열이면 Date 객체로 변환
//   let dateObj = date;
//   if (typeof date === 'string') {
//     dateObj = new Date(date);
//     // 날짜 변환에 실패한 경우
//     if (isNaN(dateObj.getTime())) {
//       return date; // 원본 문자열 반환
//     }
//   }
  
//   // 년-월-일 시:분:초 형식으로 변환
//   const year = dateObj.getFullYear();
//   const month = String(dateObj.getMonth() + 1).padStart(2, '0');
//   const day = String(dateObj.getDate()).padStart(2, '0');
//   const hours = String(dateObj.getHours()).padStart(2, '0');
//   const minutes = String(dateObj.getMinutes()).padStart(2, '0');
//   const seconds = String(dateObj.getSeconds()).padStart(2, '0');
  
//   return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
// };

// 툴팁 hovertemplate 생성
export const getHoverTemplate = (type, includeDate = true) => {
  const datePart = includeDate ? '<b>시간</b>: %{x|%Y-%m-%d %H:%M:%S}<br>' : '';
  
  switch (type) {
    case 'totalSize':
      return `${datePart}<b>크기</b>: %{y} B<extra></extra>`;
    case 'addition':
      return `${datePart}<b>변화량</b>: <b>+ %{y} B</b><extra></extra>`;
    case 'deletion':
      return `${datePart}<b>변화량</b>: <b>- %{customdata} B</b><extra></extra>`;
    default:
      return `${datePart}<b>값</b>: %{y}<extra></extra>`;
  }
};

// 빈 데이터를 위한 차트 생성
export const createEmptyChart = (chartId, isDarkMode, title = '데이터가 없습니다') => {
  const styles = getChartStyles(isDarkMode);
  
  const emptyTrace = {
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines+markers',
    name: '데이터 없음'
  };
  
  const emptyLayout = {
    title: title,
    font: styles.font,
    paper_bgcolor: styles.paper_bgcolor,
    plot_bgcolor: styles.plot_bgcolor,
    dragmode: 'pan', // 기본 드래그 모드를 pan으로 설정
    annotations: [{
      text: '해당 데이터가 없거나 로드하는데 실패했습니다',
      showarrow: false,
      font: {
        family: styles.font.family,
        size: 14
      },
      x: 0.5,
      y: 0.5,
      xref: 'paper',
      yref: 'paper'
    }]
  };
  
  const element = document.getElementById(chartId);
  if (element) {
    return Plotly.newPlot(chartId, [emptyTrace], emptyLayout);
  }
  return null;
};

// 가상 타임스탬프 생성
export const generateFakeTimestamps = (dataLength) => {
  return Array(dataLength).fill(0).map((_, index) => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - (dataLength - index));
    return date.toLocaleString('ko-KR');
  });
};

// 차트 이미지 저장 옵션
export const getImageSaveOptions = (student, assignment, chartType) => {
  const studentName = student ? student.name : '학생';
  const assignmentName = assignment ? assignment.assignmentName : '과제';
  const fileName = `${studentName}_${assignmentName}_${chartType}_${new Date().toISOString().split('T')[0]}`;
  
  return {
    format: 'png',
    filename: fileName,
    height: 800,
    width: 1200,
    scale: 2
  };
};

// 차트 동기화 설정
export const setupChartSync = (chartId, otherChartId, chartSyncEvents) => {
  const element = document.getElementById(chartId);
  
  if (element) {
    element.on('plotly_relayout', function(eventData) {
      // 이미 동기화 중이면 무시
      if (chartSyncEvents.isSyncing) return;
      
      // 디바운스 적용
      if (chartSyncEvents.debounceTimeout) {
        clearTimeout(chartSyncEvents.debounceTimeout);
      }
      
      chartSyncEvents.debounceTimeout = setTimeout(() => {
        if (eventData['xaxis.range[0]'] !== undefined && eventData['xaxis.range[1]'] !== undefined) {
          try {
            // 동기화 상태 설정
            chartSyncEvents.isSyncing = true;
            
            // xAxis 범위가 변경되면 이벤트 발생
            chartSyncEvents.xAxisUpdate = {
              source: chartId,
              range: [eventData['xaxis.range[0]'], eventData['xaxis.range[1]']]
            };
            
            // 다른 차트 동기화
            const otherElement = document.getElementById(otherChartId);
            if (otherElement && chartSyncEvents.xAxisUpdate.source !== otherChartId) {
              Plotly.relayout(otherChartId, {
                'xaxis.range[0]': eventData['xaxis.range[0]'],
                'xaxis.range[1]': eventData['xaxis.range[1]']
              });
            }
            
            // 동기화 완료 후 상태 해제
            setTimeout(() => {
              chartSyncEvents.isSyncing = false;
            }, 100);
          } catch (err) {
            chartSyncEvents.isSyncing = false;
          }
        }
      }, 200); // 200ms 디바운스
    });
  }
};

// 로그 카테고리 정의
export const LOG_CATEGORIES = {
  '실행 성공': 4,
  '실행 실패': 3,
  '빌드 성공': 2,
  '빌드 실패': 1
};

// 로그 트레이스 생성 함수
export const createLogTraces = (runLogs, buildLogs, isDarkMode) => {
  // 실행 성공 로그 트레이스
  const runLogsSuccessTrace = {
    x: runLogs.filter(log => log.exit_code === 0).map(log => {
      // timestamp가 문자열이면 Date 객체로 변환
      return typeof log.timestamp === 'string' ? new Date(log.timestamp).getTime() : log.timestamp;
    }),
    y: runLogs.filter(log => log.exit_code === 0).map(() => LOG_CATEGORIES['실행 성공']),
    type: 'scatter',
    mode: 'markers',
    name: '실행 성공',
    yaxis: 'y2',
    marker: {
      symbol: 'circle',
      size: 12,
      color: isDarkMode ? 'rgba(80, 250, 123, 0.8)' : 'rgba(76, 175, 80, 0.8)',
      line: {
        width: 1,
        color: isDarkMode ? '#50FA7B' : '#4CAF50'
      }
    },
    text: runLogs.filter(log => log.exit_code === 0).map(log => 
      `실행 시간: ${new Date(log.timestamp).toLocaleString()}<br>명령어: ${log.cmdline || log.command || '알 수 없음'}`
    ),
    hoverinfo: 'text'
  };
  
  // 실행 실패 로그 트레이스
  const runLogsFailTrace = {
    x: runLogs.filter(log => log.exit_code !== 0).map(log => {
      return typeof log.timestamp === 'string' ? new Date(log.timestamp).getTime() : log.timestamp;
    }),
    y: runLogs.filter(log => log.exit_code !== 0).map(() => LOG_CATEGORIES['실행 실패']),
    type: 'scatter',
    mode: 'markers',
    name: '실행 실패',
    yaxis: 'y2',
    marker: {
      symbol: 'circle',
      size: 12,
      color: isDarkMode ? 'rgba(255, 85, 85, 0.8)' : 'rgba(244, 67, 54, 0.8)',
      line: {
        width: 1,
        color: isDarkMode ? '#FF5555' : '#F44336'
      }
    },
    text: runLogs.filter(log => log.exit_code !== 0).map(log => 
      `실행 시간: ${new Date(log.timestamp).toLocaleString()}<br>명령어: ${log.cmdline || log.command || '알 수 없음'}`
    ),
    hoverinfo: 'text'
  };
  
  // 빌드 성공 로그 트레이스
  const buildLogsSuccessTrace = {
    x: buildLogs.filter(log => log.exit_code === 0).map(log => {
      return typeof log.timestamp === 'string' ? new Date(log.timestamp).getTime() : log.timestamp;
    }),
    y: buildLogs.filter(log => log.exit_code === 0).map(() => LOG_CATEGORIES['빌드 성공']),
    type: 'scatter',
    mode: 'markers',
    name: '빌드 성공',
    yaxis: 'y2',
    marker: {
      symbol: 'diamond',
      size: 12,
      color: isDarkMode ? 'rgba(139, 233, 253, 0.8)' : 'rgba(33, 150, 243, 0.8)',
      line: {
        width: 1,
        color: isDarkMode ? '#8BE9FD' : '#2196F3'
      }
    },
    text: buildLogs.filter(log => log.exit_code === 0).map(log => 
      `빌드 시간: ${new Date(log.timestamp).toLocaleString()}<br>명령어: ${log.cmdline || log.command || '알 수 없음'}`
    ),
    hoverinfo: 'text'
  };
  
  // 빌드 실패 로그 트레이스
  const buildLogsFailTrace = {
    x: buildLogs.filter(log => log.exit_code !== 0).map(log => {
      return typeof log.timestamp === 'string' ? new Date(log.timestamp).getTime() : log.timestamp;
    }),
    y: buildLogs.filter(log => log.exit_code !== 0).map(() => LOG_CATEGORIES['빌드 실패']),
    type: 'scatter',
    mode: 'markers',
    name: '빌드 실패',
    yaxis: 'y2',
    marker: {
      symbol: 'diamond',
      size: 12,
      color: isDarkMode ? 'rgba(255, 184, 108, 0.8)' : 'rgba(255, 152, 0, 0.8)',
      line: {
        width: 1,
        color: isDarkMode ? '#FFB86C' : '#FF9800'
      }
    },
    text: buildLogs.filter(log => log.exit_code !== 0).map(log => 
      `명령어: ${log.cmdline || log.command || '알 수 없음'}<br>빌드 시간: ${new Date(log.timestamp).toLocaleString()}<br>에러 코드: ${log.exit_code}`
    ),
    hoverinfo: 'text'
  };

  // 사용 가능한 모든 트레이스 객체 반환
  return {
    runLogsSuccessTrace,
    runLogsFailTrace,
    buildLogsSuccessTrace,
    buildLogsFailTrace
  };
};

// Y축 레이아웃 설정을 위한 함수
export const createLogYAxisLayout = (isDarkMode) => {
  return {
    title: '로그 유형',
    titlefont: {
      color: isDarkMode ? '#FFB86C' : '#FF9800',
      family: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
    },
    tickfont: {
      color: isDarkMode ? '#FFB86C' : '#FF9800',
      family: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
    },
    overlaying: 'y',
    side: 'right',
    showgrid: false,
    range: [0, 5],
    tickvals: [1, 2, 3, 4],
    ticktext: ['빌드 실패', '빌드 성공', '실행 실패', '실행 성공'],
    zeroline: false,
    fixedrange: true, // y2축 확대/축소 비활성화
    autorange: false, // 자동 범위 조정 비활성화
    constrain: 'domain' // 도메인 내에서 고정
  };
};

// 날짜 변환 유틸리티 함수
export const getDateFromValue = (value) => {
  if (typeof value === 'number') {
    return new Date(value);
  } else if (typeof value === 'string') {
    return new Date(value);
  }
  return value; // 이미 Date 객체인 경우
};

// 로그 찾기 유틸리티 함수
export const findNearestLog = (logs, logType, clickedX, maxTimeDiff = 3600000) => {
  const clickedDate = getDateFromValue(clickedX);
  let bestMatch = null;
  let minTimeDiff = Infinity;

  for (const log of logs) {
    if ((logType === '실행 성공' && log.exit_code === 0) || 
        (logType === '실행 실패' && log.exit_code !== 0) ||
        (logType === '빌드 성공' && log.exit_code === 0) ||
        (logType === '빌드 실패' && log.exit_code !== 0)) {
      const logDate = getDateFromValue(log.timestamp);
      const timeDiff = Math.abs(logDate.getTime() - clickedDate.getTime());
      
      if (timeDiff < minTimeDiff) {
        minTimeDiff = timeDiff;
        bestMatch = log;
      }
    }
  }

  // 시간 차이가 최대 허용값보다 작은 경우에만 로그 반환
  if (bestMatch && minTimeDiff < maxTimeDiff) {
    return {
      log: bestMatch,
      timeDiff: minTimeDiff,
      isRunLog: logType.includes('실행')
    };
  }

  return null;
}; 