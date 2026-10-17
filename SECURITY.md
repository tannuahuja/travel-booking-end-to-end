# Security notes for this learning lab

- Never commit credentials, PEM files, `.env`, Terraform state, or plan files.
- Do not expose PostgreSQL 5432 or Prometheus 9090 to the internet.
- Bind local dashboards to loopback and use SSH port forwarding or a VPN.
- Rotate all sample passwords before use beyond an isolated local lab.
- Use IAM roles / OIDC and short-lived credentials instead of static AWS keys.
- Use immutable image tags/digests and promote the same artifact between environments.
- Review Trivy/Checkov findings rather than blindly suppressing them.
- The Helm chart's inline password is intentionally marked demo-only. Production should use Secrets Manager plus External Secrets / CSI and encryption at rest.
- Production should use managed PostgreSQL (e.g., RDS), backups, private subnets, TLS, WAF as needed, and proper recovery/monitoring.
- Pin GitHub Actions by full commit SHA in hardened production pipelines.
- The included Jenkinsfile assumes tools and plugins are available on the Jenkins agent; tailor it to your agent image and credentials.
