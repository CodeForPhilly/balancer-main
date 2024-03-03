This chart was initially created by Kompose

To seal secrets:
---

  `> export SEALED_SECRETS_CERT=https://sealed-secrets.sandbox.k8s.phl.io/v1/cert.pem`

  `> kubeseal -f my-secret.yaml -o yaml -w my-sealed-secret.yaml`


Relevant file locations on GitHub:
---
- Release values specific to the cfp-sandbox-cluster: https://github.com/CodeForPhilly/cfp-sandbox-cluster/blob/main/balancer/release-values.yaml
- Sealed secrets: https://github.com/CodeForPhilly/cfp-sandbox-cluster/blob/main/balancer.secrets/
- This helm chart: https://github.com/CodeForPhilly/balancer-main/tree/develop/helm-chart