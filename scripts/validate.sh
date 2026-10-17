#!/usr/bin/env bash
set -Eeuo pipefail
cd "$(dirname "$0")/.."
echo "== App lint and tests =="
(cd app && npm install && npm run lint && npm test)
echo "== Terraform format =="
terraform fmt -check -recursive terraform
echo "== Helm lint =="
helm lint k8s/helm/travel-booking
echo "== Checkov =="
checkov -d terraform
echo "== Trivy filesystem =="
trivy fs --scanners vuln,misconfig,secret .
