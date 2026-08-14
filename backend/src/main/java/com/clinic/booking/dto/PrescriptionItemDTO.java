package com.clinic.booking.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionItemDTO {
    @NotBlank(message = "Tên thuốc không được để trống")
    private String medicineName;
    
    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 1, message = "Số lượng thuốc phải lớn hơn 0")
    private Integer quantity;

    private String dosageInstruction;
}
