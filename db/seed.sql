-- Du lieu mau (GIA) de chay demo. Khong chua du lieu benh nhan that.
-- Tai khoan mau, mat khau chung: Doctor@123
--   Bac si : doctor@clinic.local
--   Benh nhan: patient@clinic.local
INSERT IGNORE INTO users (full_name, email, phone, password, role, status, created_at, updated_at) VALUES
('BS. Nguyen Van A', 'doctor@clinic.local',  '0900000001', '$2a$10$6Is7zIA1FKVChB23rQrfveynZ0gFVm7tOVGJeu5psxLIIOyco7ku6', 'DOCTOR',  'ACTIVE', NOW(), NOW()),
('Tran Thi B',       'patient@clinic.local', '0900000002', '$2a$10$6Is7zIA1FKVChB23rQrfveynZ0gFVm7tOVGJeu5psxLIIOyco7ku6', 'PATIENT', 'ACTIVE', NOW(), NOW());

INSERT IGNORE INTO time_slots (shift, start_time, end_time) VALUES
('MORNING',   '08:00:00', '09:00:00'),
('MORNING',   '09:00:00', '10:00:00'),
('MORNING',   '10:00:00', '11:00:00'),
('AFTERNOON', '13:30:00', '14:30:00'),
('AFTERNOON', '14:30:00', '15:30:00'),
('AFTERNOON', '15:30:00', '16:30:00'),
('EVENING',   '18:00:00', '19:00:00'),
('EVENING',   '19:00:00', '20:00:00');
