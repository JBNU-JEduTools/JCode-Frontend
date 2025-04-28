pipeline {
    agent any
    
    environment {
        // Docker 레지스트리는 Jenkins 설정에서 가져옴
        DOCKER_REGISTRY = "${env.DOCKER_REGISTRY_URL}"  // Jenkins에 설정된 URL
        // 아래 두 값은 하드코딩
        PROJECT_NAME = 'jsh2256'                       // 프로젝트 이름
        IMAGE_NAME = 'jcode-frontend'                  // 이미지 이름
        
        // 간단한 태그 사용
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        DEV_TAG = "dev-${env.BUILD_NUMBER}"
        
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
        
        stage('Docker Version Check') {
            steps {
                sh "docker --version"
            }
        }
        
        stage('Build Docker Image') {
            steps {
                dir('frontend') {
                    sh "docker build -t ${DOCKER_REGISTRY}/${PROJECT_NAME}/${IMAGE_NAME}:${IMAGE_TAG} ."
                }
            }
        }
        
        stage('Verify Image') {
            steps {
                sh "docker images ${DOCKER_REGISTRY}/${PROJECT_NAME}/${IMAGE_NAME}:${IMAGE_TAG}"
                echo "빌드된 이미지: ${DOCKER_REGISTRY}/${PROJECT_NAME}/${IMAGE_NAME}:${IMAGE_TAG}"
            }
        }
        
        stage('Tag Images') {
            steps {
                // 개발 환경용 태그 생성
                sh "docker tag ${DOCKER_REGISTRY}/${PROJECT_NAME}/${IMAGE_NAME}:${IMAGE_TAG} ${DOCKER_REGISTRY}/${PROJECT_NAME}/${IMAGE_NAME}:${DEV_TAG}"
                sh "docker tag ${DOCKER_REGISTRY}/${PROJECT_NAME}/${IMAGE_NAME}:${IMAGE_TAG} ${DOCKER_REGISTRY}/${PROJECT_NAME}/${IMAGE_NAME}:latest"
            }
        }
        
        stage('Push to Harbor Registry') {
            steps {
                // Harbor 레지스트리에 로그인
                sh "echo ${HARBOR_CREDENTIALS_PSW} | docker login ${DOCKER_REGISTRY} -u ${HARBOR_CREDENTIALS_USR} --password-stdin"
                
                // 기본 이미지 푸시 (항상)
                sh "docker push ${DOCKER_REGISTRY}/${PROJECT_NAME}/${IMAGE_NAME}:${IMAGE_TAG}"
                sh "docker push ${DOCKER_REGISTRY}/${PROJECT_NAME}/${IMAGE_NAME}:${DEV_TAG}"
                sh "docker push ${DOCKER_REGISTRY}/${PROJECT_NAME}/${IMAGE_NAME}:latest"
                
                // 이미지 정보 기록
                echo "이미지 빌드 및 푸시 완료: ${DOCKER_REGISTRY}/${PROJECT_NAME}/${IMAGE_NAME}:${IMAGE_TAG}"
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
            sh "docker rmi ${DOCKER_REGISTRY}/${PROJECT_NAME}/${IMAGE_NAME}:latest || true"
        }
    }
} 