package com.clinic.booking.dto;

import java.time.LocalDate;

import com.clinic.booking.enums.Gender;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PatientProfileRequest {
    private String bloodType;
    private LocalDate dateOfBirth;
    private Gender gender;
    private String address;
    private String allergies;
    private String medicalHistory;
}
