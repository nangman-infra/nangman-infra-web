pipeline {
    agent any
    
    environment {
        // Harbor 레지스트리 설정
        HARBOR_REGISTRY = 'harbor.nangman.cloud'
        HARBOR_PROJECT = 'library'
        FRONTEND_IMAGE = "${HARBOR_REGISTRY}/${HARBOR_PROJECT}/nangman-infra-frontend:latest"
        BACKEND_IMAGE = "${HARBOR_REGISTRY}/${HARBOR_PROJECT}/nangman-infra-backend:latest"
        
        // Watchtower 설정
        WATCHTOWER_URL = 'http://172.16.0.25:8080'
        WATCHTOWER_TOKEN = credentials('2eb5ae85-6341-4cae-834e-20a5382e1f34')
        
        // Docker Buildx 설정
        DOCKER_BUILDKIT = '1'
        DOCKER_CLI_EXPERIMENTAL = 'enabled'
        
        // 멀티 아키텍처 플랫폼
        PLATFORMS = 'linux/amd64,linux/arm64'
    }
    
    options {
        // 빌드 이력 보관
        buildDiscarder(logRotator(numToKeepStr: '10'))
        
        // 타임아웃 설정 (30분)
        timeout(time: 30, unit: 'MINUTES')
        
        // 타임스탬프 추가
        timestamps()
        
        // ANSI 컬러 출력
        ansiColor('xterm')
    }
    
    stages {
        stage('Checkout') {
            steps {
                script {
                    echo "📦 Checking out code from ${env.GIT_BRANCH}"
                    checkout scm
                }
            }
        }
        
        stage('Setup Buildx') {
            steps {
                script {
                    echo "🔧 Setting up Docker Buildx for multi-platform builds"
                    sh '''
                        docker buildx version
                        docker buildx inspect --bootstrap || docker buildx create --use --name multiarch-builder
                        docker buildx use multiarch-builder
                    '''
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                script {
                    echo "🏗️ Building Frontend image (multi-architecture)"
                    withCredentials([usernamePassword(
                        credentialsId: 'ba149ba1-93b4-422d-8d89-45fb7787bb7f',
                        usernameVariable: 'HARBOR_USERNAME',
                        passwordVariable: 'HARBOR_PASSWORD'
                    )]) {
                        sh '''
                            echo "${HARBOR_PASSWORD}" | docker login ${HARBOR_REGISTRY} -u "${HARBOR_USERNAME}" --password-stdin
                            
                            docker buildx build \
                                --platform ${PLATFORMS} \
                                --tag ${FRONTEND_IMAGE} \
                                --push \
                                --progress=plain \
                                ./frontend
                        '''
                    }
                }
            }
        }
        
        stage('Build Backend') {
            steps {
                script {
                    echo "🏗️ Building Backend image (multi-architecture)"
                    withCredentials([usernamePassword(
                        credentialsId: 'ba149ba1-93b4-422d-8d89-45fb7787bb7f',
                        usernameVariable: 'HARBOR_USERNAME',
                        passwordVariable: 'HARBOR_PASSWORD'
                    )]) {
                        sh '''
                            echo "${HARBOR_PASSWORD}" | docker login ${HARBOR_REGISTRY} -u "${HARBOR_USERNAME}" --password-stdin
                            
                            docker buildx build \
                                --platform ${PLATFORMS} \
                                --tag ${BACKEND_IMAGE} \
                                --push \
                                --progress=plain \
                                ./backend
                        '''
                    }
                }
            }
        }
        
        stage('Verify Images') {
            steps {
                script {
                    echo "✅ Verifying multi-architecture manifests"
                    withCredentials([usernamePassword(
                        credentialsId: 'ba149ba1-93b4-422d-8d89-45fb7787bb7f',
                        usernameVariable: 'HARBOR_USERNAME',
                        passwordVariable: 'HARBOR_PASSWORD'
                    )]) {
                        sh '''
                            echo "${HARBOR_PASSWORD}" | docker login ${HARBOR_REGISTRY} -u "${HARBOR_USERNAME}" --password-stdin
                            
                            echo "Frontend manifest:"
                            docker manifest inspect ${FRONTEND_IMAGE} | grep -A 3 '"platform"'
                            
                            echo "Backend manifest:"
                            docker manifest inspect ${BACKEND_IMAGE} | grep -A 3 '"platform"'
                        '''
                    }
                }
            }
        }
        
        stage('Trigger Watchtower') {
            steps {
                script {
                    echo "🚀 Triggering Watchtower to update containers"
                    sh '''
                        response=$(curl -s -w "\\n%{http_code}" \
                            -H "Authorization: Bearer ${WATCHTOWER_TOKEN}" \
                            ${WATCHTOWER_URL}/v1/update)
                        
                        http_code=$(echo "$response" | tail -n1)
                        body=$(echo "$response" | sed '$d')
                        
                        if [ "$http_code" -eq 200 ]; then
                            echo "✅ Watchtower update triggered successfully"
                            echo "Response: $body"
                        else
                            echo "❌ Failed to trigger Watchtower update"
                            echo "HTTP Code: $http_code"
                            echo "Response: $body"
                            exit 1
                        fi
                    '''
                }
            }
        }
    }
    
    post {
        success {
            script {
                echo "✅ Pipeline completed successfully"
                // Slack 알림 등 추가 가능
            }
        }
        
        failure {
            script {
                echo "❌ Pipeline failed"
                // 에러 알림 등 추가 가능
            }
        }
        
        always {
            script {
                echo "🧹 Cleaning up Docker resources"
                sh '''
                    docker buildx prune -f || true
                    docker system prune -f || true
                '''
            }
        }
    }
}

