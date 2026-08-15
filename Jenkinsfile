pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    parameters {
        booleanParam(
            name: 'PUBLICAR_IMAGENES',
            defaultValue: false,
            description: 'Publicar las imágenes en Docker Hub mediante credenciales de Jenkins'
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
                        echo "$DOCKERHUB_TOKEN" | docker login --username "$DOCKERHUB_USER" --password-stdin
                        docker tag gestion-usuarios-backend:${BUILD_NUMBER} "$DOCKERHUB_USER/gestion-usuarios-backend:${BUILD_NUMBER}"
                        docker tag gestion-usuarios-frontend:${BUILD_NUMBER} "$DOCKERHUB_USER/gestion-usuarios-frontend:${BUILD_NUMBER}"
                        docker push "$DOCKERHUB_USER/gestion-usuarios-backend:${BUILD_NUMBER}"
                        docker push "$DOCKERHUB_USER/gestion-usuarios-frontend:${BUILD_NUMBER}"
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
    }

    post {
        success {
            echo 'Pipeline satisfactorio: controles e imágenes completados'
        }
        failure {
            echo 'Pipeline fallido: revisar la primera etapa y el primer error relevante'
        }
        always {
            archiveArtifacts artifacts: 'frontend/dist/**', allowEmptyArchive: true
        }
    }
}
