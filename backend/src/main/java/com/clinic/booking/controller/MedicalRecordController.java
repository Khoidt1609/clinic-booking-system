package com.clinic.booking.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.clinic.booking.dto.MedicalRecordRequest;
import com.clinic.booking.dto.MedicalRecordResponse;
import com.clinic.booking.service.MedicalRecordService;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.GetMapping;



@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@RequestMapping("/api/medical-records")
public class MedicalRecordController {
    private final MedicalRecordService medicalRecordService;

    @PostMapping
    public ResponseEntity<?> createMedicalRecord(@RequestBody MedicalRecordRequest request) {
        try {
            MedicalRecordResponse response = medicalRecordService.createMedicalRecord(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateMedicalRecord(@PathVariable("id") Long recordId, @RequestBody MedicalRecordRequest request) {
       try {
            MedicalRecordResponse response = medicalRecordService.updateMedicalRecord(recordId, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<?> getByAppointment(@PathVariable Long appointmentId) {
        try {
            MedicalRecordResponse response = medicalRecordService.getByAppointmentId(appointmentId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<MedicalRecordResponse>> getPatientHistory(@PathVariable Long patientId) {
        List<MedicalRecordResponse> responses = medicalRecordService.getPatientHistory(patientId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("{id}")
    public ResponseEntity<?> getMedicalRecordById(@PathVariable Long recordId) {
        
        try {
            MedicalRecordResponse response = medicalRecordService.getMedicalRecordById(recordId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }  
    
}
