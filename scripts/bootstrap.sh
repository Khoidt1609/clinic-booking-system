#!/usr/bin/env bash
# bootstrap.sh - dung lai toan bo he thong clinic tren 1 may Ubuntu da cai Docker + MicroK8s
# Cach dung (tai thu muc goc cua repo):  ./scripts/bootstrap.sh [--seed]
#   --seed : nap du lieu mau db/seed.sql (khi DB trong)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
NS=clinic
REGISTRY="${REGISTRY:-localhost:32000}"
VERSION="${VERSION:-1.0}"
KUBECTL="${KUBECTL:-microk8s kubectl}"
SEED=0
[[ "${1:-}" == "--seed" ]] && SEED=1

k()   { $KUBECTL "$@"; }
step(){ echo; echo "==> $*"; }
die() { echo "LOI: $*" >&2; exit 1; }

step "1/7 Kiem tra cong cu"
command -v docker   >/dev/null || die "chua cai docker (sudo apt install -y docker.io)"
command -v microk8s >/dev/null || die "chua cai microk8s (sudo snap install microk8s --classic)"
command -v openssl  >/dev/null || die "chua co openssl"
docker info >/dev/null 2>&1 || die "khong dung duoc docker, thu: sudo usermod -aG docker \$USER && newgrp docker"
microk8s status --wait-ready >/dev/null || die "microk8s chua san sang"
if [[ -n "$(docker ps -q --filter publish=80)" ]]; then
  die "co container Docker dang dung cong 80, hay dung no (Ingress can cong 80)"
fi

step "2/7 Bat addon MicroK8s"
microk8s enable dns hostpath-storage registry ingress
microk8s status --wait-ready >/dev/null

step "3/7 Build va day image len registry $REGISTRY (tag $VERSION)"
for app in backend frontend; do
  docker build -t "$REGISTRY/clinic-$app:$VERSION" "./$app"
  docker push "$REGISTRY/clinic-$app:$VERSION"
done

step "4/7 Namespace va Secret"
k apply -f k8s/00-namespace.yaml
if k get secret clinic-secret -n "$NS" >/dev/null 2>&1; then
  echo "Secret clinic-secret da ton tai, giu nguyen."
else
  DBPASS="${MYSQL_ROOT_PASSWORD:-$(openssl rand -hex 12)}"
  k create secret generic clinic-secret -n "$NS" \
    --from-literal=MYSQL_ROOT_PASSWORD="$DBPASS" \
    --from-literal=JWT_SECRET="$(openssl rand -hex 32)"
  echo "Da tao Secret moi (mat khau DB ngau nhien, khong in ra man hinh)."
fi

step "5/7 Trien khai MySQL, backend, frontend, ingress"
k apply -f k8s/10-mysql.yaml
k rollout status deployment/mysql -n "$NS" --timeout=300s
k apply -f k8s/20-backend.yaml
k apply -f k8s/30-frontend.yaml
k apply -f k8s/40-ingress.yaml
k rollout status deployment/backend  -n "$NS" --timeout=300s
k rollout status deployment/frontend -n "$NS" --timeout=180s

step "6/7 Du lieu mau"
if [[ $SEED -eq 1 ]]; then
  for i in $(seq 1 30); do
    if k exec -n "$NS" deploy/mysql -- sh -c \
      'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -N -e "SELECT 1 FROM clinic_booking_db.time_slots LIMIT 1" ' >/dev/null 2>&1; then
      break
    fi
    sleep 5
  done
  k exec -i -n "$NS" deploy/mysql -- sh -c \
    'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" --default-character-set=utf8mb4 clinic_booking_db' < db/seed.sql
  echo "Da nap db/seed.sql"
else
  echo "Bo qua (chay lai voi --seed de nap du lieu mau)."
fi

step "7/7 Kiem tra"
k get pods,svc,ingress,pvc -n "$NS"
echo
echo "Xong. Mo trinh duyet: http://localhost  (hoac http://<IP-cua-VM>)"
