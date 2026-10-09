# Kubernetes — primary learning focus

Use KodeKloud labs and map each lab to this project.

1. Architecture: API server, etcd, scheduler, controller manager, kubelet, runtime.
2. Declarative state: YAML, objects, labels, selectors and namespaces.
3. Workloads: Pods, ReplicaSets, Deployments, StatefulSets, Jobs and CronJobs.
4. Scheduling: requests, limits, QoS, taints, tolerations, affinity and topology spread.
5. Networking: Pod IPs, Services, EndpointSlices, DNS, Ingress, CNI and NetworkPolicy.
6. Config and security: ConfigMaps, Secrets, ServiceAccounts, RBAC and security contexts.
7. Storage: PV, PVC, StorageClass, CSI, StatefulSet identity and recovery.
8. Reliability: startup/readiness/liveness probes, rollout, PDB and graceful shutdown.
9. Scaling: HPA, metrics API and node capacity.
10. Operations: events, logs, describe, exec, metrics and runbooks.

```bash
kubectl get pods -A
kubectl get events -A --sort-by=.lastTimestamp
kubectl describe pod <pod> -n <namespace>
kubectl logs <pod> -n <namespace> --previous
kubectl get deploy,rs,svc,endpointslices -n <namespace>
kubectl get pvc,pv,storageclass
```

Always identify namespace and resource first. Collect evidence before changing anything.
