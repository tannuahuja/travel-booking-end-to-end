# Argo CD and GitOps notes

CI builds and publishes an image; a GitOps change updates the desired image reference; Argo CD reconciles it; Kubernetes runs Pods. A successful sync does not guarantee application health.
