package com.clinic.booking.service;

import java.util.ArrayList;
import java.util.List;

import javax.management.RuntimeErrorException;

import org.springframework.stereotype.Service;

import com.clinic.booking.dto.PatientSummaryResponse;
import com.clinic.booking.dto.PatientProfileRequest;
import com.clinic.booking.dto.PatientProfileResponse;
import com.clinic.booking.entity.PatientProfile;
import com.clinic.booking.entity.User;
import com.clinic.booking.enums.Role;
import com.clinic.booking.helpers.SecurityUtils;
import com.clinic.booking.repository.PatientProfileRepository;
import com.clinic.booking.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PatientProfileService {
    private final PatientProfileRepository patientProfileRepository;
    private final UserRepository userRepository;

    public PatientProfileResponse getPatientProfile(Long userId) {
        User user  = userRepository.findById(userId)
                                    .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản người dùng!"));
        PatientProfile patientProfile = patientProfileRepository.findByUserId(userId).orElse(null);

        return toResponse(patientProfile, user, null);
    }

    @Transactional
    public PatientProfileResponse updateProfile(PatientProfileRequest request) {
        User user = userRepository.findByEmail(SecurityUtils.getCurrentUserEmail())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản người dùng!"));
        PatientProfile profile = patientProfileRepository.findByUserId(user.getId())
                    .orElseGet(() -> PatientProfile.builder().user(user).build());

        profile.setBloodType(request.getBloodType());
        profile.setDateOfBirth(request.getDateOfBirth());
        profile.setGender(request.getGender());
        profile.setAddress(request.getAddress());
        profile.setAllergies(request.getAllergies());
        profile.setMedicalHistory(request.getMedicalHistory());

        patientProfileRepository.save(profile);

        return toResponse(profile, user,  "Cập nhật hồ sơ sức khỏe thành công!");
    }
    // Tìm kiếm bệnh nhân theo keyword
    public List<PatientSummaryResponse> searchPatients(String keyword) {
        User user = userRepository.findByEmail(SecurityUtils.getCurrentUserEmail())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản người dùng"));
        if(user.getRole() != Role.DOCTOR) {
            throw new RuntimeException("Bạn không có quyền truy cập chức năng này");
        }
        List<User> patients = userRepository.searchPatients(keyword);
        List<PatientSummaryResponse> responses = new ArrayList<>();
        for(User patient : patients) {
            PatientProfile profile = patientProfileRepository.findByUserId(patient.getId()).orElse(null);
            PatientSummaryResponse response = PatientSummaryResponse.builder()
                                                .patientId(patient.getId())
                                                .fullName(patient.getFullName())
                                                .phone(patient.getPhone())
                                                .dateOfBirth(profile.getDateOfBirth())
                                                .gender(profile.getGender() != null ? profile.getGender().toString() : null)
                                                .build();
            responses.add(response);
        };
        return responses;
    }

    private PatientProfileResponse toResponse(PatientProfile patientProfile, User user, String message) {

        PatientProfileResponse.PatientProfileResponseBuilder builder = PatientProfileResponse.builder()
                .userId(user.getId())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .email(user.getEmail())
                .message(message);

        if(patientProfile != null) {
           builder.id(patientProfile.getId())
                    .bloodType(patientProfile.getBloodType())
                    .dateOfBirth(patientProfile.getDateOfBirth())
                    .gender(patientProfile.getGender())
                    .address(patientProfile.getAddress())
                    .allergies(patientProfile.getAllergies())
                    .medicalHistory(patientProfile.getMedicalHistory());
        }

        return builder.build();
    }
    
}
