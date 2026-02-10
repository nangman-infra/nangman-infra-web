pipeline {
    agent any
    
    parameters {
        // 매터모스트 버튼 클릭 여부 (기본값 false)
        booleanParam(
            name: 'IS_DEPLOY_REQUEST', 
            defaultValue: false, 
            description: '매터모스트 버튼 클릭으로 실행됨'
        )
    }
    
    // 매터모스트 버튼 클릭용 트리거만 유지
    // Push는 Organization Webhook이 자동으로 감지
    triggers {

        githubPush()
        
        GenericTrigger(
            genericVariables: [
                [key: 'IS_DEPLOY_REQUEST', value: '$.context.is_deploy']
            ],
            token: 'mattermost-deploy-button',
            causeString: '매터모스트 버튼 클릭으로 배포 실행됨',
            printContributedVariables: true,
            printPostContent: true
        )
    }
    
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
        // =========================================================
        // [경로 A] GitHub Push로 실행됨 -> 알림 보내고 종료
        // =========================================================
        stage('Notify Approval Request') {
            when {
                // 버튼 클릭이 아닐 때 (= Push로 자동 실행됐을 때)
                expression { return params.IS_DEPLOY_REQUEST == false }
            }
            steps {
                script {
                    echo "📣 GitHub Push 감지됨. 매터모스트에 승인 요청 전송."
                    
                    def branch = env.BRANCH_NAME ?: env.GIT_BRANCH ?: 'unknown'
                    def jobName = env.JOB_NAME ?: 'nangman-infra'
                    def buildNumber = env.BUILD_NUMBER
                    def buildUrl = env.BUILD_URL
                    
                    // 매터모스트로 버튼 달린 메시지 전송
                    def payload = """
{
  "text": "### 🚀 배포 승인 요청 (Push 감지)\\n**Repository:** ${jobName}\\n**Branch:** ${branch}\\n**Build:** #${buildNumber}\\n\\n배포를 진행하시겠습니까?",
  "attachments": [
    {
      "color": "#FFA500",
      "actions": [
        {
          "name": "🚀 배포 시작",
          "integration": {
            "url": "https://smee.io/eG3HzM0NYYmtt2t9?token=mattermost-deploy-button",
            "context": {
              "is_deploy": "true",
              "job_name": "${jobName}",
              "build_number": "${buildNumber}",
              "branch": "${branch}"
            }
          }
        },
        {
          "name": "❌ 배포 취소",
          "integration": {
            "url": "https://smee.io/eG3HzM0NYYmtt2t9?token=mattermost-deploy-button",
            "context": {
              "is_deploy": "false",
              "job_name": "${jobName}",
              "build_number": "${buildNumber}",
              "branch": "${branch}"
            }
          }
        }
      ]
    }
  ]
}
"""
                    
                    sh """
                        curl -X POST ${MATTERMOST_WEBHOOK} \
                        -H 'Content-Type: application/json' \
                        -d '${payload}'
                    """
                    
                    echo "✅ 매터모스트 알림 전송 완료. 버튼 클릭 대기 중..."
                    currentBuild.result = 'SUCCESS'
                    currentBuild.description = "배포 승인 대기 중"
                }
            }
        }
        
        // =========================================================
        // [경로 B] 매터모스트 버튼 클릭으로 실행됨 -> 진짜 빌드 시작
        // =========================================================
        stage('Deploy Pipeline') {
            when {
                // 버튼 클릭으로 실행됐을 때만!
                expression { return params.IS_DEPLOY_REQUEST == true }
            }
            stages {
                stage('Deploy Start Notification') {
                    steps {
                        script {
                            echo "✅ 배포 승인됨 - 빌드를 시작합니다."
                            sh """
                                curl -X POST ${MATTERMOST_WEBHOOK} \
                                -H 'Content-Type: application/json' \
                                -d '{
                                    "text": "✅ **배포 승인됨** - 빌드를 시작합니다...\\n**Build:** #${BUILD_NUMBER}"
                                }'
                            """
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
        }
    }
    
    post {
        success {
            script {
                echo "✅ Pipeline completed successfully"
                // 배포 파이프라인이 실행된 경우에만 성공 알림
                if (params.IS_DEPLOY_REQUEST == true) {
                    sh """
                        curl -X POST ${MATTERMOST_WEBHOOK} \
                        -H 'Content-Type: application/json' \
                        -d '{
                            "text": "### ✅ 배포 성공\\n**Build:** #${BUILD_NUMBER}\\n**Duration:** ${currentBuild.durationString}\\n**Images:**\\n- Frontend: ${FRONTEND_IMAGE}\\n- Backend: ${BACKEND_IMAGE}\\n\\nWatchtower가 컨테이너를 업데이트했습니다."
                        }'
                    """
                }
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
                // 배포 파이프라인이 실행된 경우에만 정리
                if (params.IS_DEPLOY_REQUEST == true) {
                    echo "🧹 Cleaning up Docker resources"
                    sh '''
                        docker buildx prune -f || true
                        docker system prune -f || true
                    '''
                }
            }
        }
    }
}
