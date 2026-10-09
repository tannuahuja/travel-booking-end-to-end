# Failure drills

- CrashLoopBackOff: exit code, previous logs, config, startup command and probes.
- OOMKilled: memory use, requests/limits and node pressure.
- Pending Pod: scheduler events, capacity, taints, affinity and PVC.
- ImagePullBackOff: image reference, registry permissions and network.
- Networking: selectors, EndpointSlices, DNS, ports and policies.
- Terraform: provider errors, dependencies, state lock and drift.
- Jenkins: agent, credentials, stage logs, quality gate and artifacts.
- Helm: revisions, values and rollback limitations.
- Argo CD: repository access, diff, health, sync errors and drift.

For each: symptom → evidence → hypothesis → root cause → fix → verification → runbook.
