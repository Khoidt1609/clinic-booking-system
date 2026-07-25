package com.clinic.booking.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL) // Ẩn các trường null trong JSON trả về
public class AppointmentResponse {
    private Long appointmentId;
    private Long patientId;
    private String patientName;
    private String patientPhone;
    private String doctorName;
    private String timeSlot;
    private String appointmentDate;
    private String symptoms;
    private String status;
    private String message;

}
