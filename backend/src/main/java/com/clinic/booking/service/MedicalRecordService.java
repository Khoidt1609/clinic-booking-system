package com.clinic.booking.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.clinic.booking.dto.MedicalRecordRequest;
import com.clinic.booking.dto.MedicalRecordResponse;
import com.clinic.booking.dto.PrescriptionItemDTO;
import com.clinic.booking.entity.Appointment;
import com.clinic.booking.entity.MedicalRecord;
import com.clinic.booking.entity.PrescriptionItem;
import com.clinic.booking.enums.AppointmentStatus;
import com.clinic.booking.repository.AppointmentRepository;
import com.clinic.booking.repository.MedicalRecordRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MedicalRecordService {
    private final MedicalRecordRepository medicalRecordRepository;
    private final AppointmentRepository appointmentRepository;

    // Tạo mới 1 bệnh án và đơn thuốc
    @Transactional
    public MedicalRecordResponse createMedicalRecord(MedicalRecordRequest request) {
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                            .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hẹn"));

        if(medicalRecordRepository.existsByAppointmentId(request.getAppointmentId())) {
            throw new RuntimeException("Lịch hẹn này đã có bệnh án. Nếu muốn sửa, vui lòng dùng chức năng Cập nhật!");
        }
        if(appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new RuntimeException("Chỉ có thể khám cho lịch hẹn đang ở trạng thái chờ khám");
        }

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new RuntimeException("Không thể tạo bệnh án cho lịch hẹn đã bị hủy");
        }

        MedicalRecord medicalRecord = MedicalRecord.builder()
                                        .appointment(appointment)
                                        .doctorDiagnosis(request.getDoctorDiagnosis())
                                        .doctorNotes(request.getDoctorNotes())
                                        .build();
        // gắn đơn thuốc vào medicalRecord
        attachPrescriptionItems(medicalRecord, request.getPrescriptionItems());

        medicalRecordRepository.save(medicalRecord);

        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointmentRepository.save(appointment);

        return toResponse(medicalRecord, "Lưu bệnh án và đơn thuốc thành công!");
        
    }

    // Cập nhật bệnh án và đơn thuốc
    @Transactional
    public MedicalRecordResponse updateMedicalRecord(Long recordId, MedicalRecordRequest request) {
        MedicalRecord medicalRecord = medicalRecordRepository.findById(recordId)
                                    .orElseThrow(() -> new RuntimeException("Không tìm thấy bệnh án"));

        // update info
        medicalRecord.setDoctorDiagnosis(request.getDoctorDiagnosis());
        medicalRecord.setDoctorNotes(request.getDoctorNotes());
        // delete prescription list 
        medicalRecord.getPrescriptionItems().clear();

        attachPrescriptionItems(medicalRecord, request.getPrescriptionItems());
        
        medicalRecordRepository.save(medicalRecord);
        return toResponse(medicalRecord, "Cập nhật bệnh án thành công!");    
    }

    public MedicalRecordResponse getByAppointmentId(Long appointmentId) {
        MedicalRecord medicalRecord = medicalRecordRepository.findByAppointmentId(appointmentId)
                                     .orElseThrow(() -> new RuntimeException("Lịch hẹn này chưa có bệnh án"));

        return toResponse(medicalRecord, null);
    }

    public List<MedicalRecordResponse> getPatientHistory(Long patientId) {
        List<MedicalRecord> records = medicalRecordRepository.findByAppointment_Patient_IdOrderByCreatedAtDesc(patientId);
        List<MedicalRecordResponse> responses = new ArrayList<>(); 
        if(records != null) {
            for(MedicalRecord record : records) {
                responses.add(toResponse(record, null));
            }
        }
        return responses;
    }

    public MedicalRecordResponse getMedicalRecordById(Long recordId) {
        MedicalRecord medicalRecord = medicalRecordRepository.findById(recordId)
                                   .orElseThrow(() -> new RuntimeException("Không tìm thấy bệnh án!"));

        return toResponse(medicalRecord, null);
    }

    //Hàm gán danh sách đơn thuốc vào bệnh 
    private void attachPrescriptionItems(MedicalRecord medicalRecord, List<PrescriptionItemDTO> items) {
        if(items == null || items.isEmpty()) { return; }
       
        for(PrescriptionItemDTO item : items ) {
            // if (item.getQuantity() == null || item.getQuantity() < 1) {
            //         // Ném ra ngoại lệ để Controller bắt được trong khối catch
            //         throw new RuntimeException("Số lượng thuốc phải lớn hơn 0");
            //     }
            PrescriptionItem i = PrescriptionItem.builder()
                                    .medicalRecord(medicalRecord)
                                    .medicineName(item.getMedicineName())
                                    .quantity(item.getQuantity())
                                    .dosageInstruction(item.getDosageInstruction())
                                    .build();
            medicalRecord.getPrescriptionItems().add(i);
        }
    }
    
    // Hàm helper map entity sang dto
    private MedicalRecordResponse toResponse(MedicalRecord medicalRecord, String message) {
        List<PrescriptionItemDTO> newItems = new ArrayList<>();
        for(PrescriptionItem item : medicalRecord.getPrescriptionItems()) {
            PrescriptionItemDTO dto = PrescriptionItemDTO.builder()
                                            .medicineName(item.getMedicineName())
                                            .quantity(item.getQuantity())
                                            .dosageInstruction(item.getDosageInstruction())
                                            .build();
            newItems.add(dto);
        }

        return MedicalRecordResponse.builder()
                                    .recordId(medicalRecord.getId())
                                    .appointmentId(medicalRecord.getAppointment().getId())
                                    .patientName(medicalRecord.getAppointment().getPatient().getFullName())
                                    .doctorName(medicalRecord.getAppointment().getDoctor().getFullName())
                                    .doctorDiagnosis(medicalRecord.getDoctorDiagnosis())
                                    .doctorNotes(medicalRecord.getDoctorNotes())
                                    .prescriptionItems(newItems)
                                    .appointmentDate(medicalRecord.getAppointment().getAppointmentDate().toString())
                                    .message(message)
                                    .build();
    }

}
