package com.clinic.booking.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientSummaryResponse {
    private Long patientId;
    private String fullName;
    private String phone;
    private String gender;
    private LocalDate dateOfBirth;
}
