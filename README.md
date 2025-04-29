# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start` 

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser. 

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

## ArgoCD를 통한 쿠버네티스 배포

GitHub Actions 워크플로우를 통해 빌드되고 Harbor 레지스트리에 푸시된 Docker 이미지를 ArgoCD를 사용해 쿠버네티스 클러스터에 배포하는 방법입니다.

### 사전 요구사항
- 쿠버네티스 클러스터 접근 권한
- ArgoCD 설치 및 구성
- 클러스터에 Secret 생성 (Harbor 레지스트리 인증용)

### 배포 단계

1. 쿠버네티스 Secret 생성 (Harbor 레지스트리 인증)
```bash
kubectl create secret docker-registry harbor-registry-secret \
  --namespace=watcher \
  --docker-server=harbor.jbnu.ac.kr \
  --docker-username=<HARBOR_USERNAME> \
  --docker-password=<HARBOR_PASSWORD>
```

2. 매니페스트 파일 확인
   - Deployment (`k8s/jcode-front.yaml`): Harbor 레지스트리 이미지 참조
   - Service (`k8s/jcode-front.yaml`): 애플리케이션 서비스 정의
   - ConfigMap (`k8s/configmap.yaml`): 환경 변수 정의
   - Ingress (`k8s/ingress.yaml`): 외부 접근 설정
   - ArgoCD Application (`k8s/argocd-application.yaml`): ArgoCD 배포 정의

3. ArgoCD 애플리케이션 배포
```bash
kubectl apply -f k8s/argocd-application.yaml
```

4. ArgoCD UI에서 배포 상태 확인
   - ArgoCD UI 접속
   - 애플리케이션 배포 상태 확인 및 필요 시 수동 동기화

### 자동 동기화

`argocd-application.yaml` 파일의 `syncPolicy.automated` 설정을 통해 GitHub 저장소의 매니페스트 파일이 변경될 때마다 ArgoCD가 자동으로 애플리케이션을 동기화합니다.

### 배포 업데이트

하버 이미지 태그 업데이트를 통한 배포:
1. GitHub Actions 워크플로우가 새 이미지를 빌드하고 Harbor에 푸시
2. 매니페스트 파일의 이미지 태그 업데이트 (수동 또는 자동화)
3. ArgoCD가 변경 사항을 감지하고 배포 동기화
