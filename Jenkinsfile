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
                sh """
                    echo \$DOCKER_PASSWORD | docker login -u \$DOCKER_USER --password-stdin
                    docker push ${FRONT_IMAGE}
                    docker logout
                """
            }
        }
    }
}

        
        // =================================================================
        // ÉTAPE DE DÉPLOIEMENT CONSOLIDÉE
        // =================================================================
        
        stage('Deploy Services to Kubernetes') {
            steps {
                script {
                    // On utilise le kubeconfig copié dans le workspace
                    sh '''
                    export KUBECONFIG=$WORKSPACE/jenkins-kube/config
                    sed -i 's|image: .*catalogue-back:.*|image: yassinehriz/catalogue-back:build-25|' k8s/backend-deployment.yaml
                    sed -i 's|image: .*image-catalogue-front:.*|image: yassinehriz/image-catalogue-front:build-25|' k8s/frontend-deployment.yaml
                    kubectl apply -f k8s/
                    '''
                }
            }
        }


    }
}
