package com.clinic.booking.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.clinic.booking.entity.TimeSlot;

public interface TimeSlotRepository extends JpaRepository<TimeSlot, Long> {
    // Nếu sau này muốn lọc ca Sáng/Chiều thì thêm hàm ở đây
    // Lấy toàn bộ khung giờ, sắp theo thứ tự thời gian để hiển thị lên UI
    List<TimeSlot> findAllByOrderByStartTimeAsc();
}
