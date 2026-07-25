package com.clinic.booking.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;

import com.clinic.booking.enums.Shift;

@Entity
@Table(name = "time_slots", uniqueConstraints = {
    @UniqueConstraint(name = "uq_slot_range", columnNames = {"start_time", "end_time"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimeSlot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Shift shift;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

}
