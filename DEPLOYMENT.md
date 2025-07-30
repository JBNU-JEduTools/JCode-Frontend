# 배포 가이드 (Deployment Guide)

JCode Frontend를 다양한 환경에 배포하는 방법을 설명합니다.

## 📋 목차

- [사전 준비](#사전-준비)
- [로컬 개발 환경](#로컬-개발-환경)
- [Docker 배포](#docker-배포)
- [Kubernetes 배포](#kubernetes-배포)
- [클라우드 배포](#클라우드-배포)
- [환경별 설정](#환경별-설정)
- [모니터링 및 로깅](#모니터링-및-로깅)
- [트러블슈팅](#트러블슈팅)

## 🚀 사전 준비

### 필요한 도구

- **Node.js** 18.0 이상
- **npm** 8.0 이상
- **Docker** 20.10 이상 (Docker 배포 시)
- **kubectl** (Kubernetes 배포 시)
- **Git**

### 백엔드 API 서버

JCode Frontend는 백엔드 API 서버와 연동됩니다:
- 백엔드 서버가 먼저 실행되어야 합니다
- CORS 설정이 올바르게 되어 있어야 합니다

## 💻 로컬 개발 환경

### 1. 소스코드 준비

```bash
git clone https://github.com/your-repo/jcode-frontend.git
cd jcode-frontend/frontend
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

```bash
cp .env.example .env
```

`.env` 파일 편집:
```bash
REACT_APP_API_URL=http://localhost:8080
REACT_APP_KEYCLOAK_URL=http://localhost:8080/auth
REACT_APP_CLIENT_ID=jcode-client
REACT_APP_SCOPE=openid
REACT_APP_REDIRECT_URI=http://localhost:3000/auth/callback
REACT_APP_REALM=jcode-realm
```

### 4. 개발 서버 실행

```bash
npm start
```

브라우저에서 http://localhost:3000 접속

## 🐳 Docker 배포

### 개발용 Docker

```bash
# 개발용 이미지 빌드
docker build -f Dockerfile.dev -t jcode-frontend:dev .

# 컨테이너 실행
docker run -p 3000:3000 \
  -e REACT_APP_API_URL=http://localhost:8080 \
  jcode-frontend:dev
```

### 프로덕션용 Docker

```bash
# 프로덕션 이미지 빌드
docker build -t jcode-frontend:latest .

# 컨테이너 실행
docker run -p 80:80 \
  -e REACT_APP_API_URL=https://api.yourdomain.com \
  jcode-frontend:latest
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - REACT_APP_API_URL=https://api.yourdomain.com
    restart: unless-stopped
```

```bash
docker-compose up -d
```

## ☸️ Kubernetes 배포

### 1. ConfigMap 생성

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: jcode-frontend-config
data:
  REACT_APP_API_URL: "https://api.yourdomain.com"
  REACT_APP_KEYCLOAK_URL: "https://auth.yourdomain.com"
  REACT_APP_CLIENT_ID: "jcode-client"
  REACT_APP_SCOPE: "openid"
  REACT_APP_REDIRECT_URI: "https://yourdomain.com/auth/callback"
  REACT_APP_REALM: "jcode-realm"
```

### 2. Deployment 생성

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: jcode-frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: jcode-frontend
  template:
    metadata:
      labels:
        app: jcode-frontend
    spec:
      containers:
      - name: frontend
        image: jcode-frontend:latest
        ports:
        - containerPort: 80
        envFrom:
        - configMapRef:
            name: jcode-frontend-config
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

### 3. Service 생성

```yaml
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: jcode-frontend-service
spec:
  selector:
    app: jcode-frontend
  ports:
  - port: 80
    targetPort: 80
  type: ClusterIP
```

### 4. Ingress 설정

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: jcode-frontend-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: jcode-frontend-service
            port:
              number: 80
```

### 배포 실행

```bash
kubectl apply -f k8s/
```

## ☁️ 클라우드 배포

### Vercel

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod
```

### Netlify

```bash
# 빌드
npm run build

# Netlify CLI로 배포
netlify deploy --prod --dir=build
```

### AWS S3 + CloudFront

```bash
# 빌드
npm run build

# S3 업로드
aws s3 sync build/ s3://your-bucket-name

# CloudFront 캐시 무효화
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## ⚙️ 환경별 설정

### 개발 환경

```bash
# .env.development
REACT_APP_API_URL=http://localhost:8080
REACT_APP_KEYCLOAK_URL=http://localhost:8080/auth
GENERATE_SOURCEMAP=true
```

### 스테이징 환경

```bash
# .env.staging
REACT_APP_API_URL=https://staging-api.yourdomain.com
REACT_APP_KEYCLOAK_URL=https://staging-auth.yourdomain.com
GENERATE_SOURCEMAP=false
```

### 프로덕션 환경

```bash
# .env.production
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_KEYCLOAK_URL=https://auth.yourdomain.com
GENERATE_SOURCEMAP=false
```

## 📊 모니터링 및 로깅

### 헬스체크 엔드포인트

Nginx 설정으로 헬스체크 추가:

```nginx
location /health {
    return 200 "healthy\n";
    add_header Content-Type text/plain;
}
```

### 로그 수집

```yaml
# 로그 수집을 위한 사이드카 컨테이너
- name: log-collector
  image: fluent/fluent-bit:latest
  volumeMounts:
  - name: nginx-logs
    mountPath: /var/log/nginx
```

### 메트릭 모니터링

- **Prometheus**: 메트릭 수집
- **Grafana**: 대시보드
- **AlertManager**: 알림

## 🔧 트러블슈팅

### 일반적인 문제들

#### 1. 빌드 실패

```bash
# 노드 모듈 재설치
rm -rf node_modules package-lock.json
npm install

# 캐시 정리
npm run build -- --reset-cache
```

#### 2. 환경 변수 인식 안 됨

```bash
# React 앱에서는 REACT_APP_ 접두사가 필요
REACT_APP_API_URL=http://localhost:8080  # ✅ 올바름
API_URL=http://localhost:8080            # ❌ 인식 안 됨
```

#### 3. CORS 에러

백엔드 서버에서 CORS 설정 확인:
```javascript
// Express.js 예시
app.use(cors({
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
  credentials: true
}));
```

#### 4. 라우팅 문제 (404 에러)

nginx 설정에서 SPA 라우팅 지원:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

#### 5. 메모리 부족

Docker 메모리 제한 증가:
```yaml
resources:
  limits:
    memory: "1Gi"
```

### 디버깅 도구

```bash
# React Developer Tools
# Redux DevTools (상태 관리 시)
# Chrome DevTools Network 탭

# 컨테이너 로그 확인
docker logs container-name

# Kubernetes 로그 확인
kubectl logs deployment/jcode-frontend
```

## 📞 지원

배포 관련 문제가 있으시면:
- [GitHub Issues](https://github.com/your-repo/jcode-frontend/issues)
- [Discord 커뮤니티](https://discord.gg/jcode) *(예정)*
- 이메일: [support@jcode-project.org](mailto:support@jcode-project.org)

---

성공적인 배포를 위해 이 가이드를 단계별로 따라해보세요! 🚀