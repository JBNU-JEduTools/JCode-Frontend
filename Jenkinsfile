pipeline {
    agent any
    
    environment {
        // Docker 레지스트리는 Jenkins 설정에서 가져옴
        DOCKER_REGISTRY = "${env.DOCKER_REGISTRY_URL}"  // Jenkins에 설정된 URL
        // 아래 두 값은 하드코딩
        PROJECT_NAME = 'jsh2256'                       // 프로젝트 이름
        IMAGE_NAME = 'jcode-frontend'                  // 이미지 이름
        
        // Jenkins에 정의된 전역 환경 변수 사용
        // Jenkins 시스템 설정 또는 젠킨스 파일에서 withCredentials로 설정 가능
        // 빌드 정보
        GIT_COMMIT_SHORT = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
        // 자동 버전 증가를 기본으로 설정
        AUTO_INCREMENT_VERSION = 'true'
        // Jenkins Credentials에서 안전하게 로드
        HARBOR_CREDENTIALS = credentials('harbor-credentials')
    }

    stages {
        stage('Checkout') {
            steps {
                deleteDir()
                checkout scm
            }
        }
        
        stage('Set Version') {
            steps {
                script {
                    // package.json에서 기본 버전 정보 읽기
                    def packageVersion = sh(script: "grep '\"version\"' frontend/package.json | awk -F '\"' '{print \$4}'", returnStdout: true).trim()
                    def parts = packageVersion.tokenize('.')
                    
                    // 주 버전(major)과 부 버전(minor)은 package.json에서 가져오고, 
                    // 패치 버전(patch)은 Jenkins 빌드 번호로 대체
                    def major = parts[0]
                    def minor = parts[1]
                    def patch = env.BUILD_NUMBER
                    
                    // 최종 버전 설정
                    env.BUILD_VERSION = "${major}.${minor}.${patch}"
                    echo "자동 증가된 버전: ${env.BUILD_VERSION}"
                    
                    // 태그 설정
                    env.IMAGE_TAG = "v${env.BUILD_VERSION}-${GIT_COMMIT_SHORT}"
                    env.DEV_TAG = "dev-${GIT_COMMIT_SHORT}"
                    env.PROD_TAG = env.BRANCH_NAME?.startsWith('release') || env.BRANCH_NAME?.startsWith('v') ? "v${env.BUILD_VERSION}" : ''
                }
            }
        }
        
        stage('Docker Version Check') {
            steps {
                sh "docker --version"
            }
        }
        
        stage('Build Docker Image') {
            steps {
                dir('frontend') {
                    // 버전 정보를 빌드 인자로 전달 (선택 사항)
                    sh "docker build --build-arg APP_VERSION=${env.BUILD_VERSION} -t ${DOCKER_REGISTRY}/${PROJECT_NAME}/${IMAGE_NAME}:${IMAGE_TAG} ."
                }
            }
        }
        
        stage('Verify Image') {
            steps {
                sh "docker images ${DOCKER_REGISTRY}/${PROJECT_NAME}/${IMAGE_NAME}:${IMAGE_TAG}"
                echo "빌드된 이미지 버전: ${env.BUILD_VERSION}"
            }
        }
        
        stage('Tag Images') {
            steps {
                // 개발 환경용 태그 생성
                sh "docker tag ${DOCKER_REGISTRY}/${PROJECT_NAME}/${IMAGE_NAME}:${IMAGE_TAG} ${DOCKER_REGISTRY}/${PROJECT_NAME}/${IMAGE_NAME}:${DEV_TAG}"
                
                // 프로덕션 태그 (릴리즈 브랜치나 태그에서만 생성)
                script {
                    if (env.PROD_TAG) {
                        sh "docker tag ${DOCKER_REGISTRY}/${PROJECT_NAME}/${IMAGE_NAME}:${IMAGE_TAG} ${DOCKER_REGISTRY}/${PROJECT_NAME}/${IMAGE_NAME}:${PROD_TAG}"
                        // 최신 안정 버전으로 latest 태그 설정
                        sh "docker tag ${DOCKER_REGISTRY}/${PROJECT_NAME}/${IMAGE_NAME}:${IMAGE_TAG} ${DOCKER_REGISTRY}/${PROJECT_NAME}/${IMAGE_NAME}:latest"
                    }
                }
            }
        }
        
        stage('Push to Harbor Registry') {
            steps {
                // Harbor 레지스트리에 로그인
                sh "echo ${HARBOR_CREDENTIALS_PSW} | docker login ${DOCKER_REGISTRY} -u ${HARBOR_CREDENTIALS_USR} --password-stdin"
                
                // 기본 이미지 푸시 (항상)
                sh "docker push ${DOCKER_REGISTRY}/${PROJECT_NAME}/${IMAGE_NAME}:${IMAGE_TAG}"
                sh "docker push ${DOCKER_REGISTRY}/${PROJECT_NAME}/${IMAGE_NAME}:${DEV_TAG}"
                
                // 프로덕션 태그 푸시 (릴리즈 브랜치나 태그에서만)
                script {
                    if (env.PROD_TAG) {
                        sh "docker push ${DOCKER_REGISTRY}/${PROJECT_NAME}/${IMAGE_NAME}:${PROD_TAG}"
                        sh "docker push ${DOCKER_REGISTRY}/${PROJECT_NAME}/${IMAGE_NAME}:latest"
                        echo "프로덕션 이미지가 태그되어 푸시되었습니다: ${DOCKER_REGISTRY}/${PROJECT_NAME}/${IMAGE_NAME}:${PROD_TAG}"
                    }
                }
                
                // 이미지 정보 기록
                echo "이미지 빌드 및 푸시 완료: ${DOCKER_REGISTRY}/${PROJECT_NAME}/${IMAGE_NAME}:${IMAGE_TAG}"
                echo "버전: ${env.BUILD_VERSION}, 커밋: ${GIT_COMMIT_SHORT}"
            }
        }
    }
    
    post {
        always {
            echo "CI 파이프라인 완료"
            // Harbor 레지스트리 로그아웃
            sh "docker logout ${DOCKER_REGISTRY} || true"
        }
        success {
            echo "도커 이미지 빌드 및 Harbor 푸시 성공: ${DOCKER_REGISTRY}/${PROJECT_NAME}/${IMAGE_NAME}:${IMAGE_TAG}"
        }
        failure {
            echo "파이프라인 실패"
        }
        cleanup {
            cleanWs()
            // 로컬 이미지 정리
            sh "docker rmi ${DOCKER_REGISTRY}/${PROJECT_NAME}/${IMAGE_NAME}:${IMAGE_TAG} || true"
            sh "docker rmi ${DOCKER_REGISTRY}/${PROJECT_NAME}/${IMAGE_NAME}:${DEV_TAG} || true"
            script {
                if (env.PROD_TAG) {
                    sh "docker rmi ${DOCKER_REGISTRY}/${PROJECT_NAME}/${IMAGE_NAME}:${PROD_TAG} || true"
                    sh "docker rmi ${DOCKER_REGISTRY}/${PROJECT_NAME}/${IMAGE_NAME}:latest || true"
                }
            }
        }
    }
} 