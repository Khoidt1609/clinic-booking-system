package com.clinic.booking.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class TimeSlotResponse {
    private Long id;
    private String shift;
    private String startTime;
    private String endTime;
    private boolean isAvailable;


}
