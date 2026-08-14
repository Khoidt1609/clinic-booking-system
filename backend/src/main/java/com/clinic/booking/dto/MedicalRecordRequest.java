package com.clinic.booking.dto;

import java.util.List;

import jakarta.validation.Valid;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MedicalRecordRequest {
    private Long appointmentId;
    private String doctorDiagnosis;
    private String doctorNotes;

    @Valid
    private List<PrescriptionItemDTO> prescriptionItems;
    
}
