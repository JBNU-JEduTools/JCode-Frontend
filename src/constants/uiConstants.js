// 폰트 패밀리 상수
export const FONT_FAMILY = "'JetBrains Mono', 'Noto Sans KR', sans-serif";
export const MONO_FONT_FAMILY = "'JetBrains Mono', monospace";

// 공통 스타일 객체
export const COMMON_STYLES = {
  fontFamily: FONT_FAMILY,
  monoFontFamily: MONO_FONT_FAMILY,
  
  // 중앙 정렬
  centerBox: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  
  // 텍스트 스타일
  text: {
    fontFamily: FONT_FAMILY
  },
  
  monoText: {
    fontFamily: MONO_FONT_FAMILY
  },
  
  // 테이블 셀 기본 스타일
  tableCell: {
    fontFamily: FONT_FAMILY
  },
  
  tableCellBold: {
    fontFamily: FONT_FAMILY,
    fontWeight: 'bold'
  }
};

// 리퀴드 글래스 공통 스타일 (강조형)
export const GLASS_CARD_SX = (theme) => ({
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(40,42,54,0.60), rgba(40,42,54,0.35))'
    : 'linear-gradient(135deg, rgba(255,255,255,0.78), rgba(255,255,255,0.50))',
  backdropFilter: 'blur(22px) saturate(180%) contrast(108%) brightness(105%)',
  WebkitBackdropFilter: 'blur(22px) saturate(180%) contrast(108%) brightness(105%)',
  border: theme.palette.mode === 'dark'
    ? '1px solid rgba(255,255,255,0.14)'
    : '1px solid rgba(255,255,255,0.65)',
  boxShadow: theme.palette.mode === 'dark'
    ? 'inset 0 1px 0 rgba(255,255,255,0.08), 0 18px 48px rgba(0,0,0,0.55)'
    : 'inset 0 1px 0 rgba(255,255,255,0.85), 0 18px 44px rgba(31,38,135,0.22)',
  borderRadius: 16,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: 'inherit',
    pointerEvents: 'none',
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(180deg, rgba(255,255,255,0.20), rgba(255,255,255,0.06))'
      : 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0.40))',
    mixBlendMode: 'overlay',
    opacity: 0.55
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"80\\" height=\\"80\\"><filter id=\\"n\\"><feTurbulence baseFrequency=\\"0.9\\" numOctaves=\\"2\\"/></filter><rect width=\\"100%\\" height=\\"100%\\" filter=\\"url(%23n)\\" opacity=\\"0.015\\"/></svg>")',
    backgroundSize: '80px 80px',
    pointerEvents: 'none'
  }
});

// sx prop용 헬퍼 함수들
export const createSxWithFont = (additionalStyles = {}) => ({
  fontFamily: FONT_FAMILY,
  ...additionalStyles
});

export const createMonoSxWithFont = (additionalStyles = {}) => ({
  fontFamily: MONO_FONT_FAMILY,
  ...additionalStyles
}); 