package com.clinic.booking.repository;

import com.clinic.booking.entity.PrescriptionItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PrescriptionItemRepository extends JpaRepository<PrescriptionItem, Long> {
    // Danh sach thuoc thuoc ve 1 benh an
    List<PrescriptionItem> findByMedicalRecordId(Long medicalRecordId);
}
