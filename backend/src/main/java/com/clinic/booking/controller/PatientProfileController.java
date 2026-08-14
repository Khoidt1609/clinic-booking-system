package com.clinic.booking.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.clinic.booking.dto.PatientProfileRequest;
import com.clinic.booking.dto.PatientProfileResponse;
import com.clinic.booking.dto.PatientSummaryResponse;
import com.clinic.booking.service.PatientProfileService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;




@RestController
@RequiredArgsConstructor
@RequestMapping("/api/profiles")
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
    

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody PatientProfileRequest request) {
        try {
            PatientProfileResponse response = patientProfileService.updateProfile(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchPatients(@RequestParam(required = false, defaultValue = "") String keyword) {
        try {
            List<PatientSummaryResponse> responses = patientProfileService.searchPatients(keyword);
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
           return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
