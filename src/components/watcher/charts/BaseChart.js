import React, { useEffect, useState, useRef } from 'react';
import Plotly from 'plotly.js-dist';
import { useTheme } from '../../../contexts/ThemeContext';
import { getChartStyles, getTimeFormatStops, createEmptyChart, getImageSaveOptions, getHoverTemplate } from './ChartUtils';

const BaseChart = ({
  chartId,
  title,
  traces,
  dataLoading,
  dataError,
  xAxis,
  yAxis,
  student,
  assignment,
  chartType,
  children,
  height = '400px'
}) => {
  const { isDarkMode } = useTheme();
  const chartRef = useRef(null);
  const [error, setError] = useState(null);
  
  // 차트 생성 및 업데이트
  useEffect(() => {
    // 차트 엘리먼트 확인
    const chartElement = document.getElementById(chartId);
    if (!chartElement) return;
    
    // 데이터 로딩 중이면 스킵
    if (dataLoading) return;
    
    // 에러 발생 시 빈 차트 표시
    if (dataError) {
      setError(dataError);
      createEmptyChart(chartId, isDarkMode, `${title} - 오류 발생`);
      return;
    }
    
    // 트레이스가 없거나 유효하지 않은 경우 빈 차트 표시
    if (!traces || !Array.isArray(traces) || traces.length === 0) {
      setError('유효한 데이터가 없습니다');
      createEmptyChart(chartId, isDarkMode, `${title} - 데이터 없음`);
      return;
    }
    
    try {
      // 스타일 가져오기
      const styles = getChartStyles(isDarkMode);
      
      // 트레이스 업데이트 - 툴팁 형식 적용
      const updatedTraces = traces.map(trace => {
        // 원본 트레이스를 복사
        const updatedTrace = { ...trace };
        
        // 트레이스 유형에 따라 적절한 툴팁 템플릿 적용
        if (trace.name && trace.name.includes('추가')) {
          updatedTrace.hovertemplate = getHoverTemplate('addition', true);
        } else if (trace.name && trace.name.includes('삭제')) {
          updatedTrace.hovertemplate = getHoverTemplate('deletion', true);
        } else if (trace.name && trace.name.includes('크기')) {
          updatedTrace.hovertemplate = getHoverTemplate('totalSize', true);
        } else {
          updatedTrace.hovertemplate = getHoverTemplate('default', true);
        }
        
        return updatedTrace;
      });
      
      // 공통 레이아웃 설정
      const layout = {
        title: title,
        font: styles.font,
        paper_bgcolor: styles.paper_bgcolor,
        plot_bgcolor: styles.plot_bgcolor,
        margin: { t: 40, r: 10, b: 60, l: 60 },
        hovermode: 'x unified',
        showlegend: true,
        legend: styles.legend,
        xaxis: {
          title: xAxis?.title || '시간',
          gridcolor: styles.gridcolor,
          zerolinecolor: styles.zerolinecolor,
          ...styles.axis,
          tickformat: '%Y-%m-%d %H:%M',
          tickformatstops: getTimeFormatStops()
        },
        yaxis: {
          title: yAxis?.title || '값',
          gridcolor: styles.gridcolor,
          zerolinecolor: styles.zerolinecolor,
          ...styles.axis,
          tickformat: yAxis?.tickformat || ',d'
        }
      };
      
      // 차트 설정
      const config = {
        responsive: true,
        displayModeBar: true,
        scrollZoom: true,
        modeBarButtonsToAdd: ['resetScale2d'],
        modeBarButtonsToRemove: ['select2d', 'lasso2d', 'autoScale2d'],
        displaylogo: false,
        showTips: false,
        toImageButtonOptions: getImageSaveOptions(student, assignment, chartType)
      };
      
      // 차트 그리기
      Plotly.newPlot(chartId, updatedTraces, layout, config);
      
      // 에러 초기화
      setError(null);
    } catch (err) {
      console.error('차트 생성 오류:', err);
      setError(err.message || '차트 생성 중 오류가 발생했습니다');
      createEmptyChart(chartId, isDarkMode, `${title} - 오류 발생`);
    }
    
    // 컴포넌트 언마운트 시 차트 정리
    return () => {
      const chartDiv = document.getElementById(chartId);
      if (chartDiv && chartDiv._fullLayout) {
        try {
          Plotly.purge(chartId);
        } catch (err) {
          console.error('차트 정리 중 오류 발생:', err);
        }
      }
    };
  }, [chartId, traces, dataLoading, dataError, isDarkMode, title, xAxis, yAxis, student, assignment, chartType]);
  
  return (
    <div className="chart-container" style={{ position: 'relative', width: '100%' }}>
      {dataLoading && (
        <div className="chart-loading" style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.1)',
          zIndex: 10
        }}>
          <div>데이터 로딩 중...</div>
        </div>
      )}
      
      {error && (
        <div className="chart-error" style={{ 
          position: 'absolute', 
          top: '10px', 
          right: '10px',
          padding: '5px 10px',
          backgroundColor: 'rgba(255,0,0,0.1)',
          border: '1px solid red',
          borderRadius: '3px',
          zIndex: 5
        }}>
          {error}
        </div>
      )}
      
      <div
        id={chartId}
        ref={chartRef}
        style={{ width: '100%', height: height }}
      />
      
      {children}
    </div>
  );
};

export default BaseChart; 