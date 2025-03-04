// 코드 모니터링을 위한 목업 데이터
const generateMockData = (startDate, endDate, interval = 'minute') => {
  const data = [];
  let currentDate = new Date(startDate);
  let totalBytes = 1000; // 초기 코드 크기

  while (currentDate <= endDate) {
    // 랜덤한 변화량 생성 (-100 ~ 100 바이트)
    const change = Math.floor(Math.random() * 200) - 100;
    totalBytes += change;

    // 음수가 되지 않도록 보정
    if (totalBytes < 0) totalBytes = 0;

    data.push({
      timestamp: currentDate.toISOString(),
      totalBytes: totalBytes,
      change: change
    });

    // 시간 간격 조정
    switch (interval) {
      case 'minute':
        currentDate = new Date(currentDate.getTime() + 60000);
        break;
      case 'hour':
        currentDate = new Date(currentDate.getTime() + 3600000);
        break;
      case 'day':
        currentDate = new Date(currentDate.getTime() + 86400000);
        break;
      default:
        currentDate = new Date(currentDate.getTime() + 60000);
    }
  }

  return data;
};

export const getMonitoringData = (startDate, endDate, timeUnit, minuteValue = '5') => {
  const data = [];
  const interval = getInterval(timeUnit, minuteValue);
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    // 기본 변화량 (-100 ~ 100 바이트)
    const baseChange = Math.floor(Math.random() * 201) - 100;
    
    // 시간대별 가중치 적용
    let weightedChange = baseChange;
    const hour = currentDate.getHours();
    
    // 활동이 많은 시간대(9-18시)에는 변화량 증가
    if (hour >= 9 && hour <= 18) {
      weightedChange *= 1.5;
    }
    
    // 이전 데이터 포인트의 총 바이트
    const prevTotal = data.length > 0 ? data[data.length - 1].totalBytes : 1000;
    
    data.push({
      timestamp: currentDate.getTime(),
      totalBytes: Math.max(0, prevTotal + weightedChange),
      change: weightedChange
    });

    currentDate = new Date(currentDate.getTime() + interval);
  }

  return data;
};

const getInterval = (timeUnit, minuteValue) => {
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  switch (timeUnit) {
    case 'minute':
      return parseInt(minuteValue) * minute;
    case 'hour':
      return hour;
    case 'day':
      return day;
    case 'week':
      return 7 * day;
    case 'month':
      return 30 * day;
    default:
      return 5 * minute;
  }
};

export const timeUnits = [
  { value: 'minute', label: '분' },
  { value: 'hour', label: '시간' },
  { value: 'day', label: '일' },
  { value: 'week', label: '주' },
  { value: 'month', label: '월' }
];

// 최근 24시간의 데이터 생성
const getLast24HoursData = () => {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - (24 * 60 * 60 * 1000));
  return generateMockData(startDate, endDate, 'hour');
};

// 최근 7일의 데이터 생성
const getLast7DaysData = () => {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - (7 * 24 * 60 * 60 * 1000));
  return generateMockData(startDate, endDate, 'day');
};

// 최근 30일의 데이터 생성
const getLast30DaysData = () => {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - (30 * 24 * 60 * 60 * 1000));
  return generateMockData(startDate, endDate, 'day');
};

export const mockMonitoringData = {
  getLast24HoursData,
  getLast7DaysData,
  getLast30DaysData,
  generateMockData
}; 