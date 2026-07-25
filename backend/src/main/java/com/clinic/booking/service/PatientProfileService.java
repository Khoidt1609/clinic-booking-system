package com.clinic.booking.service;

import org.springframework.stereotype.Service;

import com.clinic.booking.dto.PatientProfileRequest;
import com.clinic.booking.dto.PatientProfileResponse;
import com.clinic.booking.entity.PatientProfile;
import com.clinic.booking.entity.User;
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
    public PatientProfileResponse updateProfile(Long userId,PatientProfileRequest request) {
        User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản người dùng!"));
        PatientProfile profile = patientProfileRepository.findByUserId(userId)
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
