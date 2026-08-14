package com.clinic.booking.dto;

import java.time.LocalDate;

import com.clinic.booking.enums.Gender;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PatientProfileRequest {
    @Pattern(regexp = "^(A|B|AB|O)[+-]?$", message = "Nhóm máu không hợp lệ (VD: A+, B-, O, AB...)")
    private String bloodType;
    
    @NotNull(message = "Ngày sinh không được để trống")
    @Past(message = "Ngày sinh phải là một ngày trong quá khứ") // 🌟 Chặn chọn ngày tương lai
    private LocalDate dateOfBirth;
    private Gender gender;
    private String address;
    @Size(max = 500, message = "Thông tin dị ứng không được dài quá 500 ký tự")
    private String allergies;

    @Size(max = 1000, message = "Tiền sử bệnh lý không được dài quá 1000 ký tự")
    private String medicalHistory;
}
