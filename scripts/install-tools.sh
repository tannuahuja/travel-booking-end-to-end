#!/usr/bin/env bash
set -Eeuo pipefail

# Ubuntu 22.04/24.04 helper. Installs CLI tooling only by default.
# Heavy services (Jenkins, SonarQube, Prometheus, Grafana) are run as containers.
# This script does not provision AWS resources or run terraform apply.

MODE="${1:---cli}"
if [[ "$MODE" != "--cli" && "$MODE" != "--with-minikube" ]]; then
  echo "Usage: $0 [--cli|--with-minikube]"
  exit 2
fi

if [[ "${EUID}" -eq 0 ]]; then
  SUDO=""
else
  SUDO="sudo"
fi

echo "[1/8] Install base packages"
$SUDO apt-get update
$SUDO apt-get install -y ca-certificates curl gnupg lsb-release unzip jq git make python3 python3-pip python3-venv pipx

echo "[2/8] Install Docker Engine and Compose plugin (official Docker repository)"
$SUDO install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | $SUDO gpg --dearmor --yes -o /etc/apt/keyrings/docker.gpg
$SUDO chmod a+r /etc/apt/keyrings/docker.gpg
ARCH="$(dpkg --print-architecture)"
CODENAME="$(. /etc/os-release && echo "$VERSION_CODENAME")"
echo "deb [arch=${ARCH} signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu ${CODENAME} stable" | $SUDO tee /etc/apt/sources.list.d/docker.list >/dev/null
$SUDO apt-get update
$SUDO apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
$SUDO systemctl enable --now docker || true
if id -nG "$USER" | grep -qw docker; then :; else $SUDO usermod -aG docker "$USER"; fi

echo "[3/8] Install AWS CLI v2"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "$TMP/awscliv2.zip"
unzip -q "$TMP/awscliv2.zip" -d "$TMP"
$SUDO "$TMP/aws/install" --update

echo "[4/8] Install Terraform from HashiCorp apt repository"
curl -fsSL https://apt.releases.hashicorp.com/gpg | $SUDO gpg --dearmor --yes -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com ${CODENAME} main" | $SUDO tee /etc/apt/sources.list.d/hashicorp.list >/dev/null
$SUDO apt-get update
$SUDO apt-get install -y terraform

echo "[5/8] Install kubectl"
curl -fsSLo "$TMP/kubectl" "https://dl.k8s.io/release/$(curl -fsSL https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
$SUDO install -o root -g root -m 0755 "$TMP/kubectl" /usr/local/bin/kubectl

echo "[6/8] Install Helm"
curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | $SUDO bash

echo "[7/8] Install Trivy and Checkov"
curl -fsSL https://aquasecurity.github.io/trivy-repo/deb/public.key | $SUDO gpg --dearmor --yes -o /usr/share/keyrings/trivy.gpg
echo "deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/deb generic main" | $SUDO tee /etc/apt/sources.list.d/trivy.list >/dev/null
$SUDO apt-get update
$SUDO apt-get install -y trivy
pipx install --force checkov

echo "[8/8] Optional Minikube"
if [[ "$MODE" == "--with-minikube" ]]; then
  curl -fsSLo "$TMP/minikube" https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
  $SUDO install "$TMP/minikube" /usr/local/bin/minikube
fi

echo
echo "Tool bootstrap complete."
echo "IMPORTANT: log out/in (or run 'newgrp docker') for Docker group membership."
echo "Verify with: docker --version; docker compose version; aws --version; terraform version; kubectl version --client; helm version; trivy --version; pipx run checkov --version"
echo "Not installed by this script: Jenkins, SonarQube, Prometheus, Grafana, Argo CD, Node.js."
echo "Run heavy services with Docker Compose; install Node.js 22 separately if needed."
