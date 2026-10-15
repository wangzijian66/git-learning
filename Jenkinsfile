pipeline {
    agent any
    stages {
        stage('检查项目文件') {
            steps {
                sh 'test -f index.html'
                sh 'test -f add.html'
                sh 'test -f css/style.css'
                sh 'test -f js/map.js'
                sh 'test -f js/add.js'
                sh 'test -f backend/server.js'
                sh 'test -f backend/package.json'
                echo '项目文件检查通过！'
            }
        }
       
        stage('安装后端依赖') {
            steps {
                script {
                    writeFile file: 'backend/Dockerfile.ci', text: '''
FROM node:22-bookworm
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY server.js db.js ./
RUN node --check server.js && node --check db.js
'''
                }
                sh 'docker build -f backend/Dockerfile.ci -t travel-map-backend-ci:latest backend'
            }
        }
        stage('检查后端语法') {
            steps {
                sh 'docker run --rm travel-map-backend-ci:latest node --check server.js'
                sh 'docker run --rm travel-map-backend-ci:latest node --check db.js'
                echo '后端语法检查通过！'
            }
        }
        stage('构建后端镜像') {
            steps {
                script {
                    writeFile file: 'backend/.dockerignore', text: '''
.env
.env.*
node_modules
npm-debug.log*
'''
                    writeFile file: 'backend/Dockerfile', text: '''
FROM node:22-bookworm
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY server.js db.js ./
EXPOSE 3000
CMD ["node", "server.js"]
'''
                }
                sh 'docker build -t travel-map-backend:latest backend'
            }
        }
        stage('构建前端镜像') {
            steps {
                script {
                    writeFile file: '.dockerignore', text: '''
.git
jenkins-data-backup.tar.gz
Jenkinsfile.before-build
Jenkinsfile.before-frontend
backend
node_modules
.env
.env.*
'''
                    writeFile file: 'Dockerfile.frontend', text: '''
FROM nginx:alpine
COPY index.html add.html /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/
COPY data/ /usr/share/nginx/html/data/
COPY nginx.conf /etc/nginx/conf.d/default.conf
'''
                    writeFile file: 'nginx.conf', text: '''
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;
    location /api/ {
        proxy_pass http://travel-map-backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    location / {
        try_files $uri $uri/ =404;
    }
}
'''
                }
                sh 'docker build -f Dockerfile.frontend -t travel-map-frontend:latest .'
            }
        }
        stage('验证 Kubernetes 连接') {
            steps {
                withKubeConfig(
                    credentialsId: 'docker-desktop-kubeconfig',
                    serverUrl: 'https://host.docker.internal:49940',
                    contextName: 'docker-desktop',
                    namespace: 'default',
                    restrictKubeConfigAccess: false
                ) {
                    sh 'kubectl get nodes'
                    sh 'kubectl get deployments,services -n default'
                }
            }
        }
    }
}
