package com.clinic.booking.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.clinic.booking.dto.PatientProfileRequest;
import com.clinic.booking.dto.PatientProfileResponse;
import com.clinic.booking.service.PatientProfileService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;



@RestController
@RequiredArgsConstructor
@RequestMapping("/api/profiles")
@CrossOrigin("*")
public class PatientProfileController {
    private final PatientProfileService patientProfileService;

    @GetMapping("/{userId}")
    public ResponseEntity<?> getPatientProfile(@PathVariable Long userId) {
        try {
            PatientProfileResponse response = patientProfileService.getPatientProfile(userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    

    @PutMapping("/{userId}")
    public ResponseEntity<?> updateProfile( @PathVariable Long userId ,@RequestBody PatientProfileRequest request) {
        try {
            PatientProfileResponse response = patientProfileService.updateProfile(userId, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    
}
