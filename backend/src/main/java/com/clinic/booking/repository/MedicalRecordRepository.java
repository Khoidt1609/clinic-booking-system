package com.clinic.booking.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.clinic.booking.entity.MedicalRecord;

import java.util.List;
import java.util.Optional;

public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    // Tìm bệnh án dựa vào ID của Lịch hẹn
    @EntityGraph(attributePaths = {"appointment", "appointment.patient", "appointment.doctor", "prescriptionItems"})
    Optional<MedicalRecord> findByAppointmentId(Long appointmentId);

    @EntityGraph(attributePaths = {"appointment", "appointment.patient", "appointment.doctor", "prescriptionItems"})
    Optional<MedicalRecord> findById(Long id);

    // Lịch sử bệnh án cảu bệnh nhân
    @EntityGraph(attributePaths = {"appointment", "appointment.patient", "appointment.doctor", "prescriptionItems"})
    List<MedicalRecord> findByAppointment_Patient_IdOrderByCreatedAtDesc(Long patientId);

    // Kiểm tra tồn tại xem lịch có bệnh án chưa
    boolean existsByAppointmentId(Long appointmentId);
}
