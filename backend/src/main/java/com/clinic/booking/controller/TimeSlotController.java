package com.clinic.booking.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.clinic.booking.dto.TimeSlotResponse;
import com.clinic.booking.service.TimeSlotService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/time-slots")
@RequiredArgsConstructor
public class TimeSlotController {
    private final TimeSlotService timeSlotService;

    //Dang GET /api/time-slots?doctorId=1&date=2026-07-22
    @GetMapping
    public ResponseEntity<List<TimeSlotResponse>> getAvailableSlots(@RequestParam Long doctorId, 
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        List<TimeSlotResponse> responses = timeSlotService.getSlotByDoctorAndDate(doctorId, date);

        return ResponseEntity.ok(responses);
    }
    
}
