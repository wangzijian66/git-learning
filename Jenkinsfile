pipeline {
    agent any

    stages {
        stage('拉取代码') {
            steps {
                echo 'Jenkins 已从 GitHub 获取项目代码'
            }
        }

        stage('检查项目') {
            steps {
                sh 'pwd'
                sh 'ls -la'
                sh 'test -f index.html'
                sh 'test -f backend/server.js'
                echo '项目文件检查通过！'
            }
        }
    }
}
