package com.clinic.booking.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.clinic.booking.dto.AppointmentRequest;
import com.clinic.booking.dto.AppointmentResponse;
import com.clinic.booking.exception.SlotAlreadyBookedException;
import com.clinic.booking.service.AppointmentService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {
    private final AppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<?> createAppointment(@RequestBody AppointmentRequest request) {
        try {
            AppointmentResponse response = appointmentService.createAppointment(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (SlotAlreadyBookedException e) {
            // 409 Conflict
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch(RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
        
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getPatientAppointments(@PathVariable("patientId") Long patientId) {
        try {
            List<AppointmentResponse> responses = appointmentService.getPatientAppointments(patientId);
            return ResponseEntity.ok(responses);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelAppointment(@PathVariable("id") Long appointmentId) {
        try {
            appointmentService.cancelAppointment(appointmentId);
            return ResponseEntity.ok(Map.of("message", "Huỷ lịch hẹn thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/doctor")
    public ResponseEntity<?> getDoctorAppointments(@RequestParam Long doctorId, 
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
       try {
        List<AppointmentResponse> responses = appointmentService.getDoctorAppointments(doctorId, date);
        return ResponseEntity.ok(responses);
       } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    
}
