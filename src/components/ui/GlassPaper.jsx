import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';

const GlassPaper = styled(Paper)(({ theme }) => ({
  borderRadius: '16px',
  padding: theme.spacing(3),

  // 1) 유리 같은 반투명 그라데이션 배경
  background:
    theme.palette.mode === 'light'
      ? 'linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0.25))'
      : 'linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))',

  // 2) frosted glass 효과
  backdropFilter: 'saturate(180%) blur(20px)',
  WebkitBackdropFilter: 'saturate(180%) blur(20px)',

  // 3) 유리 느낌 보더
  border: `1px solid ${
    theme.palette.mode === 'light'
      ? theme.palette.divider
      : 'rgba(255,255,255,0.25)'
  }`,

  // 4) 하이라이트 + 그림자
  boxShadow: `
    inset 0 1px 0 ${
      theme.palette.mode === 'light'
        ? 'rgba(255,255,255,0.4)'
        : 'rgba(255,255,255,0.12)'
    },
    0 8px 24px rgba(0,0,0,0.18)
  `,

  color: theme.palette.text.primary,
}));

export default GlassPaper;


