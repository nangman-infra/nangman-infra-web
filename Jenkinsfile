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
        
        // Mattermost 설정
        MATTERMOST_WEBHOOK = credentials('mattermost-webhook-url')
        
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
        stage('Notify and Wait for Approval') {
            steps {
                script {
                    echo "📣 GitHub Push 감지됨. 매터모스트에 승인 요청 전송."
                    
                    def branch = env.BRANCH_NAME ?: env.GIT_BRANCH ?: 'unknown'
                    def jobName = env.JOB_NAME ?: 'nangman-infra'
                    def buildNumber = env.BUILD_NUMBER
                    def buildUrl = env.BUILD_URL
                    
                    // 매터모스트로 승인 요청 메시지 전송
                    sh """
                        curl -X POST ${MATTERMOST_WEBHOOK} \
                        -H 'Content-Type: application/json' \
                        -d '{
                            "text": "### 🚀 배포 승인 요청 (Push 감지)\\n**Repository:** ${jobName}\\n**Branch:** ${branch}\\n**Build:** #${buildNumber}\\n\\n배포를 진행하시겠습니까?\\n\\n👉 Jenkins에서 승인해주세요: ${buildUrl}"
                        }'
                    """
                    
                    echo "✅ 매터모스트 알림 전송 완료. 승인 대기 중..."
                    currentBuild.description = "배포 승인 대기 중"
                    
                    // Jenkins UI에서 승인 대기
                    def userInput
                    try {
                        timeout(time: 30, unit: 'MINUTES') {
                            userInput = input(
                                message: '배포를 진행하시겠습니까?',
                                ok: '🚀 배포 시작',
                                submitter: 'authenticated',
                                parameters: [
                                    choice(
                                        name: 'ACTION',
                                        choices: ['배포 시작', '배포 취소'],
                                        description: '배포 여부를 선택하세요'
                                    )
                                ]
                            )
                        }
                        
                        // 사용자 선택 확인
                        if (userInput == '배포 취소') {
                            sh """
                                curl -X POST ${MATTERMOST_WEBHOOK} \
                                -H 'Content-Type: application/json' \
                                -d '{
                                    "text": "❌ **배포 취소됨** - 사용자가 배포를 취소했습니다.\\n**Build:** #${buildNumber}"
                                }'
                            """
                            error("사용자가 배포를 취소했습니다.")
                        }
                        
                        // 승인됨
                        sh """
                            curl -X POST ${MATTERMOST_WEBHOOK} \
                            -H 'Content-Type: application/json' \
                            -d '{
                                "text": "✅ **배포 승인됨** - 빌드를 시작합니다...\\n**Build:** #${buildNumber}"
                            }'
                        """
                        
                        currentBuild.description = "배포 진행 중"
                        
                    } catch (err) {
                        // Abort 또는 타임아웃
                        sh """
                            curl -X POST ${MATTERMOST_WEBHOOK} \
                            -H 'Content-Type: application/json' \
                            -d '{
                                "text": "❌ **배포 취소됨** - 승인이 거부되었거나 타임아웃되었습니다.\\n**Build:** #${buildNumber}"
                            }'
                        """
                        error("배포가 취소되었습니다.")
                    }
                }
            }
        }
        
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
                        docker buildx inspect --bootstrap || docker buildx create --use --name multiarch-builder --platform linux/amd64,linux/arm64
                        docker buildx use multiarch-builder
                    '''
                }
            }
        }
        
        stage('Build Images') {
            parallel {
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
                sh """
                    curl -X POST ${MATTERMOST_WEBHOOK} \
                    -H 'Content-Type: application/json' \
                    -d '{
                        "text": "### ✅ 배포 성공\\n**Build:** #${BUILD_NUMBER}\\n**Duration:** ${currentBuild.durationString}\\n**Images:**\\n- Frontend: ${FRONTEND_IMAGE}\\n- Backend: ${BACKEND_IMAGE}\\n\\nWatchtower가 컨테이너를 업데이트했습니다."
                    }'
                """
            }
        }
        
        failure {
            script {
                echo "❌ Pipeline failed"
                sh """
                    curl -X POST ${MATTERMOST_WEBHOOK} \
                    -H 'Content-Type: application/json' \
                    -d '{
                        "text": "### ❌ 배포 실패\\n**Build:** #${BUILD_NUMBER}\\n**Stage:** ${env.STAGE_NAME}\\n**Error:** 빌드 중 오류가 발생했습니다.\\n\\n로그를 확인해주세요: ${BUILD_URL}"
                    }'
                """
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
