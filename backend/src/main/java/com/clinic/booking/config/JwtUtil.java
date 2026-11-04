package com.clinic.booking.config;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {
    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration-ms}")
    private Long expirationTime;

    // Chuyển chuỗi secret thành SecretKey
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    // Sinh token mới
    public String generateToken(String email, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationTime);

        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    // Lấy thông tin Email từ JWT Token
    public String getEmailFromToken(String token) {
        Claims claims = Jwts.parser()
                            .verifyWith(getSigningKey())
                            .build()
                            .parseSignedClaims(token) // Đọc chuỗi token và kiểm tra xem có chỉnh sửa hay hết hạn
                            .getPayload();
        
        return claims.getSubject();
    }
    // Lấy thống tin role 
    public String getRoleFromToken(String token) {
        Claims claims = Jwts.parser()
                            .verifyWith(getSigningKey())
                            .build()
                            .parseSignedClaims(token)
                            .getPayload();
        return claims.get("role", String.class);
    }
// Kiểm tra token còn hạn sử dụng không
    public boolean isTokenExpired(String token) {
         Claims claims = Jwts.parser()
                            .verifyWith(getSigningKey())
                            .build()
                            .parseSignedClaims(token)
                            .getPayload();
        return claims.getExpiration().before(new Date());
    }

    // Kiểm tra token hợp lệ: đúng email và chưa hết hạn
    public boolean isTokenValid(String email, String token) {
        String getEmail = getEmailFromToken(token);
        return getEmail.equals(email) && !isTokenExpired(token);
    }
 }
