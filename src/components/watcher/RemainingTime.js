import React, { useState, useEffect } from 'react';
import { Typography } from '@mui/material';
import { useTheme } from '../../contexts/ThemeContext';

const RemainingTime = ({ deadline }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const deadlineDate = new Date(deadline);
      const difference = deadlineDate - now;

      // 마감 여부 상태 업데이트
      setIsExpired(difference <= 0);

      if (difference <= 0) {
        setTimeLeft('마감됨');
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      let timeString = '';
      if (days > 0) timeString += `${days}일 `;
      if (hours > 0 || days > 0) timeString += `${hours}시간 `;
      if (minutes > 0 || hours > 0 || days > 0) timeString += `${minutes}분 `;
      timeString += `${seconds}초`;

      setTimeLeft(timeString);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [deadline]); // deadline이 변경될 때마다 useEffect 재실행

  return (
    <Typography
      sx={{ 
        fontFamily: "'JetBrains Mono', 'Noto Sans KR', sans-serif",
        color: (theme) => isExpired ? theme.palette.error.main : theme.palette.success.main,
        fontWeight: 'medium'
      }}
    >
      {timeLeft}
    </Typography>
  );
};

export default RemainingTime; 