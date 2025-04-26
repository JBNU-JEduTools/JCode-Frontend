import React, { useEffect, useRef } from 'react';
import { Box, Paper, useTheme } from '@mui/material';
import { chartSyncEvents } from './TotalSizeChart';
import { getHoverTemplate, getTimeFormatStops } from './ChartUtils';

const ChangeChart = ({ data, student, assignment }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Plotly 차트 생성 및 업데이트
  useEffect(() => {
    const initPlotly = async () => {
      try {
        const Plotly = await import('plotly.js-dist');
        window.Plotly = Plotly;
        
        //console.log('ChangeChart 데이터:', data);
        
        // 데이터가 비어있는 경우 빈 차트 생성
        if (!data || !data.additions || data.additions.length === 0) {
          //console.warn('ChangeChart: 유효한 데이터가 없습니다');
          const emptyTrace = {
            x: [],
            y: [],
            type: 'scatter',
            mode: 'lines+markers',
            name: '데이터 없음'
          };
          
          const emptyLayout = {
            title: '데이터가 없습니다',
            font: {
              family: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
              color: isDarkMode ? '#F8F8F2' : '#282A36'
            },
            paper_bgcolor: isDarkMode ? 'rgba(40, 42, 54, 0.8)' : '#FFFFFF',
            plot_bgcolor: isDarkMode ? 'rgba(40, 42, 54, 0.4)' : '#FFFFFF',
            annotations: [{
              text: '해당 데이터가 없거나 로드하는데 실패했습니다',
              showarrow: false,
              font: {
                family: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
                size: 14
              },
              x: 0.5,
              y: 0.5,
              xref: 'paper',
              yref: 'paper'
            }]
          };
          
          // DOM 요소가 존재하는지 확인 후 차트 생성
          const changeElement = document.getElementById('changeChart');
          if (changeElement) {
            chartInstance.current = Plotly.newPlot('changeChart', [emptyTrace], emptyLayout);
          }
          return;
        }
        
        // 항상 실제 타임스탬프 데이터 사용 - 하드코딩 대신 data.timestamps 사용
        const timestamps = data.formattedTimes;
        
        // 값이 0인 데이터는 필터링하여 표시하지 않음
        const filteredAdditions = data.additions.map((val, idx) => ({
          value: val,
          timestamp: data.formattedTimes[idx]
        })).filter(item => item.value > 0);
        
        const filteredDeletions = data.deletions.map((val, idx) => ({
          value: val,
          timestamp: data.formattedTimes[idx]
        })).filter(item => item.value > 0);
        
        // 변경 차트 생성 - 실제 타임스탬프 사용
        const addTrace = {
          x: filteredAdditions.map(item => item.timestamp),
          y: filteredAdditions.map(item => item.value),
          type: 'bar',
          name: '추가된 코드',
          marker: {
            color: isDarkMode ? '#50FA7B' : '#4E5C8E',
            line: {
              width: 1,
              color: isDarkMode ? '#44475A' : '#E0E0E0'
            }
          },
          hoverinfo: 'x+y+text',
          hovertemplate: getHoverTemplate('addition', true),
          hoverlabel: {
            bgcolor: isDarkMode ? '#44475A' : '#FFFFFF',
            font: {color: isDarkMode ? '#F8F8F2' : '#282A36'}
          },
          yaxis: 'y2'
        };
        
        const delTrace = {
          x: filteredDeletions.map(item => item.timestamp),
          y: filteredDeletions.map(item => item.value).map(val => -val),
          type: 'bar',
          name: '삭제된 코드',
          marker: {
            color: isDarkMode ? '#FF5555' : '#FF79C6',
            line: {
              width: 1,
              color: isDarkMode ? '#44475A' : '#E0E0E0'
            }
          },
          hoverinfo: 'x+y+text',
          hovertemplate: getHoverTemplate('deletion', true),
          customdata: filteredDeletions.map(item => item.value),
          hoverlabel: {
            bgcolor: isDarkMode ? '#44475A' : '#FFFFFF',
            font: {color: isDarkMode ? '#F8F8F2' : '#282A36'}
          },
          yaxis: 'y2'
        };
        
        const changeLayout = {
          title: '코드 변경 추이',
          font: {
            family: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
            color: isDarkMode ? '#F8F8F2' : '#282A36'
          },
          paper_bgcolor: isDarkMode ? 'rgba(40, 42, 54, 0.8)' : '#FFFFFF',
          plot_bgcolor: isDarkMode ? 'rgba(40, 42, 54, 0.4)' : '#FFFFFF',
          xaxis: {
            title: '시간 (추정)',
            gridcolor: isDarkMode ? '#44475A' : '#E0E0E0',
            zerolinecolor: isDarkMode ? '#44475A' : '#E0E0E0',
            color: isDarkMode ? '#F8F8F2' : '#282A36',
            showspikes: true,
            spikecolor: isDarkMode ? '#BD93F9' : '#6272A4',
            spikethickness: 1,
            spikemode: 'across',
            spikesnap: 'cursor',
            spikedash: 'dash',
            tickformat: '%Y-%m-%d %H:%M',
            tickformatstops: getTimeFormatStops()
          },
          yaxis: {
            title: '',
            showgrid: false,
            zeroline: false,
            showticklabels: false,
            fixedrange: true
          },
          yaxis2: {
            title: '바이트 (추가/삭제)',
            gridcolor: isDarkMode ? '#44475A' : '#E0E0E0',
            zerolinecolor: isDarkMode ? '#FF79C6' : '#FF5555', // 0선 강조
            color: isDarkMode ? '#F8F8F2' : '#282A36',
            showspikes: true,
            spikecolor: isDarkMode ? '#BD93F9' : '#6272A4',
            spikethickness: 1,
            spikemode: 'across',
            spikesnap: 'cursor',
            spikedash: 'dash',
            tickformat: ',d', // 천 단위 구분 기호 사용, K 단위 삭제
            zeroline: true,
            zerolinewidth: 2,
            overlaying: 'y',
            side: 'right'
          },
          margin: { t: 30, r: 100, b: 60, l: 100 },
          hovermode: 'x',
          hoverdistance: 50000,
          dragmode: 'pan', // 기본 드래그 모드를 pan으로 설정 (레이아웃 레벨)
          hoverlabel: {
            bgcolor: isDarkMode ? '#44475A' : '#FFFFFF',
            bordercolor: isDarkMode ? '#6272A4' : '#E0E0E0',
            font: {
              family: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
              color: isDarkMode ? '#F8F8F2' : '#282A36',
              size: 12
            }
          },
          showlegend: true,
          legend: {
            x: 0.01,
            y: 0.99,
            bgcolor: isDarkMode ? 'rgba(68, 71, 90, 0.7)' : 'rgba(255, 255, 255, 0.7)',
            bordercolor: isDarkMode ? '#6272A4' : '#E0E0E0'
          },
          barmode: 'relative'
        };
        
        // DOM 요소가 존재하는지 확인 후 차트 생성
        const changeElement = document.getElementById('changeChart');
        if (changeElement) {
          // 파일 이름 설정
          const studentName = student ? student.name : '학생';
          const assignmentName = assignment ? assignment.assignmentName : '과제';
          const fileName = `${studentName}_${assignmentName}_변경차트_${new Date().toISOString().split('T')[0]}`;
          
          chartInstance.current = Plotly.newPlot('changeChart', [addTrace, delTrace], changeLayout, {
            responsive: true,
            displayModeBar: true,
            scrollZoom: true,
            modeBarButtonsToAdd: [
              'resetScale2d'
            ],
            modeBarButtonsToRemove: ['select2d', 'lasso2d', 'autoScale2d'],
            displaylogo: false,
            toImageButtonOptions: {
              format: 'png',
              filename: fileName,
              height: 800,
              width: 1200,
              scale: 2
            }
          });
          
          // 차트 동기화 이벤트 설정
          changeElement.on('plotly_relayout', function(eventData) {
            // 이미 동기화 중이면 무시
            if (chartSyncEvents.isSyncing) return;
            
            // 디바운스 적용
            if (chartSyncEvents.debounceTimeout) {
              clearTimeout(chartSyncEvents.debounceTimeout);
            }
            
            chartSyncEvents.debounceTimeout = setTimeout(() => {
              // x축 범위가 변경된 경우 동기화 처리
              if (eventData['xaxis.range[0]'] !== undefined && eventData['xaxis.range[1]'] !== undefined) {
                try {
                  // 동기화 상태 설정
                  chartSyncEvents.isSyncing = true;
                  
                  // xAxis 범위가 변경되면 이벤트 발생
                  chartSyncEvents.xAxisUpdate = {
                    source: 'changeChart',
                    range: [eventData['xaxis.range[0]'], eventData['xaxis.range[1]']]
                  };
                  
                  // totalSizeChart 동기화
                  const totalSizeElement = document.getElementById('totalSizeChart');
                  if (totalSizeElement && chartSyncEvents.xAxisUpdate.source !== 'totalSizeChart') {
                    Plotly.relayout('totalSizeChart', {
                      'xaxis.range[0]': eventData['xaxis.range[0]'],
                      'xaxis.range[1]': eventData['xaxis.range[1]']
                    });
                  }
                  
                  // 동기화 완료 후 상태 해제
                  setTimeout(() => {
                    chartSyncEvents.isSyncing = false;
                  }, 100);
                } catch (err) {
                  //console.error('차트 동기화 오류:', err);
                  chartSyncEvents.isSyncing = false;
                }
              }
            }, 200); // 200ms 디바운스
          });
        }
      } catch (error) {
        //console.error('변경 차트 생성 오류:', error);
      }
    };
    
    initPlotly();
    
    // 컴포넌트 언마운트시 차트 정리
    return () => {
      // window.Plotly가 있고, DOM 요소가 존재하는 경우에만 purge 실행
      if (window.Plotly) {
        // 각 차트 요소가 존재하는지 확인 후 purge
        const changeChartElement = document.getElementById('changeChart');
        if (changeChartElement) {
          window.Plotly.purge('changeChart');
        }
      }
    };
  }, [data, isDarkMode, student, assignment]);

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 1, 
        mb: 4, 
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme => theme.palette.mode === 'dark' ? '#282a36' : '#ffffff',
        border: theme => `1px solid ${theme.palette.mode === 'dark' ? '#44475a' : '#e0e0e0'}`,
        borderRadius: '8px',
        position: 'relative'
      }}
    >
      <Box sx={{ 
        height: '100%', 
        width: '100%', 
        minHeight: '500px' 
      }} id="changeChart" ref={chartRef} />
    </Paper>
  );
};

export default ChangeChart; 