package com.clinic.booking.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.clinic.booking.entity.User;
import com.clinic.booking.enums.Role;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhone(String phone);

    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);

    // Lấy danh sách tất cả người dùng có Role là DOCTOR
    List<User> findByRole(Role role);
    
    //  lấy bác sĩ đầu tiên 
    Optional<User> findFirstByRole(Role role);

}
