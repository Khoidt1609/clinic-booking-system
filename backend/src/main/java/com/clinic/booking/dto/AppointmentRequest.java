package com.clinic.booking.dto;

import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AppointmentRequest {
    private Long patientId;
    private Long doctorId;
    private Long slotId;
    private LocalDate appointmentDate;
    private String patientSymptoms;

}
