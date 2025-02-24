export const avatarStyles = ['identicon'];

// 이메일을 기반으로 일관된 스타일 선택
export const getAvatarStyle = () => 'identicon';

// 랜덤 스타일 선택
export const getRandomStyle = () => 'identicon';

// 캐시를 위한 맵 객체
const avatarCache = new Map();

export const getAvatarUrl = (email) => {
  if (!email) return '';
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(email)}&scale=100&radius=0`; 
}; 