package com.clinic.booking.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MedicalRecordRequest {
    private Long appointmentId;
    private String doctorDiagnosis;
    private String doctorNotes;
    private List<PrescriptionItemDTO> prescriptionItems;
    
}
