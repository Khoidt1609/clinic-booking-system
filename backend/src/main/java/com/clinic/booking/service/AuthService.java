package com.clinic.booking.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.clinic.booking.config.JwtUtil;
import com.clinic.booking.dto.AuthResponse;
import com.clinic.booking.dto.LoginRequest;
import com.clinic.booking.dto.RegisterRequest;
import com.clinic.booking.entity.User;
import com.clinic.booking.enums.Role;
import com.clinic.booking.enums.UserStatus;
import com.clinic.booking.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;



    public AuthResponse register(RegisterRequest request) {

        if(userRepository.findByEmail(request.getEmail()).isPresent()){
            throw new RuntimeException("Email đã được sử dụng");
        } 
        if (userRepository.findByPhone(request.getPhone()).isPresent()) {
            throw new RuntimeException("Số điện thoại đã được sử dụng");
        }

        User newUser = User.builder()
                        .fullName(request.getFullName())
                        .email(request.getEmail())
                        .phone(request.getPhone())
                        .password(passwordEncoder.encode(request.getPassword()))
                        .role(Role.PATIENT)
                        .status(UserStatus.ACTIVE)
                        .build();
        
        userRepository.save(newUser);

        String token = jwtUtil.generateToken(newUser.getEmail(), newUser.getRole().name());

        return AuthResponse.builder().id(newUser.getId())
                                    .email(newUser.getEmail())
                                    .fullName(newUser.getFullName())
                                    .role(newUser.getRole())
                                    .token(token)
                                    .message("Đăng ký thành công")
                                    .build();

    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow(
            () -> new RuntimeException("Không tìm thấy tài khoản đăng nhập")
        );

        if(user.getStatus() == UserStatus.LOCKED) {
            throw new RuntimeException("Tài khoản của bạn đã bị khóa!");
        }

        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        } catch (BadCredentialsException e) {
            throw new RuntimeException("Mật khẩu đăng nhập không chính xác!");
        }
        
        // if(!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
        //     throw new RuntimeException("Mật khẩu đăng nhập không chính xác!");
        // }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .token(token)
                .message("Đăng nhập thành công!")
                .build();
    }
}
