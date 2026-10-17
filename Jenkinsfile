pipeline {
  agent any
  options {
    timestamps()
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }
  environment {
    IMAGE_NAME = 'travel-booking'
    AWS_DEFAULT_REGION = 'us-east-1'
  }
  stages {
    stage('Checkout') { steps { checkout scm } }
    stage('Install dependencies') {
      steps {
        dir('app') { sh 'npm install' }
      }
    }
    stage('Lint') {
      steps { dir('app') { sh 'npm run lint' } }
    }
    stage('Unit tests') {
      steps { dir('app') { sh 'npm test' } }
    }
    stage('Dependency audit') {
      steps { dir('app') { sh 'npm audit --audit-level=high' } }
    }
    stage('Terraform format and validate') {
      steps {
        sh '''
          terraform fmt -check -recursive terraform
          for d in terraform/environments/dev terraform/environments/prod; do
            terraform -chdir="$d" init -backend=false
            terraform -chdir="$d" validate
          done
        '''
      }
    }
    stage('Checkov IaC scan') {
      steps { sh 'checkov -d terraform --quiet' }
    }
    stage('Trivy filesystem scan') {
      steps { sh 'trivy fs --scanners vuln,misconfig,secret --exit-code 1 --severity HIGH,CRITICAL .' }
    }
    stage('Build image') {
      steps {
        sh '''
          docker build -f docker/Dockerfile \
            --label org.opencontainers.image.revision="$GIT_COMMIT" \
            -t "$IMAGE_NAME:$GIT_COMMIT" .
        '''
      }
    }
    stage('Trivy image scan') {
      steps { sh 'trivy image --exit-code 1 --severity HIGH,CRITICAL "$IMAGE_NAME:$GIT_COMMIT"' }
    }
    stage('Publish to ECR') {
      when { branch 'main' }
      steps {
        sh '''
          : "${ECR_REGISTRY:?Set ECR_REGISTRY in Jenkins environment}"
          aws ecr get-login-password --region "$AWS_DEFAULT_REGION" |
            docker login --username AWS --password-stdin "$ECR_REGISTRY"
          docker tag "$IMAGE_NAME:$GIT_COMMIT" "$ECR_REGISTRY/travel-booking-backend:$GIT_COMMIT"
          docker push "$ECR_REGISTRY/travel-booking-backend:$GIT_COMMIT"
        '''
      }
    }
  }
  post {
    always { sh 'docker image prune -f || true' }
    success { echo 'CI checks completed. Deployment promotion is intentionally a separate gated step.' }
  }
}
