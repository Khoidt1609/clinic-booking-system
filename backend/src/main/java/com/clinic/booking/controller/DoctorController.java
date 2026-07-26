package com.clinic.booking.controller;

import com.clinic.booking.enums.Role;
import com.clinic.booking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final UserRepository userRepository;

    // Lấy danh sách tất cả bác sĩ 
    @GetMapping
    public ResponseEntity<?> getAllDoctors() {
        List<Map<String, Object>> doctors = userRepository.findByRole(Role.DOCTOR)
                .stream()
                .map(doc -> Map.<String, Object>of(
                        "id", doc.getId(),
                        "fullName", doc.getFullName(),
                        "phone", doc.getPhone()
                ))
                .toList();

        return ResponseEntity.ok(doctors);
    }

    // lấy Bác sĩ mặc định
    @GetMapping("/default")
    public ResponseEntity<?> getDefaultDoctor() {
        var doctor = userRepository.findFirstByRole(Role.DOCTOR)
                .orElseThrow(() -> new RuntimeException("Hệ thống chưa có tài khoản Bác sĩ nào!"));

        return ResponseEntity.ok(Map.of(
                "id", doctor.getId(),
                "fullName", doctor.getFullName()
        ));
    }
}