# Triển khai Clinic Booking System trên MicroK8s

Tài liệu cho các thành viên nhóm (đồ án Linux OSS 2026, đề tài MicroK8s). Làm theo file này để dựng lại đúng hệ thống trên máy của mình.

## 1. Hệ thống gồm gì

```
Trình duyệt ──► Ingress (cổng 80) ──► frontend (nginx, 2 pod)
                                         │  /api/*
                                         ▼
                                     backend (Spring Boot, Java 21)
                                         │
                                         ▼
                                     mysql (1 pod + PVC)
```

| Thành phần | File | Ghi chú |
|---|---|---|
| Namespace `clinic` | `k8s/00-namespace.yaml` | gom mọi tài nguyên |
| MySQL + PVC + Service `mysql` | `k8s/10-mysql.yaml` | dữ liệu lưu trên PVC (`microk8s-hostpath`) |
| Backend + ConfigMap + Service `backend` | `k8s/20-backend.yaml` | tên Service phải là `backend` (nginx.conf gọi `http://backend:8080`) |
| Frontend + Service `frontend` | `k8s/30-frontend.yaml` | nginx, chiến lược RollingUpdate |
| Ingress | `k8s/40-ingress.yaml` | IngressClass `public` |
| Secret `clinic-secret` | **không nằm trong git** | tạo bằng script/lệnh, chứa mật khẩu DB và JWT secret |

Dockerfile: `backend/Dockerfile`, `frontend/Dockerfile`, cấu hình nginx: `frontend/nginx.conf`. Frontend gọi API theo đường dẫn tương đối `/api/` (xem `frontend/assets/js/api.js`).

## 2. Yêu cầu máy

- VM hoặc máy Ubuntu 24.04, tối thiểu **2 CPU, 4 GB RAM**, 20 GB đĩa.
- Cài Docker và MicroK8s:
  ```bash
  sudo apt update && sudo apt install -y docker.io openssl
  sudo usermod -aG docker $USER
  sudo snap install microk8s --classic
  sudo usermod -aG microk8s $USER
  newgrp docker   # hoặc đăng xuất rồi đăng nhập lại
  ```
- Cổng 80 trên máy phải trống (Ingress của MicroK8s dùng cổng này).

## 3. Chạy nhanh (khuyến nghị)

```bash
git clone https://github.com/Khoidt1609/clinic-booking-system.git
cd clinic-booking-system
./scripts/bootstrap.sh --seed
```
Script tự làm: bật addon, build và đẩy image, tạo Secret, áp dụng toàn bộ `k8s/`, nạp dữ liệu mẫu. Lần build backend đầu mất vài phút. Xong thì mở `http://localhost`.

Tài khoản mẫu (mật khẩu chung `Doctor@123`): bác sĩ `doctor@clinic.local`, bệnh nhân `patient@clinic.local`. Đây là dữ liệu **giả** trong `db/seed.sql`. Dữ liệu thật của nhóm không đưa lên git.

## 4. Chạy thủ công từng bước (để hiểu)

1. Bật addon: `microk8s enable dns hostpath-storage registry ingress`
2. Build và đẩy image:
   ```bash
   docker build -t localhost:32000/clinic-backend:1.0 ./backend
   docker build -t localhost:32000/clinic-frontend:1.0 ./frontend
   docker push localhost:32000/clinic-backend:1.0
   docker push localhost:32000/clinic-frontend:1.0
   ```
3. Namespace và Secret:
   ```bash
   microk8s kubectl apply -f k8s/00-namespace.yaml
   microk8s kubectl create secret generic clinic-secret -n clinic \
     --from-literal=MYSQL_ROOT_PASSWORD='<mật khẩu>' \
     --from-literal=JWT_SECRET="$(openssl rand -hex 32)"
   ```
4. `microk8s kubectl apply -f k8s/10-mysql.yaml` (chờ pod Running), rồi `20-backend.yaml`, `30-frontend.yaml`, `40-ingress.yaml`.
5. Nạp dữ liệu mẫu:
   ```bash
   microk8s kubectl exec -i -n clinic deploy/mysql -- sh -c \
     'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" clinic_booking_db' < db/seed.sql
   ```
6. Kiểm tra: `microk8s kubectl get pods,svc,ingress,pvc -n clinic`

Mẹo: thêm `alias kubectl='microk8s kubectl'` vào `~/.bashrc` cho ngắn.

## 5. Các kịch bản demo

Quản lý cụm bằng `./scripts/clinic-ctl.sh <lệnh>` (xem `./scripts/clinic-ctl.sh help`).

| # | Kịch bản | Lệnh |
|---|---|---|
| 1 | Xem trạng thái | `./scripts/clinic-ctl.sh status` |
| 2 | Dữ liệu không mất khi pod chết | `kubectl delete pod -n clinic -l app=mysql` rồi đăng nhập lại |
| 3 | Tự phục hồi | `kubectl delete pod -n clinic -l app=backend` |
| 4 | Scale | `./scripts/clinic-ctl.sh scale backend 2` |
| 5 | Rolling update | build `clinic-frontend:1.1`, đẩy lên registry, `./scripts/clinic-ctl.sh image frontend 1.1` |
| 6 | Cập nhật lỗi + rollback | `./scripts/clinic-ctl.sh image frontend 9.9` (tag không tồn tại, script tự rollback) |
| 7 | Đổi tham số, giới hạn tài nguyên, sao lưu | `clinic-ctl.sh config set ...`, `limits ...`, `backup` |

Đưa hệ thống về trạng thái chuẩn sau demo: `kubectl apply -f k8s/`.

## 6. Lỗi thường gặp

| Triệu chứng | Cách xử lý |
|---|---|
| Pod `ImagePullBackOff` | Image chưa đẩy lên registry hoặc sai tag: `curl http://localhost:32000/v2/_catalog` |
| Backend `CrashLoopBackOff` | `kubectl logs -n clinic deploy/backend --tail=50` (thường do MySQL chưa sẵn sàng hoặc sai mật khẩu) |
| `curl http://localhost` không được | Kiểm tra `kubectl get ingress -n clinic` và cổng 80 có đang bị Docker chiếm không (`docker ps`) |
| Backend 403 khi gọi API | Bình thường nếu chưa đăng nhập |
| Hết RAM, máy chậm | `kubectl scale deployment/backend -n clinic --replicas=1`, tắt bớt ứng dụng khác |

## 7. Làm việc nhóm với Git

- Mỗi người `git pull` trước khi làm, làm trên nhánh riêng nếu sửa lớn.
- **Không commit:** file `.sql` chứa dữ liệu thật, Secret, mật khẩu. Kiểm tra bằng `git status` trước mỗi lần `git add`. Đừng dùng `git add .` bừa bãi.
- `.gitignore` có quy tắc `/booking/`; nếu file mới trong `backend/src/main/java/com/clinic/booking/` không hiện trong `git status` thì kiểm tra lại quy tắc này.
- Đổi code backend hoặc frontend thì build lại image với tag mới, đẩy lên registry rồi cập nhật bằng `clinic-ctl.sh image`.

## 8. Việc còn lại của nhóm

Điền tên người phụ trách:
- [ ] Hoàn tất demo rolling update/rollback và chụp ảnh: ____
- [ ] Sao lưu tự động (CronJob) và thử khôi phục: ____
- [ ] Giới hạn tài nguyên, metrics-server, HPA: ____
- [ ] Hỏi giảng viên yêu cầu cụ thể cho script shell: ____
- [ ] Báo cáo tiếng Anh: ____
- [ ] Slide tiếng Anh: ____
