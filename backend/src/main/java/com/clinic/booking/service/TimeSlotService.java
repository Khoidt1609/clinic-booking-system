package com.clinic.booking.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.clinic.booking.dto.TimeSlotResponse;
import com.clinic.booking.repository.AppointmentRepository;
import com.clinic.booking.repository.TimeSlotRepository;
import com.clinic.booking.entity.TimeSlot;
import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class TimeSlotService {
    private final TimeSlotRepository timeSlotRepository;
    private final AppointmentRepository appointmentRepository;

    // Hiện tại là 1 doctor
    public List<TimeSlotResponse> getSlotByDoctorAndDate(Long doctorId, LocalDate date) {
        List<TimeSlot> allSlots = timeSlotRepository.findAll();
        List<Long> bookedSlotIds = appointmentRepository.findBookedSlotIdsByDate(doctorId, date);

        List<TimeSlotResponse> responses = new ArrayList<>();

        for(TimeSlot slot : allSlots) {

            boolean isAvailable = !bookedSlotIds.contains(slot.getId());

            TimeSlotResponse dto = TimeSlotResponse.builder()
                                                        .id(slot.getId())
                                                        .shift(slot.getShift().name())
                                                        .startTime(slot.getStartTime().toString())
                                                        .endTime(slot.getEndTime().toString())
                                                        .isAvailable(isAvailable)
                                                        .build();
            
            responses.add(dto);

        }
        return responses;
    } 

}
