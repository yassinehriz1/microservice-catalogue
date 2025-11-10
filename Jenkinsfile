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
                    // Pas besoin de relogin, le token est encore actif, mais on utilise withCredentials pour la sécurité
                    withCredentials([usernamePassword(credentialsId: DOCKER_CREDENTIAL_ID, passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USER')]) {
                        sh "docker push ${FRONT_IMAGE}"
                    }
                }
            }
        }
        
        // =================================================================
        // ÉTAPE DE DÉPLOIEMENT CONSOLIDÉE
        // =================================================================
        
        stage('6. Deploy Services to Kubernetes') {
            steps {
                script {
                    def TAG_NAME = env.BUILD_NUMBER
                    def KUBECONFIG_TMP = "k8s/kubeconfig.tmp"
                    
                    echo "Préparation des certificats Kubeconfig pour contourner les problèmes de permission..."
                    
                    // 1. Créer le dossier local de travail (dans le workspace Jenkins)
                    sh "mkdir -p k8s/certs"
                    
                    // 2. Copier les certificats/clés sensibles
                    // NOTE: Cette étape suppose que jenkins a le droit de LIRE (o+r) les fichiers sources, ce que vous avez déjà fait avec chmod.
                    sh "cp /home/yassinehriz/.minikube/ca.crt k8s/certs/"
                    sh "cp /home/yassinehriz/.minikube/profiles/minikube/client.crt k8s/certs/"
                    sh "cp /home/yassinehriz/.minikube/profiles/minikube/client.key k8s/certs/"
                    
                    // 3. Créer le fichier kubeconfig temporaire et remplacer les chemins absolus
                    sh """
                        cp ~/.kube/config ${KUBECONFIG_TMP}
                        
                        sed -i 's|/home/yassinehriz/.minikube/ca.crt|k8s/certs/ca.crt|' ${KUBECONFIG_TMP}
                        sed -i 's|/home/yassinehriz/.minikube/profiles/minikube/client.crt|k8s/certs/client.crt|' ${KUBECONFIG_TMP}
                        sed -i 's|/home/yassinehriz/.minikube/profiles/minikube/client.key|k8s/certs/client.key|' ${KUBECONFIG_TMP}
                    """
                    
                    // --- MISE À JOUR DES IMAGES ET DÉPLOIEMENT ---
                    
                    echo "Mise à jour de l'image Back-end dans le YAML..."
                    sh "sed -i 's|image: .*catalogue-back:.*|image: yassinehriz/catalogue-back:build-${TAG_NAME}|' k8s/backend-deployment.yaml"
                    
                    echo "Mise à jour de l'image Front-end dans le YAML..."
                    sh "sed -i 's|image: .*catalogue-front:.*|image: yassinehriz/microservice-catalogue-frontend:build-${TAG_NAME}|' k8s/frontend-deployment.yaml"
                    
                    echo "Application des manifestes de tous les services avec kubectl..."
                    // Utiliser le kubeconfig temporaire et le chemin d'accès au fichier
                    sh "kubectl --kubeconfig=${KUBECONFIG_TMP} apply -f k8s/"
                }
            }
        }
    }
}