pipeline {
    agent any

    triggers {
        githubPush()
    }

    options {
        timestamps()
        skipDefaultCheckout(true)
        disableConcurrentBuilds()
    }

    environment {
        LOCAL_BACKEND_IMAGE = 'cazzsoft/gestion-usuarios-backend:practica1'
        LOCAL_FRONTEND_IMAGE = 'cazzsoft/gestion-usuarios-frontend:practica1'
        REMOTE_BACKEND_IMAGE = 'gestion-usuarios-backend'
        REMOTE_FRONTEND_IMAGE = 'gestion-usuarios-frontend'

        RAILWAY_PROJECT_ID = 'e1c94368-5668-461e-8c49-72bfffc8aa63'
        RAILWAY_ENVIRONMENT_ID = '8cce3898-1c2f-44ad-9cbf-d68d3751316f'
        RAILWAY_BACKEND_SERVICE_ID = 'f0c23caf-42e4-4622-bf2c-852bb268dbdf'
        RAILWAY_FRONTEND_SERVICE_ID = '5362e024-a89a-4ce1-a334-240724103ec3'
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    def scmVars = checkout scm
                    env.SCM_GIT_BRANCH = scmVars.GIT_BRANCH ?: ''
                    env.SCM_GIT_COMMIT = scmVars.GIT_COMMIT ?: ''
                    echo "SCM branch: ${env.SCM_GIT_BRANCH}"
                    echo "SCM commit: ${env.SCM_GIT_COMMIT}"
                }
            }
        }

        stage('Metadata') {
            steps {
                script {
                    env.GIT_FULL = env.SCM_GIT_COMMIT ?: sh(
                        script: 'git rev-parse HEAD', returnStdout: true
                    ).trim()
                    env.GIT_SHORT = sh(
                        script: 'git rev-parse --short HEAD', returnStdout: true
                    ).trim()
                    env.ORIGIN_MAIN_COMMIT = sh(
                        script: 'git rev-parse origin/main', returnStdout: true
                    ).trim()
                    env.IS_MAIN = env.GIT_FULL == env.ORIGIN_MAIN_COMMIT ? 'true' : 'false'
                    currentBuild.description = "commit ${env.GIT_SHORT} | main=${env.IS_MAIN}"

                    echo "Job: ${env.JOB_NAME}"
                    echo "Build: ${env.BUILD_NUMBER}"
                    echo "Rama: ${env.SCM_GIT_BRANCH}"
                    echo "Commit: ${env.GIT_FULL}"
                    echo "Es main: ${env.IS_MAIN}"
                }
                sh '''
                    set -eu
                    mkdir -p reports
                    cat > reports/build-metadata.txt <<EOF
JOB_NAME=${JOB_NAME}
BUILD_NUMBER=${BUILD_NUMBER}
BUILD_URL=${BUILD_URL}
SCM_GIT_BRANCH=${SCM_GIT_BRANCH:-unknown}
GIT_SHORT=${GIT_SHORT}
GIT_FULL=${GIT_FULL}
ORIGIN_MAIN_COMMIT=${ORIGIN_MAIN_COMMIT}
IS_MAIN=${IS_MAIN}
RAILWAY_PROJECT_ID=${RAILWAY_PROJECT_ID}
RAILWAY_ENVIRONMENT_ID=${RAILWAY_ENVIRONMENT_ID}
EOF
                '''
            }
        }

        stage('Backend - Dependencias') {
            steps {
                dir('backend') {
                    sh 'npm ci'
                    sh 'npx prisma generate'
                }
            }
        }

        stage('Backend - Build') {
            steps {
                dir('backend') {
                    sh 'npm run build'
                }
            }
        }

        stage('Backend - Pruebas') {
            steps {
                dir('backend') {
                    sh 'npm test'
                }
            }
        }

        stage('Frontend - Dependencias') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                }
            }
        }

        stage('Frontend - Analisis') {
            steps {
                dir('frontend') {
                    sh 'npm run lint'
                }
            }
        }

        stage('Frontend - Build') {
            steps {
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }

        stage('Docker - Validacion') {
            steps {
                sh '''
                    set -eu
                    test -f backend/Dockerfile
                    test -f frontend/Dockerfile
                    docker version
                    echo 'Dockerfiles y cliente Docker validados.'
                '''
            }
        }

        stage('Docker - Construccion') {
            steps {
                sh '''
                    set -eu
                    docker build --pull --no-cache -t "$LOCAL_BACKEND_IMAGE" ./backend
                    docker build --pull --no-cache -t "$LOCAL_FRONTEND_IMAGE" ./frontend
                '''
            }
        }

        stage('Docker - Verificacion y evidencias') {
            steps {
                sh '''
                    set -eu
                    mkdir -p reports
                    docker image inspect "$LOCAL_BACKEND_IMAGE" > reports/backend-image-inspect.json
                    docker image inspect "$LOCAL_FRONTEND_IMAGE" > reports/frontend-image-inspect.json
                    docker image ls --format '{{.Repository}}:{{.Tag}} {{.ID}} {{.Size}}' > reports/docker-images.txt
                    echo "Backend verificado: $LOCAL_BACKEND_IMAGE"
                    echo "Frontend verificado: $LOCAL_FRONTEND_IMAGE"
                '''
            }
        }

        stage('Docker - Publicacion') {
            when {
                expression { env.IS_MAIN == 'true' }
            }
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-cazzsoft',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_TOKEN'
                )]) {
                    sh '''
                        set -eu
                        export DOCKER_CONFIG="$(mktemp -d)"
                        trap 'rm -rf "$DOCKER_CONFIG"' EXIT
                        echo "$DOCKER_TOKEN" | docker login -u "$DOCKER_USER" --password-stdin

                        BACKEND_LATEST="$DOCKER_USER/$REMOTE_BACKEND_IMAGE:latest"
                        BACKEND_BUILD="$DOCKER_USER/$REMOTE_BACKEND_IMAGE:$BUILD_NUMBER"
                        BACKEND_TRACE="$DOCKER_USER/$REMOTE_BACKEND_IMAGE:$BUILD_NUMBER-$GIT_SHORT"
                        FRONTEND_LATEST="$DOCKER_USER/$REMOTE_FRONTEND_IMAGE:latest"
                        FRONTEND_BUILD="$DOCKER_USER/$REMOTE_FRONTEND_IMAGE:$BUILD_NUMBER"
                        FRONTEND_TRACE="$DOCKER_USER/$REMOTE_FRONTEND_IMAGE:$BUILD_NUMBER-$GIT_SHORT"

                        docker tag "$LOCAL_BACKEND_IMAGE" "$BACKEND_LATEST"
                        docker tag "$LOCAL_BACKEND_IMAGE" "$BACKEND_BUILD"
                        docker tag "$LOCAL_BACKEND_IMAGE" "$BACKEND_TRACE"
                        docker tag "$LOCAL_FRONTEND_IMAGE" "$FRONTEND_LATEST"
                        docker tag "$LOCAL_FRONTEND_IMAGE" "$FRONTEND_BUILD"
                        docker tag "$LOCAL_FRONTEND_IMAGE" "$FRONTEND_TRACE"

                        docker push "$BACKEND_LATEST"
                        docker push "$BACKEND_BUILD"
                        docker push "$BACKEND_TRACE"
                        docker push "$FRONTEND_LATEST"
                        docker push "$FRONTEND_BUILD"
                        docker push "$FRONTEND_TRACE"

                        cat > reports/docker-publish-metadata.txt <<EOF
BACKEND_LATEST=${BACKEND_LATEST}
BACKEND_BUILD=${BACKEND_BUILD}
BACKEND_TRACE=${BACKEND_TRACE}
FRONTEND_LATEST=${FRONTEND_LATEST}
FRONTEND_BUILD=${FRONTEND_BUILD}
FRONTEND_TRACE=${FRONTEND_TRACE}
EOF
                        docker logout >/dev/null 2>&1 || true
                    '''
                }
            }
        }

        stage('Railway - CLI Check') {
            when {
                expression { env.IS_MAIN == 'true' }
            }
            steps {
                sh 'npx -y @railway/cli --version'
            }
        }

        stage('Railway - Redeploy Backend') {
            when {
                expression { env.IS_MAIN == 'true' }
            }
            steps {
                withCredentials([string(
                    credentialsId: 'railway-token', variable: 'RAILWAY_TOKEN'
                )]) {
                    sh '''
                        set -eu
                        mkdir -p reports
                        npx -y @railway/cli redeploy \
                            --service "$RAILWAY_BACKEND_SERVICE_ID" \
                            --environment "$RAILWAY_ENVIRONMENT_ID" \
                            --yes --json > reports/railway-backend-redeploy.json
                        cat reports/railway-backend-redeploy.json
                    '''
                }
            }
        }

        stage('Railway - Redeploy Frontend') {
            when {
                expression { env.IS_MAIN == 'true' }
            }
            steps {
                withCredentials([string(
                    credentialsId: 'railway-token', variable: 'RAILWAY_TOKEN'
                )]) {
                    sh '''
                        set -eu
                        mkdir -p reports
                        npx -y @railway/cli redeploy \
                            --service "$RAILWAY_FRONTEND_SERVICE_ID" \
                            --environment "$RAILWAY_ENVIRONMENT_ID" \
                            --yes --json > reports/railway-frontend-redeploy.json
                        cat reports/railway-frontend-redeploy.json
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "Pipeline satisfactorio | build=${env.BUILD_NUMBER} | commit=${env.GIT_SHORT ?: 'N/A'}"
            script {
                if (env.IS_MAIN == 'true') {
                    echo 'Pruebas, imágenes trazables y redeploy de Railway completados.'
                } else {
                    echo 'Rama no-main: publicación y despliegue omitidos.'
                }
            }
        }
        failure {
            echo 'Pipeline fallido: revisar la primera etapa fallida.'
        }
        always {
            sh 'docker logout >/dev/null 2>&1 || true'
            archiveArtifacts(
                artifacts: 'reports/**, frontend/dist/**',
                allowEmptyArchive: true,
                fingerprint: true
            )
        }
    }
}
