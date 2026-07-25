package com.clinic.booking.entity;

import jakarta.persistence.*;
import lombok.*;
@Entity
@Table(name = "prescription_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medical_record_id", nullable = false)
    private MedicalRecord medicalRecord;

    @Column(name = "medicine_name", nullable = false, length = 150)
    private String medicineName;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "dosage_instruction", nullable = false)
    private String dosageInstruction;
}
