package com.clinic.booking.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.clinic.booking.entity.Appointment;
import com.clinic.booking.enums.AppointmentStatus;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    // Lấy thông tin 1 lịch hẹn cụ thể
    @EntityGraph(attributePaths = {"patient", "doctor", "timeSlot"})
    Optional<Appointment> findById(Long id);

    // Check trung lich
    boolean existsByDoctorIdAndTimeSlotIdAndAppointmentDateAndStatusNot(
        Long doctorId, Long slotId, LocalDate date, AppointmentStatus status
    );

    // Lay danh sach ca kham hom nay (Join patient + timeSlot)
    @EntityGraph(attributePaths = {"patient", "timeSlot"})
    List<Appointment> findByDoctorIdAndAppointmentDateOrderByTimeSlot_StartTimeAsc(
        Long doctorId, LocalDate date);

    // Lay lich su book lich kham cua patient theo thu tu giam dan
    @EntityGraph(attributePaths = {"timeSlot", "doctor"})
    List<Appointment> findByPatientIdOrderByAppointmentDateDesc(Long patientId);

    // Lay id cua slot da book trong ngay hom do
    @Query("SELECT a.timeSlot.id FROM Appointment a WHERE a.doctor.id = :doctorId AND a.appointmentDate = :date AND a.status <> 'CANCELLED'")
    List<Long> findBookedSlotIdsByDate(@Param("doctorId") Long doctorId, @Param("date") LocalDate date);

    // Lich kham theo thu tu giam dan
}