# JCode Frontend - 교육용 웹IDE 플랫폼

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Material-UI](https://img.shields.io/badge/Material--UI-007FFF?style=for-the-badge&logo=mui&logoColor=white)
![Plotly.js](https://img.shields.io/badge/Plotly.js-3F4F75?style=for-the-badge&logo=plotly&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)

**React 기반 교육용 웹IDE 플랫폼**

**🌐 실제 운영 사이트**: [https://jcode.jbnu.ac.kr](https://jcode.jbnu.ac.kr/about)

---

## 프로젝트 개요

React와 Material-UI를 기반으로 개발한 교육용 웹IDE 플랫폼입니다. 실시간 코드 편집, 데이터 시각화, 시스템 모니터링 기능을 제공합니다.

본 프로젝트는 **JEduTools** ([https://jedutools.jbnu.ac.kr](https://jedutools.jbnu.ac.kr/)) 교육 도구 통합 플랫폼의 일부로 개발되었으며, 전북대학교 **JCloud** ([https://jcloud.jbnu.ac.kr](https://jcloud.jbnu.ac.kr/dashboard/auth/login/?next=/dashboard/)) 교내 클라우드 인프라 위에서 실제 운영되고 있습니다.

### 주요 기능
- **웹 기반 통합 개발 환경** - 브라우저에서 코드 작성 및 실행
- **실시간 데이터 시각화** - Plotly.js를 활용한 인터랙티브 차트
- **시스템 모니터링 대시보드** - 실시간 메트릭 시각화
- **사용자 관리 시스템** - JWT 기반 인증 및 권한 관리
- **반응형 UI/UX** - Material-UI 컴포넌트 활용

---

## 서비스 화면

### WebIDE 개발 환경
<!-- WebIDE 스크린샷 이미지를 여기에 추가 -->
![WebIDE Screenshot](images/webide-screenshot.png)
*VSCode 기반 웹 통합 개발 환경*

### Watcher 모니터링 대시보드
<!-- Watcher 대시보드 스크린샷 이미지를 여기에 추가 -->
![Watcher Dashboard](images/watcher-dashboard.png)
*실시간 코딩 활동 모니터링 및 분석 대시보드*

### 데이터 시각화
<!-- Plotly.js 차트 스크린샷 이미지를 여기에 추가 -->
![Data Visualization](images/data-visualization.png)
![Data Visualization2](images/data-visualization2.png)
*Plotly.js를 활용한 인터랙티브 데이터 시각화*

---

## 운영 환경

- **Production URL**: [https://jcode.jbnu.ac.kr](https://jcode.jbnu.ac.kr/about)
- **Infrastructure**: 전북대학교 JCloud (교내 클라우드 플랫폼)
- **Parent Project**: JEduTools 교육 도구 통합 플랫폼
- **Authentication**: JEduTools 통합 로그인 시스템 연동
- **Documentation**: [JCode 사용 메뉴얼](https://jhelper.jbnu.ac.kr/JCode)

---

## 서비스 구성

JCode는 **WebIDE**와 **Watcher** 두 가지 핵심 서비스로 구성된 교육용 웹 플랫폼입니다.

### WebIDE: "언제 어디서나 똑같은 나만의 개발 환경!"
- **VSCode 기반**: 웹 브라우저에서 VSCode와 동일한 개발 환경 제공
- **쿠버네티스 기반**: 컨테이너 오케스트레이션을 통한 안정적인 서비스
- **격리된 환경**: 사용자별 완전히 독립된 개발 환경
- **실시간 자동 저장**: 공용 PC 환경에서도 안정적 사용
- **프록시 기반 라우팅**: 리버스 프록시를 통한 Extensions 지원

### Watcher: "내 힘으로 코딩하자!"
- **코딩 과정 기록**: 소스 코드 수정 내역, 컴파일, 빌드, 실행 모든 과정 추적
- **실시간 모니터링**: EBPF 기반 빌드 및 실행 프로세스 감지
- **소스코드 변경 감지**: INOTIFY 기반 실시간 코드 수정 감지
- **통계 분석**: 시간 단위 코드 작업 통계 및 학습 패턴 분석
- **교육자 도구**: 비정상적인 코딩 활동 구분 및 학습 과정 분석

---

## 기술 스택

### Frontend
- **React 18** - 모던 UI 라이브러리
- **Material-UI 6** - UI 컴포넌트 라이브러리
- **React Router DOM 7** - 클라이언트 사이드 라우팅

### 데이터 시각화
- **Plotly.js** - 인터랙티브 데이터 시각화 및 과학적 차트
- **Framer Motion** - 애니메이션

### 백엔드 연동
- **Axios** - HTTP 클라이언트
- **JWT Decode** - 토큰 기반 인증

### DevOps
- **Docker** - 컨테이너화
- **Kubernetes** - 클러스터 배포
- **ArgoCD** - GitOps 기반 CD

---

## 프로젝트 구조

```
frontend/
├── src/
│   ├── components/     # 재사용 가능한 UI 컴포넌트
│   ├── pages/          # 페이지 컴포넌트
│   │   ├── webide/     # 웹IDE 관련 페이지
│   │   ├── watcher/    # 모니터링 대시보드
│   │   ├── admin/      # 관리자 페이지
│   │   └── auth/       # 인증 페이지
│   ├── contexts/       # React Context
│   ├── hooks/          # 커스텀 hooks
│   ├── api/            # API 통신 로직
│   └── utils/          # 유틸리티 함수
├── k8s/               # Kubernetes 매니페스트
└── Dockerfile         # 컨테이너 이미지 빌드
```

---

## 주요 구현 사항

### 1. 데이터 시각화
- **Plotly.js 활용**: 복잡한 데이터를 인터랙티브한 차트로 표현
- **실시간 메트릭 시각화**: 동적 차트를 통한 시스템 상태 모니터링
- **반응형 차트**: 다양한 화면 크기에 대응하는 차트 구현

### 2. 웹IDE 기능
- 실시간 코드 편집기 구현
- 다중 언어 지원
- 코드 실행 결과 표시

### 3. 시스템 모니터링
- 실시간 메트릭 수집 및 표시
- 시스템 상태 대시보드
- 알림 및 경고 시스템

### 4. 사용자 관리
- JWT 기반 인증 시스템
- 역할 기반 접근 제어
- 사용자 활동 추적

---

## 설치 및 실행

### 개발 환경
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm start
```

### Docker 배포
```bash
# 이미지 빌드
docker build -t jcode-frontend .

# 컨테이너 실행
docker run -p 80:80 jcode-frontend
```

### Kubernetes 배포
```bash
# ArgoCD 애플리케이션 배포
kubectl apply -f k8s/argocd-application.yaml
```

---

## 기술적 성과

- **React Hooks 및 Context API** 활용한 효율적인 상태 관리
- **Plotly.js**를 통한 고급 데이터 시각화 구현
- **Material-UI**를 활용한 일관성 있는 디자인 시스템 구축
- **Docker 및 Kubernetes**를 통한 클라우드 네이티브 배포
- **GitOps** 방식의 자동화된 배포 파이프라인 구축

---

## 라이센스

MIT License
