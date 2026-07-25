package com.clinic.booking.dto;

import java.time.LocalDate;

import com.clinic.booking.enums.Gender;

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
public class PatientProfileResponse {
    private Long id;
    private Long userId;
    private String email;
    private String phone;
    private String fullName;
    private String bloodType;
    private LocalDate dateOfBirth;
    private Gender gender;
    private String address;
    private String allergies;
    private String medicalHistory;
    private String message;

}
