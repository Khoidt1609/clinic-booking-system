package com.clinic.booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.clinic.booking.entity.PatientProfile;
import java.util.Optional;

public interface PatientProfileRepository extends JpaRepository<PatientProfile, Long> {
    Optional<PatientProfile> findByUserId(Long id);
}
