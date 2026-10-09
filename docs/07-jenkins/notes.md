# Jenkins notes

Planned flow: checkout → lint/tests → SonarQube quality gate → secret/dependency scans → image build → Trivy scan → ECR publish → GitOps update → verify deployment. Never hard-code credentials.
