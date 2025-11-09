// Jenkinsfile - Pipeline CI/CD pour Front-end et Back-end

pipeline {
    agent any

    // --- Variables d'Environnement Globales ---
    environment {
        DOCKER_USER_ID = "yassinehriz"  // << A CHANGER
        TAG_NAME = "build-${BUILD_NUMBER}"
        DOCKER_CREDENTIAL_ID = "dockerhub-creds"
        K8S_MANIFESTS_PATH = "k8s"
    }

    stages {
        
        stage('1. Checkout Code') {
            steps { echo 'Récupération du code source...' }
        }
        
        // =================================================================
        // ÉTAPES DU SERVICE BACK-END
        // =================================================================
        
        stage('2. Build Back-end') {
            steps {
                script {
                    def BACK_IMAGE = "${DOCKER_USER_ID}/catalogue-back:${TAG_NAME}"
                    echo "Construction de l'image Back-end: ${BACK_IMAGE}"
                    // Construit l'image en utilisant le Dockerfile dans le dossier 'back-code'
                    sh "docker build -t ${BACK_IMAGE} ./microservice-backend" 
                }
            }
        }
        
        stage('3. Push Back-end') {
            steps {
                script {
                    def BACK_IMAGE = "${DOCKER_USER_ID}/catalogue-back:${TAG_NAME}"
                    withCredentials([usernamePassword(credentialsId: DOCKER_CREDENTIAL_ID, passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USER')]) {
                        sh "echo \$DOCKER_PASSWORD | docker login -u \$DOCKER_USER --password-stdin"
                        sh "docker push ${BACK_IMAGE}"
                        sh "docker logout"
                    }
                }
            }
        }
        
        // =================================================================
        // ÉTAPES DU SERVICE FRONT-END
        // =================================================================
        
        stage('4. Build Front-end') {
            steps {
                script {
                    def FRONT_IMAGE = "${DOCKER_USER_ID}/image-catalogue-front:${TAG_NAME}"
                    echo "Construction de l'image Front-end: ${FRONT_IMAGE}"
                    // Construit l'image en utilisant le Dockerfile dans le dossier 'front-code'
                    sh "docker build -t ${FRONT_IMAGE} ./microservice-frontend" 
                }
            }
        }
        
 stage('5. Push Front-end') {
            steps {
                script {
                    def FRONT_IMAGE = "${DOCKER_USER_ID}/image-catalogue-front:${TAG_NAME}"
                    withCredentials([usernamePassword(credentialsId: DOCKER_CREDENTIAL_ID, passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USER')]) {
                        sh "echo \$DOCKER_PASSWORD | docker login -u \$DOCKER_USER --password-stdin"
                        sh "docker push ${FRONT_IMAGE}" 
                        sh "docker logout" // LOGOUT pour nettoyer la session
                    }
                }
            }
        }
        // =================================================================
        // ÉTAPE DE DÉPLOIEMENT CONSOLIDÉE
        // =================================================================
        
        stage('6. Deploy Services to Kubernetes') {
            steps {
                // Le bloc script autorise les déclarations de variables Groovy (def)
                script {
                    def BACK_IMAGE = "${DOCKER_USER_ID}/catalogue-back:${TAG_NAME}"
                    def FRONT_IMAGE = "${DOCKER_USER_ID}/microservice-catalogue-frontend:${TAG_NAME}"
                    
                    // 1. Mise à jour du Déploiement du BACK-END
                    echo "Mise à jour de l'image Back-end dans le YAML..."
                    sh "sed -i 's|image: .*catalogue-back:.*|image: ${BACK_IMAGE}|' ${K8S_MANIFESTS_PATH}/backend-deployment.yaml"
                    
                    // 2. Mise à jour du Déploiement du FRONT-END
                    echo "Mise à jour de l'image Front-end dans le YAML..."
                    sh "sed -i 's|image: .*catalogue-front:.*|image: ${FRONT_IMAGE}|' ${K8S_MANIFESTS_PATH}/frontend-deployment.yaml"

                    // 3. Application des manifestes (y compris la base de données qui ne change pas)
                    echo "Application des manifestes de tous les services avec kubectl..."
                    sh "kubectl apply -f ${K8S_MANIFESTS_PATH}/" 
                } // Fin du bloc script
            }
        }
    }
}