pipeline {
    agent any

    environment {
        RAILWAY_PROJECT_ID = 'e1c94368-5668-461e-8c49-72bfffc8aa63'
        RAILWAY_ENVIRONMENT_ID = '8cce3898-1c2f-44ad-9cbf-d68d3751316f'
        RAILWAY_BACKEND_SERVICE_ID = 'f0c23caf-42e4-4622-bf2c-852bb268dbdf'
        RAILWAY_FRONTEND_SERVICE_ID = '5362e024-a89a-4ce1-a334-240724103ec3'
    }

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    parameters {
        booleanParam(
            name: 'PUBLICAR_IMAGENES',
            defaultValue: true,
            description: 'Publicar imagenes en Docker Hub y redesplegar Railway'
        )
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                sh 'git rev-parse --short HEAD'
            }
        }

        stage('Entorno') {
            steps {
                sh 'echo "Nodo: $NODE_NAME"'
                sh 'echo "Workspace: $WORKSPACE"'
                sh 'node --version && npm --version'
                sh 'docker version'
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

        stage('Docker - Construccion') {
            steps {
                sh 'docker build -t gestion-usuarios-backend:${BUILD_NUMBER} ./backend'
                sh 'docker build -t gestion-usuarios-frontend:${BUILD_NUMBER} ./frontend'
            }
        }

        stage('Docker - Publicacion') {
            when {
                expression { params.PUBLICAR_IMAGENES }
            }
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-cazzsoft',
                    usernameVariable: 'DOCKERHUB_USER',
                    passwordVariable: 'DOCKERHUB_TOKEN'
                )]) {
                    sh '''
                        set -eu

                        export DOCKER_CONFIG="$(mktemp -d)"
                        trap 'rm -rf "$DOCKER_CONFIG"' EXIT

                        echo "$DOCKERHUB_TOKEN" | docker login \
                            --username "$DOCKERHUB_USER" \
                            --password-stdin

                        docker tag gestion-usuarios-backend:${BUILD_NUMBER} \
                            "$DOCKERHUB_USER/gestion-usuarios-backend:${BUILD_NUMBER}"
                        docker tag gestion-usuarios-backend:${BUILD_NUMBER} \
                            "$DOCKERHUB_USER/gestion-usuarios-backend:latest"

                        docker tag gestion-usuarios-frontend:${BUILD_NUMBER} \
                            "$DOCKERHUB_USER/gestion-usuarios-frontend:${BUILD_NUMBER}"
                        docker tag gestion-usuarios-frontend:${BUILD_NUMBER} \
                            "$DOCKERHUB_USER/gestion-usuarios-frontend:latest"

                        docker push "$DOCKERHUB_USER/gestion-usuarios-backend:${BUILD_NUMBER}"
                        docker push "$DOCKERHUB_USER/gestion-usuarios-backend:latest"
                        docker push "$DOCKERHUB_USER/gestion-usuarios-frontend:${BUILD_NUMBER}"
                        docker push "$DOCKERHUB_USER/gestion-usuarios-frontend:latest"

                        docker logout
                    '''
                }
            }
        }

        stage('Verificacion') {
            steps {
                sh 'docker image inspect gestion-usuarios-backend:${BUILD_NUMBER} --format "Backend: {{.Id}}"'
                sh 'docker image inspect gestion-usuarios-frontend:${BUILD_NUMBER} --format "Frontend: {{.Id}}"'
            }
        }

        stage('Railway - CLI Check') {
            when {
                expression { params.PUBLICAR_IMAGENES }
            }
            steps {
                sh 'npx -y @railway/cli --version'
            }
        }

        stage('Railway - Redeploy Backend') {
            when {
                expression { params.PUBLICAR_IMAGENES }
            }
            steps {
                withCredentials([string(
                    credentialsId: 'railway-token',
                    variable: 'RAILWAY_TOKEN'
                )]) {
                    sh '''
                        set -eu

                        npx -y @railway/cli redeploy \
                            --service "$RAILWAY_BACKEND_SERVICE_ID" \
                            --environment "$RAILWAY_ENVIRONMENT_ID" \
                            --yes
                    '''
                }
            }
        }

        stage('Railway - Redeploy Frontend') {
            when {
                expression { params.PUBLICAR_IMAGENES }
            }
            steps {
                withCredentials([string(
                    credentialsId: 'railway-token',
                    variable: 'RAILWAY_TOKEN'
                )]) {
                    sh '''
                        set -eu

                        npx -y @railway/cli redeploy \
                            --service "$RAILWAY_FRONTEND_SERVICE_ID" \
                            --environment "$RAILWAY_ENVIRONMENT_ID" \
                            --yes
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline satisfactorio: controles, imagenes y despliegue completados'
        }
        failure {
            echo 'Pipeline fallido: revisar la primera etapa y el primer error relevante'
        }
        always {
            archiveArtifacts artifacts: 'frontend/dist/**', allowEmptyArchive: true
        }
    }
}
