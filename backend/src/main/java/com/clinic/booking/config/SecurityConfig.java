package com.clinic.booking.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
    // Khai báo công cụ mã hóa mật khẩu để Spring quản lý
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Cấu hình tạm thời: Vừa giữ bộ khung Spring Security, vừa "mở cửa" để không bị lỗi 403 khi test
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable) // Tắt CSRF bảo vệ (bắt buộc khi làm API cho Frontend gọi)
            .cors(AbstractHttpConfigurer::disable) // Tắt CORS tạm thời nếu test local, hoặc cấu hình sau
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll() // Cho phép TẤT CẢ các API chạy qua không cần token/mật khẩu
            );
        
        return http.build();
    }
}
