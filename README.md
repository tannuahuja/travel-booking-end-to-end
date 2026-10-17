# Travel Booking — DevSecOps Reference Project

A learning-oriented, end-to-end sample using Node.js + Express, PostgreSQL, Docker, Terraform, Kubernetes, Helm, Jenkins, GitHub Actions, Argo CD, Trivy, Checkov, SonarQube, Prometheus and Grafana.

> **Important:** This is a reference scaffold, not a production-certified platform. Review all infrastructure, secrets, IAM, network exposure, resource sizing, versions and costs before deploying. The bootstrap script installs tools on Ubuntu; it does not create AWS resources or silently run Terraform apply.

## Architecture

1. **Application:** Express REST API + static frontend; PostgreSQL stores trips/bookings.
2. **CI:** Jenkins pipeline runs lint, unit tests, dependency audit, Checkov, Trivy filesystem/image scans and SonarQube analysis (when configured).
3. **Artifact:** Docker images tagged with the Git commit SHA and pushed to ECR.
4. **Infrastructure:** Terraform modules for VPC, ECR and optional EKS scaffolding. Review the lab's SCP restrictions before provisioning.
5. **Delivery:** Helm chart deploys the app; Argo CD watches the GitOps directory and reconciles Kubernetes state.
6. **Observability:** Prometheus scrapes app metrics; Grafana visualizes them.
7. **Environments:** Terraform `dev` and `prod` tfvars/backends are separated. Never share state between environments. Use separate AWS accounts for real production where possible.

## Repository map

- `app/` — Express app, static UI, tests and lint configuration
- `docker/` — Dockerfiles and local Compose (PostgreSQL, app, SonarQube)
- `terraform/` — reusable modules and dev/prod environment roots
- `k8s/helm/travel-booking/` — Helm chart
- `gitops/` — Argo CD Application example
- `monitoring/` — Prometheus configuration
- `Jenkinsfile` — CI/CD pipeline
- `scripts/install-tools.sh` — Ubuntu tool bootstrap
- `.github/workflows/ci.yml` — GitHub Actions CI alternative

## 1. Bootstrap tools on Ubuntu EC2

Use a reasonably sized Ubuntu host. A `t3.micro` is not sufficient to run Jenkins, SonarQube, Kubernetes, Prometheus and Grafana together. A practical all-in-one lab generally needs at least 8 GiB RAM, and 16 GiB is more comfortable. For a constrained EC2 lab, install CLI tools only and run heavyweight services separately or locally.

```bash
chmod +x scripts/install-tools.sh
./scripts/install-tools.sh --cli
```

For a Docker-based local service stack, install CLI tools first, then run:

```bash
docker compose -f docker/compose.yaml up -d
```

This starts the app, PostgreSQL, SonarQube, Prometheus and Grafana. SonarQube and Grafana are for lab use; do not expose their ports publicly.

## 2. Run app locally

```bash
cd app
npm install
npm run lint
npm test
npm start
```

Open `http://localhost:3000`. The API health endpoint is `/api/health`; Prometheus metrics are at `/metrics`.

## 3. Configure AWS safely

```bash
aws sts get-caller-identity
aws configure get region
cd terraform/environments/dev
terraform init
terraform fmt -recursive
terraform validate
terraform plan -out=tfplan
terraform show tfplan
```

**Do not run `terraform apply` until you have reviewed the plan, verified the lab permits every requested resource, checked state/backend/locking, and estimated cost.** Never commit `.tfstate`, plan files, credentials, PEM keys, `.env` files or Sonar tokens.

Terraform `dev` and `prod` roots are separated. The included AWS module currently provisions ECR repositories only; VPC/EKS resources are deliberately not auto-created because lab accounts may deny EC2/EKS operations and EKS can incur ongoing costs. Extend the modules only after confirming policy support.

## 4. Build and scan image

```bash
docker build -f docker/Dockerfile -t travel-booking:local .
trivy fs --scanners vuln,misconfig,secret .
trivy image travel-booking:local
```

## 5. Kubernetes / Helm

Build/push images first, then update `k8s/helm/travel-booking/values.yaml` with your registry and immutable image tags.

```bash
helm lint k8s/helm/travel-booking
helm template travel-booking k8s/helm/travel-booking \
  --namespace travel-booking
kubectl create namespace travel-booking
helm upgrade --install travel-booking k8s/helm/travel-booking \
  --namespace travel-booking --dry-run
```

For a real install, remove `--dry-run` only after reviewing the rendered manifests and confirming cluster context/namespace. PostgreSQL in this chart is for demo use; for production use managed RDS, backups, encryption, network isolation and a proper secret manager.

## 6. Argo CD GitOps

Update `gitops/travel-booking-application.yaml` with the Git repository URL and target cluster namespace. Apply it only when `kubectl config current-context` points to the intended cluster and Argo CD is installed:

```bash
kubectl apply -f gitops/travel-booking-application.yaml
```

Change desired state in Git (for example replica count or image tag), commit/push, then observe:

```bash
kubectl get applications -n argocd
kubectl get pods -n travel-booking -w
```

## 7. Jenkins

Create a Jenkins job from SCM using this repository's `Jenkinsfile`. Configure credentials in Jenkins Credentials (never in source):
- `sonar-token` — SonarQube token (optional if SonarQube stage configured)
- `aws-credentials` — prefer instance role/OIDC rather than static keys
- `ecr-registry` — registry hostname, e.g. `ACCOUNT.dkr.ecr.us-east-1.amazonaws.com`

The pipeline is a teaching example. Configure Jenkins agents with Docker, Node.js, Terraform, Checkov and Trivy; use isolated agents and short-lived credentials for stronger security.

## Environment promotion

- `dev`: automatic build/test/scan, deploy only after checks pass.
- `stage`: promote the same immutable image digest after integration tests/approval.
- `prod`: manual approval, protected branch, policy checks, change review and rollback plan.
- Do not rebuild a different image for prod; promote the same tested digest.

## Cleanup

Before ending a lab, inspect AWS resources and costs. If Terraform created resources, use the correct environment directory and review `terraform plan -destroy` before any destroy. Do not delete a shared state/backend or resources not owned by this project.
