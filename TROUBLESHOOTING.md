# 트러블슈팅 가이드 (Troubleshooting Guide)

JCode Frontend 사용 중 발생할 수 있는 일반적인 문제들과 해결 방법을 정리했습니다.

## 📋 목차

- [설치 및 실행 문제](#설치-및-실행-문제)
- [빌드 관련 문제](#빌드-관련-문제)
- [API 연결 문제](#api-연결-문제)
- [인증 관련 문제](#인증-관련-문제)
- [UI/UX 관련 문제](#uiux-관련-문제)
- [성능 문제](#성능-문제)
- [브라우저 호환성](#브라우저-호환성)
- [개발 환경 문제](#개발-환경-문제)

---

## 🚀 설치 및 실행 문제

### ❌ npm install 실패

**증상**: 의존성 설치 중 에러 발생

```bash
npm ERR! peer dep missing: react@^18.0.0
```

**해결 방법**:
```bash
# 1. 노드 버전 확인 (18.0 이상 필요)
node --version

# 2. npm 캐시 정리
npm cache clean --force

# 3. node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install

# 4. 권한 문제 시 (Linux/Mac)
sudo npm install
```

### ❌ 포트 3000이 이미 사용 중

**증상**: 
```bash
Error: listen EADDRINUSE: address already in use :::3000
```

**해결 방법**:
```bash
# 1. 다른 포트 사용
PORT=3001 npm start

# 2. 포트 3000 사용 중인 프로세스 종료 (Mac/Linux)
lsof -ti:3000 | xargs kill -9

# 3. 포트 3000 사용 중인 프로세스 종료 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID번호> /F
```

### ❌ 환경 변수가 인식되지 않음

**증상**: process.env.REACT_APP_API_URL이 undefined

**해결 방법**:
1. 환경 변수명이 `REACT_APP_`로 시작하는지 확인
2. `.env` 파일이 올바른 위치에 있는지 확인 (package.json과 같은 디렉토리)
3. `.env` 파일 형식 확인:
   ```bash
   # ✅ 올바른 형식
   REACT_APP_API_URL=http://localhost:8080
   
   # ❌ 잘못된 형식
   REACT_APP_API_URL = http://localhost:8080  # 공백 없어야 함
   export REACT_APP_API_URL=http://localhost:8080  # export 불필요
   ```

---

## 🔨 빌드 관련 문제

### ❌ 빌드 실패 - 메모리 부족

**증상**: 
```bash
FATAL ERROR: Ineffective mark-compacts near heap limit
```

**해결 방법**:
```bash
# 1. Node.js 메모리 증가
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# 2. package.json 스크립트 수정
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' react-scripts build"
  }
}
```

### ❌ CSS 관련 빌드 에러

**증상**: 
```bash
Failed to compile: Cannot resolve './styles.css'
```

**해결 방법**:
1. CSS 파일 경로 확인
2. CSS 모듈 import 방식 확인:
   ```javascript
   // ✅ 올바른 방식
   import './Component.css';
   import styles from './Component.module.css';
   
   // ❌ 잘못된 방식
   import './Component.scss'; // scss 파일인데 .css로 import
   ```

### ❌ TypeScript 타입 에러 (TypeScript 사용 시)

**증상**: 
```bash
Type 'string | undefined' is not assignable to type 'string'
```

**해결 방법**:
```typescript
// 환경 변수 타입 체크 추가
const apiUrl = process.env.REACT_APP_API_URL;
if (!apiUrl) {
  throw new Error('REACT_APP_API_URL is not defined');
}
```

---

## 🌐 API 연결 문제

### ❌ CORS 에러

**증상**: 
```bash
Access to fetch at 'http://localhost:8080/api' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**해결 방법**:

1. **백엔드 설정 (추천)**:
   ```javascript
   // Express.js 예시
   app.use(cors({
     origin: ['http://localhost:3000', 'https://yourdomain.com'],
     credentials: true
   }));
   ```

2. **개발 시 프록시 설정**:
   ```json
   // package.json에 추가
   {
     "proxy": "http://localhost:8080"
   }
   ```

3. **setupProxy.js 사용**:
   ```javascript
   // src/setupProxy.js
   const { createProxyMiddleware } = require('http-proxy-middleware');
   
   module.exports = function(app) {
     app.use(
       '/api',
       createProxyMiddleware({
         target: 'http://localhost:8080',
         changeOrigin: true,
       })
     );
   };
   ```

### ❌ API 응답 시간 초과

**증상**: 
```bash
Request timeout of 5000ms exceeded
```

**해결 방법**:
```javascript
// axios timeout 설정 증가
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 30000, // 30초로 증가
});
```

### ❌ 네트워크 에러

**증상**: 
```bash
Network Error
```

**해결 방법**:
1. 백엔드 서버가 실행 중인지 확인
2. API URL이 올바른지 확인
3. 방화벽 설정 확인
4. 브라우저 네트워크 탭에서 실제 요청 URL 확인

---

## 🔐 인증 관련 문제

### ❌ JWT 토큰 만료

**증상**: 401 Unauthorized 에러 지속 발생

**해결 방법**:
```javascript
// 토큰 만료 시 자동 리프레시 로직 확인
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // 토큰 갱신 로직
      const newToken = await refreshToken();
      // 재요청
    }
    return Promise.reject(error);
  }
);
```

### ❌ OAuth 리다이렉트 실패

**증상**: 로그인 후 빈 페이지 또는 에러 페이지

**해결 방법**:
1. Keycloak 설정에서 리다이렉트 URI 확인
2. 환경 변수 `REACT_APP_REDIRECT_URI` 확인
3. 브라우저 개발자 도구에서 네트워크 요청 확인

### ❌ 세션 스토리지 문제

**증상**: 새로고침 시 로그인 상태 초기화

**해결 방법**:
```javascript
// 로그인 상태 복원 로직 확인
useEffect(() => {
  const token = sessionStorage.getItem('jwt');
  if (token) {
    // 토큰 유효성 검증 및 사용자 정보 복원
    validateAndSetUser(token);
  }
}, []);
```

---

## 🎨 UI/UX 관련 문제

### ❌ Material-UI 테마 적용 안 됨

**증상**: 커스텀 테마가 적용되지 않음

**해결 방법**:
```javascript
// ThemeProvider가 올바르게 설정되었는지 확인
import { ThemeProvider } from '@mui/material/styles';

function App() {
  return (
    <ThemeProvider theme={customTheme}>
      <YourApp />
    </ThemeProvider>
  );
}
```

### ❌ 반응형 디자인 문제

**증상**: 모바일에서 레이아웃 깨짐

**해결 방법**:
1. Material-UI 브레이크포인트 확인:
   ```javascript
   const theme = useTheme();
   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
   ```

2. CSS 미디어 쿼리 확인
3. viewport meta 태그 확인:
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   ```

### ❌ 차트 렌더링 문제

**증상**: Plotly.js 차트가 표시되지 않음

**해결 방법**:
```javascript
// 차트 컨테이너 크기 확인
useLayoutEffect(() => {
  if (plotlyRef.current) {
    Plotly.Plots.resize(plotlyRef.current);
  }
}, [data]);
```

---

## ⚡ 성능 문제

### ❌ 느린 페이지 로딩

**해결 방법**:
1. **코드 스플리팅 적용**:
   ```javascript
   const LazyComponent = React.lazy(() => import('./Component'));
   
   function App() {
     return (
       <Suspense fallback={<div>Loading...</div>}>
         <LazyComponent />
       </Suspense>
     );
   }
   ```

2. **이미지 최적화**:
   ```javascript
   // 이미지 lazy loading
   <img loading="lazy" src="image.jpg" alt="description" />
   ```

3. **메모이제이션 활용**:
   ```javascript
   const MemoizedComponent = React.memo(Component);
   const memoizedValue = useMemo(() => expensiveCalculation(data), [data]);
   ```

### ❌ 번들 크기 너무 큼

**해결 방법**:
```bash
# 번들 분석
npm install --save-dev webpack-bundle-analyzer
npm run build
npx webpack-bundle-analyzer build/static/js/*.js
```

---

## 🌐 브라우저 호환성

### ❌ Internet Explorer 지원

**증상**: IE에서 앱이 동작하지 않음

**해결 방법**:
```javascript
// polyfill 추가
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
```

### ❌ Safari 관련 문제

**해결 방법**:
1. CSS vendor prefix 확인
2. JavaScript 최신 기능 polyfill 추가
3. Safari 개발자 도구로 디버깅

---

## 🛠 개발 환경 문제

### ❌ Hot Reload 동작하지 않음

**해결 방법**:
```bash
# 1. 개발 서버 재시작
npm start

# 2. 브라우저 캐시 삭제
# Chrome: Ctrl+Shift+R (Windows), Cmd+Shift+R (Mac)

# 3. WSL 사용 시 (Windows)
echo 'export WATCHPACK_POLLING=true' >> ~/.bashrc
source ~/.bashrc
```

### ❌ 환경별 설정 분리

**해결 방법**:
```bash
# 환경별 .env 파일 생성
.env.development
.env.staging  
.env.production

# 스크립트로 환경 설정
"scripts": {
  "start:staging": "REACT_APP_ENV=staging npm start"
}
```

---

## 🆘 추가 도움

### 디버깅 도구

1. **React Developer Tools**: 컴포넌트 상태 확인
2. **Redux DevTools**: 상태 관리 디버깅
3. **Chrome DevTools**: 네트워크, 성능 분석

### 로그 확인

```javascript
// 개발 환경에서만 로그 출력
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}
```

### 문제 해결이 안 될 때

1. **GitHub Issues**: [새 이슈 생성](https://github.com/your-repo/jcode-frontend/issues/new)
2. **Discussions**: [질문하기](https://github.com/your-repo/jcode-frontend/discussions)
3. **이메일**: [support@jcode-project.org](mailto:support@jcode-project.org)

### 이슈 신고 시 포함할 정보

```
OS: Windows 10 / macOS Big Sur / Ubuntu 20.04
Node.js: v18.16.0
npm: v9.5.1
Browser: Chrome 91.0 / Firefox 89.0 / Safari 14.1
JCode Frontend: v1.2.0

에러 메시지:
[에러 메시지 전체 복사]

재현 방법:
1. ...
2. ...
3. ...

기대했던 동작:
...

실제 동작:
...
```

---

이 가이드로 해결되지 않는 문제가 있다면 언제든 문의해주세요! 🤝