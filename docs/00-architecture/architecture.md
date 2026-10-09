# Architecture

Browser → Nginx frontend → FastAPI backend → PostgreSQL.

Compose service DNS names (`backend` and `db`) provide discovery; container IPs can change.

Production evolution: AWS VPC, private EKS nodes, public Application Load Balancer, ECR, Terraform, Jenkins, Helm, Argo CD, Prometheus, Grafana, Loki and Alertmanager.

Terraform owns infrastructure lifecycle. Helm packages Kubernetes resources. Argo CD reconciles Git-defined desired state. Kubernetes runs workloads.
