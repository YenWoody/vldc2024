pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                sh 'docker-compose build'
            }
        }
        stage('Test') {
            steps {
                sh 'docker-compose --version'
            }
        }
        stage('Deliver') {
            steps {
                sh 'docker-compose stop'
                sh 'docker-compose rm -f'
                sh 'docker-compose up -d'
            }
        }
    }
}
