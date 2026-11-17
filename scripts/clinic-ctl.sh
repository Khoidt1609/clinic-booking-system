#!/usr/bin/env bash
# clinic-ctl.sh - quan ly ung dung clinic-booking-system tren MicroK8s
set -euo pipefail

NS="${NS:-clinic}"
REGISTRY="${REGISTRY:-localhost:32000}"
KUBECTL="${KUBECTL:-microk8s kubectl}"
LOG_FILE="${LOG_FILE:-$HOME/clinic-ctl.log}"
BACKUP_DIR="${BACKUP_DIR:-$HOME/clinic-backups}"

k()   { $KUBECTL "$@"; }
log() { echo "[$(date '+%F %T')] $*" | tee -a "$LOG_FILE"; }
die() { echo "LOI: $*" >&2; exit 1; }

check_app() {
  case "${1:-}" in
    frontend|backend|mysql) ;;
    *) die "ten ung dung phai la: frontend, backend hoac mysql" ;;
  esac
}
check_deployable() {
  case "${1:-}" in
    frontend|backend) ;;
    *) die "chi frontend hoac backend co image tu build" ;;
  esac
}

usage() {
  cat <<USAGE
Cach dung: $0 <lenh> [tham so]
  status                         Xem node, pod, service, ingress, pvc
  scale <app> <so_replica>       Doi so replica (frontend|backend|mysql)
  image <app> <tag>              Cap nhat image (frontend|backend); tu rollback neu loi
  rollback <app>                 Quay lai phien ban truoc
  limits <app> <memory> <cpu>    Doi gioi han tai nguyen, vi du: limits backend 768Mi 500m
  config show                    Xem cau hinh ConfigMap cua backend
  config set <KEY> <VALUE>       Sua tham so ConfigMap backend roi restart backend
  backup                         Sao luu database ra file .sql
Bien moi truong tuy chon: NS, REGISTRY, KUBECTL, LOG_FILE, BACKUP_DIR
USAGE
}

cmd_status() {
  k get nodes -o wide
  k get pods,svc,ingress,pvc -n "$NS" -o wide
}

cmd_scale() {
  check_app "${1:-}"
  [[ "${2:-}" =~ ^[0-9]+$ ]] || die "so replica phai la so nguyen khong am"
  log "scale $1 -> $2 replica"
  k scale deployment/"$1" -n "$NS" --replicas="$2"
  k rollout status deployment/"$1" -n "$NS" --timeout=180s
}

cmd_image() {
  check_deployable "${1:-}"
  [[ "${2:-}" =~ ^[A-Za-z0-9._-]+$ ]] || die "tag khong hop le"
  local app="$1" tag="$2"
  log "cap nhat $app len $REGISTRY/clinic-$app:$tag"
  k annotate deployment/"$app" -n "$NS" kubernetes.io/change-cause="clinic-ctl: image $tag" --overwrite
  k set image deployment/"$app" "$app=$REGISTRY/clinic-$app:$tag" -n "$NS"
  if k rollout status deployment/"$app" -n "$NS" --timeout=120s; then
    log "cap nhat $app thanh cong"
  else
    log "cap nhat $app THAT BAI, tu dong rollback"
    k rollout undo deployment/"$app" -n "$NS"
    k rollout status deployment/"$app" -n "$NS" --timeout=120s
    exit 1
  fi
}

cmd_rollback() {
  check_deployable "${1:-}"
  log "rollback $1"
  k rollout undo deployment/"$1" -n "$NS"
  k rollout status deployment/"$1" -n "$NS" --timeout=120s
}

cmd_limits() {
  check_app "${1:-}"
  [[ "${2:-}" =~ ^[0-9]+(Mi|Gi)$ ]] || die "memory phai co dang 512Mi hoac 1Gi"
  [[ "${3:-}" =~ ^[0-9]+m?$ ]] || die "cpu phai co dang 500m hoac 1"
  log "doi gioi han $1: memory=$2 cpu=$3"
  k set resources deployment/"$1" -n "$NS" --limits="memory=$2,cpu=$3"
  k rollout status deployment/"$1" -n "$NS" --timeout=180s
}

cmd_config() {
  case "${1:-}" in
    show)
      k get configmap backend-config -n "$NS" -o jsonpath='{.data}'; echo ;;
    set)
      [[ "${2:-}" =~ ^[A-Z0-9_]+$ ]] || die "KEY phai viet hoa, vi du SPRING_DATASOURCE_USERNAME"
      [[ -n "${3:-}" ]] || die "thieu VALUE"
      [[ "$3" != *\"* && "$3" != *\\* ]] || die "VALUE khong duoc chua dau \" hoac \\"
      log "sua backend-config: $2 (restart backend)"
      k patch configmap backend-config -n "$NS" --type merge -p "{\"data\":{\"$2\":\"$3\"}}"
      k rollout restart deployment/backend -n "$NS"
      k rollout status deployment/backend -n "$NS" --timeout=180s ;;
    *) die "dung: config show | config set <KEY> <VALUE>" ;;
  esac
}

cmd_backup() {
  mkdir -p "$BACKUP_DIR"
  local out="$BACKUP_DIR/clinic_$(date +%Y%m%d_%H%M%S).sql"
  log "sao luu database -> $out"
  k exec -n "$NS" deploy/mysql -- sh -c \
    'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --single-transaction clinic_booking_db' > "$out" 2>/dev/null
  [[ -s "$out" ]] || { rm -f "$out"; die "file sao luu rong, kiem tra pod mysql"; }
  chmod 600 "$out"
  log "xong: $(wc -c < "$out") bytes (file chua du lieu that, khong commit len git)"
}

main() {
  local cmd="${1:-}"; shift || true
  case "$cmd" in
    status)   cmd_status ;;
    scale)    cmd_scale "$@" ;;
    image)    cmd_image "$@" ;;
    rollback) cmd_rollback "$@" ;;
    limits)   cmd_limits "$@" ;;
    config)   cmd_config "$@" ;;
    backup)   cmd_backup ;;
    ""|-h|--help|help) usage ;;
    *) usage; die "lenh khong hop le: $cmd" ;;
  esac
}
main "$@"
