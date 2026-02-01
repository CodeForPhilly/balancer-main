#!/usr/bin/env bash
# Run balancer in a local kind cluster and verify API with curl.
# Run from the app repo root (parent of deploy/).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
KIND_CLUSTER_NAME="${KIND_CLUSTER_NAME:-devbox}"
KIND_CONFIG="$SCRIPT_DIR/kind-config.yaml"
KIND_OVERLAY="$APP_ROOT/deploy/manifests/balancer/overlays/kind"
IMAGE="${IMAGE:-ghcr.io/codeforphilly/balancer-main/app:latest}"
HTTP_PORT=31880
CURL_URL="http://localhost:${HTTP_PORT}/api/v1/api/get_full_list_med"
CURL_HOST="Host: localhost"

cd "$APP_ROOT"

echo "==> Creating kind cluster (name=$KIND_CLUSTER_NAME)..."
kind create cluster --name "$KIND_CLUSTER_NAME" --wait 60s --config "$KIND_CONFIG" 2>/dev/null || true
kind get kubeconfig --name "$KIND_CLUSTER_NAME" > /dev/null
# Use kind cluster context so helm/kubectl don't talk to another cluster (e.g. GKE)
export KUBECONFIG="$(kind get kubeconfig --name "$KIND_CLUSTER_NAME")"
kubectl config use-context "kind-$KIND_CLUSTER_NAME"

echo "==> Installing ingress-nginx..."
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx 2>/dev/null || true
helm repo update ingress-nginx 2>/dev/null || true
helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx --create-namespace \
  --set controller.service.nodePorts.http="$HTTP_PORT" \
  --set controller.service.nodePorts.https=30219 \
  --wait --timeout 120s 2>/dev/null || true
kubectl wait --namespace ingress-nginx --for=condition=Available deployment/ingress-nginx-controller --timeout=120s

echo "==> Building and loading app image..."
docker build -f Dockerfile.prod -t "$IMAGE" .
kind load docker-image "$IMAGE" --name "$KIND_CLUSTER_NAME"

echo "==> Deploying balancer (kind overlay)..."
kubectl create namespace balancer 2>/dev/null || true
kubectl apply -k "$KIND_OVERLAY"

echo "==> Waiting for balancer deployment..."
kubectl wait --namespace balancer --for=condition=available deployment/balancer --timeout=120s

echo "==> Verifying API with curl..."
sleep 5
HTTP_CODE="$(curl -sS -o /dev/null -w "%{http_code}" "$CURL_URL" -H "$CURL_HOST" 2>/dev/null || echo "000")"
if [[ "$HTTP_CODE" == "000" ]]; then
  echo "ERROR: curl failed (connection refused or unreachable)"
  exit 1
fi
if [[ "$HTTP_CODE" =~ ^5 ]]; then
  echo "ERROR: API returned $HTTP_CODE"
  curl -sS "$CURL_URL" -H "$CURL_HOST" || true
  exit 1
fi
echo "API returned HTTP $HTTP_CODE (expected 200 or 401)"
curl -sS "$CURL_URL" -H "$CURL_HOST" | head -c 200
echo ""
echo "==> Kind test passed."
