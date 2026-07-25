package com.clinic.booking.dto;

import java.util.List;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class MedicalRecordResponse {
    private Long recordId;
    private Long appointmentId;    
    private String patientName;
    private String doctorDiagnosis;
    private String doctorNotes;
    private String appointmentDate;
    private List<PrescriptionItemDTO> prescriptionItems;
    private String message;
}
