# balancer deployment manifests

Consumed by the Code for Philly cluster repos
([cfp-live-cluster](https://github.com/CodeForPhilly/cfp-live-cluster),
[cfp-sandbox-cluster](https://github.com/CodeForPhilly/cfp-sandbox-cluster)), which project
`base/` into their GitOps trees. Also usable directly against a local `kind` cluster
(`deploy/kind-config.yaml`).

## Who owns what

Routing is split along a single line: **this repo declares what the app serves; the
cluster declares where it's reachable.**

| This repo owns | The cluster owns |
| --- | --- |
| `HTTPRoute` — paths, backend Services, ports | `Gateway` — listeners, hostnames, TLS |
| Deployment, Service, app config | Certificates, ClusterIssuers, `GatewayClass` |

Paths and ports are facts about the application: they change when the app changes, and
they belong in the same commit as that change. Hostnames, TLS, and issuers are facts
about the cluster: they differ between live and sandbox, they're negotiated across every
app sharing the ingress, and they change when the *cluster* changes.

## The contract

**The cluster provides a `Gateway` named after the app, in the app's namespace.** That
sentence is the whole interface.

`base/httproute.yaml` attaches to it by name and declares no hostnames:

```yaml
spec:
  parentRefs:
    - name: balancer     # the Gateway the cluster provides
  # no hostnames — inherited from the Gateway's listeners
```

A route that omits `hostnames` inherits them from the listeners it attaches to. So the
same file serves `balancerproject.org` in live and `balancer.sandbox.k8s.phl.io` in
sandbox, with no patching and no placeholders.

## What must NOT live in this repo

Anything that names a cluster implementation detail:

- **`Gateway` or `ListenerSet` resources.** Cluster-owned.
- **`cert-manager.io/cluster-issuer` annotations**, or any ClusterIssuer name.
- **TLS `certificateRefs` / cert Secret names.**
- **`gatewayClassName`**, or the name/namespace of any shared Gateway.
- **An HTTP→HTTPS redirect.** The cluster already redirects every hostname reaching it
  on port 80. An app-level redirect is redundant, and a route claiming an exact hostname
  on the shared HTTP listener can shadow cert-manager's ACME solver route.

None of these are knowable from this repo, and getting one wrong fails in ways that are
hard to see. A `ListenerSet`, for instance, applies cleanly to the API server and is then
silently ignored by Envoy Gateway v1.7.3 — the app simply has no listener, with nothing
in any log to say why.

If you need something from the cluster that isn't here, open an issue on the cluster repo
rather than guessing at its internals.
