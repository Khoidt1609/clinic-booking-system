package com.clinic.booking.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;


import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.clinic.booking.dto.AppointmentRequest;
import com.clinic.booking.dto.AppointmentResponse;
import com.clinic.booking.entity.Appointment;
import com.clinic.booking.entity.TimeSlot;
import com.clinic.booking.entity.User;
import com.clinic.booking.enums.AppointmentStatus;
import com.clinic.booking.enums.Role;
import com.clinic.booking.exception.SlotAlreadyBookedException;
import com.clinic.booking.helpers.SecurityUtils;
import com.clinic.booking.repository.AppointmentRepository;
import com.clinic.booking.repository.TimeSlotRepository;
import com.clinic.booking.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AppointmentService {
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final TimeSlotRepository timeSlotRepository;


    @Transactional
    public AppointmentResponse createAppointment(AppointmentRequest request) {

        User patient = userRepository.findByEmail(SecurityUtils.getCurrentUserEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bệnh nhân"));

        User doctor = userRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Chưa có tài khoản bác sĩ trong hệ thống"));

        TimeSlot slot = timeSlotRepository.findById(request.getSlotId())
                .orElseThrow(() -> new RuntimeException("Khung giờ không tồn tại"));

        boolean alreadyBooked = appointmentRepository.existsByDoctorIdAndTimeSlotIdAndAppointmentDateAndStatusNot(
                doctor.getId(), slot.getId(), request.getAppointmentDate(), AppointmentStatus.CANCELLED);
        if(alreadyBooked) {
            throw new SlotAlreadyBookedException("Khung giờ này đã có người đặt, vui lòng chọn giờ khác");
        }
        

        Appointment appointment = Appointment.builder()
                                            .patient(patient)
                                            .doctor(doctor)
                                            .timeSlot(slot)
                                            .appointmentDate(request.getAppointmentDate())
                                            .patientSymptoms(request.getPatientSymptoms())
                                            .status(AppointmentStatus.CONFIRMED)
                                            .build();

        appointmentRepository.save(appointment);

        return AppointmentResponse.builder()
                .appointmentId(appointment.getId())
                .doctorName(doctor.getFullName())
                .patientName(patient.getFullName())
                .timeSlot(slot.getStartTime() + " - " + slot.getEndTime())
                .appointmentDate(appointment.getAppointmentDate().toString())
                .symptoms(appointment.getPatientSymptoms())
                .status(appointment.getStatus().toString())
                .message("Đặt lịch khám thành công!")
                .build();

    }

    public AppointmentResponse getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hẹn"));

        // Chỉ bác sĩ phụ trách hoặc chính bệnh nhân đó mới được xem
        String currentEmail = SecurityUtils.getCurrentUserEmail();
        boolean isDoctor = appointment.getDoctor().getEmail().equals(currentEmail);
        boolean isPatient = appointment.getPatient().getEmail().equals(currentEmail);
        if (!isDoctor && !isPatient) {
            throw new RuntimeException("Bạn không có quyền xem lịch hẹn này");
        }

        return AppointmentResponse.builder()
                                        .appointmentId(appointment.getId())
                                        .patientId(appointment.getPatient().getId())
                                        .patientName(appointment.getPatient().getFullName())
                                        .patientPhone(appointment.getPatient().getPhone())
                                        .timeSlot(appointment.getTimeSlot().getStartTime() + " - " + appointment.getTimeSlot().getEndTime())
                                        .appointmentDate(appointment.getAppointmentDate().toString())
                                        .symptoms(appointment.getPatientSymptoms())
                                        .status(appointment.getStatus().toString())
                                        .build();
    }

    // Lấy lịch sử khám của bệnh nhân
    public List<AppointmentResponse> getPatientAppointments(Long patientId) {
        User patient = userRepository.findByEmail(SecurityUtils.getCurrentUserEmail())
            .orElseThrow(() -> new RuntimeException("Không tìm thấy bệnh nhân"));
             // Nếu là bệnh nhân, chỉ được xem lịch sử của chính mình
        if (patient.getRole() == Role.PATIENT && !patient.getId().equals(patientId)) {
            throw new RuntimeException("Bạn không có quyền xem lịch sử của người khác");
        }   

        List<Appointment> appointments = appointmentRepository.findByPatientIdOrderByAppointmentDateDesc(patientId);
        List<AppointmentResponse> responses = new ArrayList<>();

        for(Appointment appointment : appointments) {
            AppointmentResponse dto = AppointmentResponse.builder()
                                    .appointmentId(appointment.getId())
                                    .doctorName(appointment.getDoctor().getFullName())
                                    .patientName(patient.getFullName())
                                    .appointmentDate(appointment.getAppointmentDate().toString())
                                    .symptoms(appointment.getPatientSymptoms())
                                    .timeSlot(appointment.getTimeSlot().getStartTime() +" - " + appointment.getTimeSlot().getEndTime())
                                    .status(appointment.getStatus().toString())
                                    .build();

            responses.add(dto);

        }
        return responses;
    } 

    @Transactional
    public void cancelAppointment(Long appointmentId) {
       User patient = userRepository.findByEmail(SecurityUtils.getCurrentUserEmail())
            .orElseThrow(() -> new RuntimeException("Không tìm thấy bệnh nhân"));
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hẹn!"));

        if (!appointment.getPatient().getId().equals(patient.getId())) {
            throw new RuntimeException("Bạn không có quyền hủy lịch hẹn này!");
        }
        
        if (appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new RuntimeException("Chỉ có thể hủy lịch hẹn đang ở trạng thái Chờ khám!");
        }

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new RuntimeException("Lịch hẹn này đã được hủy trước đó");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);

    }

    // Bác sĩ xem danh sách lịch khám trong ngày cụ thể
    public List<AppointmentResponse> getDoctorAppointments(Long doctorId, LocalDate date) {
        
        List<Appointment> appointments = appointmentRepository.findByDoctorIdAndAppointmentDateOrderByTimeSlot_StartTimeAsc(doctorId, date);
        List<AppointmentResponse> responses = new ArrayList<>();

        for(Appointment appointment : appointments) {
            AppointmentResponse dto = AppointmentResponse.builder()
                                        .appointmentId(appointment.getId())
                                        .patientId(appointment.getPatient().getId())
                                        .patientName(appointment.getPatient().getFullName())
                                        .patientPhone(appointment.getPatient().getPhone())
                                        .timeSlot(appointment.getTimeSlot().getStartTime() + " - " + appointment.getTimeSlot().getEndTime())
                                        .appointmentDate(appointment.getAppointmentDate().toString())
                                        .symptoms(appointment.getPatientSymptoms())
                                        .status(appointment.getStatus().toString())
                                        .build();
        
             responses.add(dto);
                                    
        }
        return responses;
    }
}
