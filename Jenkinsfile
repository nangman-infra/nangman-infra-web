import groovy.json.JsonOutput

def SPOT_AGENT_LABEL = 'spot-agent'
def DEFAULT_SONARQUBE_INSTALLATION = 'sonarqube'
def DEFAULT_SONAR_SCANNER_TOOL = 'SonarScanner'
def DEFAULT_SONAR_PROJECT_KEY = 'nangman-web'
def DEFAULT_SONAR_PROJECT_NAME = 'nangman-infra-web'
def GITHUB_WEBHOOK_TRIGGER_TOKEN_CREDENTIAL_ID = 'GITHUB_WEBHOOK_TRIGGER_TOKEN'
def EXTERNAL_APP_TRIGGER_TOKEN_CREDENTIAL_ID = 'JENKINS_EXTERNAL_APP_TRIGGER_TOKEN'

pipeline {
    agent { label SPOT_AGENT_LABEL }

    triggers {
        GenericTrigger(
            genericVariables: [
                [key: 'GIT_REF', value: '$.ref', defaultValue: ''],
                [key: 'REPO_URL', value: '$.repository.clone_url', defaultValue: 'NO_REPO'],
                [key: 'GIT_SHA', value: '$.after', defaultValue: '']
            ],
            tokenCredentialId: GITHUB_WEBHOOK_TRIGGER_TOKEN_CREDENTIAL_ID,
            causeString: 'GitHub webhook 이벤트 발생',
            regexpFilterText: '$GIT_REF $REPO_URL',
            regexpFilterExpression: 'refs/heads/main .*nangman-infra-web.*',
            printContributedVariables: true,
            printPostContent: true
        )
    }

    environment {
        MATTERMOST_WEBHOOK = credentials('mattermost-webhook-url')

        SONARQUBE_INSTALLATION = "${DEFAULT_SONARQUBE_INSTALLATION}"
        SONAR_SCANNER_TOOL = "${DEFAULT_SONAR_SCANNER_TOOL}"
        SONAR_PROJECT_KEY = "${DEFAULT_SONAR_PROJECT_KEY}"
        SONAR_PROJECT_NAME = "${DEFAULT_SONAR_PROJECT_NAME}"

        FAILURE_STAGE = 'Unknown'
        FAILURE_REASON = '검증 중 오류가 발생했습니다.'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
        ansiColor('xterm')
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    echo "🔍 GitHub webhook 수신: ref=${env.GIT_REF}, sha=${env.GIT_SHA}"

                    checkout scm

                    if (env.GIT_SHA?.trim()) {
                        sh """
                            git fetch --all --tags --prune
                            git checkout ${env.GIT_SHA}
                        """
                    }

                    env.SOURCE_BRANCH = env.GIT_REF?.replaceFirst('^refs/heads/', '') ?: 'main'
                    env.RESOLVED_COMMIT_SHA = sh(returnStdout: true, script: 'git rev-parse HEAD').trim()
                    env.RESOLVED_COMMIT_SHORT = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
                    currentBuild.description = "검증 ${env.RESOLVED_COMMIT_SHORT}"
                }
            }
        }

        stage('Validation Start Notification') {
            steps {
                script {
                    def payload = JsonOutput.toJson([
                        text: "🔎 **검증 시작**\n\n**Branch:** ${env.SOURCE_BRANCH}\n**Commit:** `${env.RESOLVED_COMMIT_SHORT}`\n**Build:** #${env.BUILD_NUMBER}\n\nSonarQube 검증을 시작합니다.\n[빌드 확인](${env.BUILD_URL})"
                    ])

                    sh """
                        curl -X POST \$MATTERMOST_WEBHOOK \
                        -H 'Content-Type: application/json' \
                        -d '${payload}'
                    """
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    env.FAILURE_STAGE = 'SonarQube Analysis'
                    env.FAILURE_REASON = 'SonarQube 분석에 실패해 배포 승인 요청을 보내지 못했습니다.'

                    sh '''
                        cd frontend && pnpm install --frozen-lockfile && pnpm test:cov || true
                        cd ../backend && pnpm install --frozen-lockfile && pnpm test:cov || true
                        cd ..
                    '''

                    echo "🔎 SonarQube project: ${env.SONAR_PROJECT_NAME} (${env.SONAR_PROJECT_KEY})"
                    def scannerHome = tool env.SONAR_SCANNER_TOOL

                    withSonarQubeEnv(env.SONARQUBE_INSTALLATION) {
                        sh """
                            ${scannerHome}/bin/sonar-scanner \
                            -Dproject.settings=sonar-project.properties \
                            -Dsonar.projectKey=${env.SONAR_PROJECT_KEY} \
                            -Dsonar.projectName=${env.SONAR_PROJECT_NAME} \
                            -Dsonar.scm.revision=${env.RESOLVED_COMMIT_SHA}
                        """
                    }

                    def qualityGate
                    timeout(time: 15, unit: 'MINUTES') {
                        qualityGate = waitForQualityGate abortPipeline: false
                    }

                    if (qualityGate?.status != 'OK') {
                        env.FAILURE_STAGE = 'Quality Gate'
                        env.FAILURE_REASON = "SonarQube 품질 기준을 통과하지 못했습니다. status=${qualityGate?.status ?: 'UNKNOWN'}"
                        error("Quality Gate failed: ${qualityGate?.status ?: 'UNKNOWN'}")
                    }
                }
            }
        }

        stage('Request Deployment Approval') {
            steps {
                script {
                    def sonarUrl = "https://sonarqube.nangman.cloud/dashboard?id=${env.SONAR_PROJECT_KEY}"

                    withCredentials([
                        string(credentialsId: EXTERNAL_APP_TRIGGER_TOKEN_CREDENTIAL_ID, variable: 'APP_TRIGGER_TOKEN')
                    ]) {
                        def deployWebhookUrl = "https://jenkins.nangman.cloud/generic-webhook-trigger/invoke?token=${APP_TRIGGER_TOKEN}"
                        def payload = JsonOutput.toJson([
                            text: "✅ **검증 완료**\n\n**Branch:** ${env.SOURCE_BRANCH}\n**Commit:** `${env.RESOLVED_COMMIT_SHORT}`\n**Build:** #${env.BUILD_NUMBER}\n**Sonar:** 통과\n\n배포를 진행하시겠습니까?\n[빌드 확인](${env.BUILD_URL}) | [SonarQube](${sonarUrl})",
                            attachments: [[
                                color: "#2D9CDB",
                                actions: [
                                    [
                                        name: "🚀 배포 시작",
                                        integration: [
                                            url: deployWebhookUrl,
                                            context: [
                                                action: "deploy",
                                                commit_sha: "${env.RESOLVED_COMMIT_SHA}",
                                                commit_short: "${env.RESOLVED_COMMIT_SHORT}",
                                                branch: "${env.SOURCE_BRANCH}",
                                                validation_build_number: "${env.BUILD_NUMBER}",
                                                validation_build_url: "${env.BUILD_URL}",
                                                validation_job_name: "${env.JOB_NAME}"
                                            ]
                                        ]
                                    ],
                                    [
                                        name: "❌ 배포 취소",
                                        integration: [
                                            url: deployWebhookUrl,
                                            context: [
                                                action: "cancel",
                                                commit_sha: "${env.RESOLVED_COMMIT_SHA}",
                                                commit_short: "${env.RESOLVED_COMMIT_SHORT}",
                                                branch: "${env.SOURCE_BRANCH}",
                                                validation_build_number: "${env.BUILD_NUMBER}",
                                                validation_build_url: "${env.BUILD_URL}",
                                                validation_job_name: "${env.JOB_NAME}"
                                            ]
                                        ]
                                    ]
                                ]
                            ]]
                        ])

                        sh """
                            curl -X POST \$MATTERMOST_WEBHOOK \
                            -H 'Content-Type: application/json' \
                            -d '${payload}'
                        """
                    }
                }
            }
        }
    }

    post {
        success {
            script {
                echo "✅ Validation pipeline completed successfully"
            }
        }

        failure {
            script {
                def payload = JsonOutput.toJson([
                    text: "⚠️ **검증 실패**\n\n**Branch:** ${env.SOURCE_BRANCH ?: 'unknown'}\n**Commit:** `${env.RESOLVED_COMMIT_SHORT ?: 'unknown'}`\n**Build:** #${env.BUILD_NUMBER}\n**Stage:** ${env.FAILURE_STAGE}\n**Error:** ${env.FAILURE_REASON}\n\n[로그 확인하기](${env.BUILD_URL})"
                ])

                sh """
                    curl -X POST \$MATTERMOST_WEBHOOK \
                    -H 'Content-Type: application/json' \
                    -d '${payload}'
                """
            }
        }
    }
}
