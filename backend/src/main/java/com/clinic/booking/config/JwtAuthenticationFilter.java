package com.clinic.booking.config;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.clinic.booking.service.UserDetailsServiceImpl;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter  {

    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsServiceImpl;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,@NonNull HttpServletResponse response,@NonNull FilterChain filterChain)
            throws ServletException, IOException {
                
            try {
                String authHeader = request.getHeader("Authorization");

                // Bỏ qua nếu .., để xử lý filer tiếp theo
                if(authHeader == null || !authHeader.startsWith("Bearer ")) {
                    filterChain.doFilter(request, response);
                    return;
                }

                String token = authHeader.substring(7);
                String email;

                try {
                    email = jwtUtil.getEmailFromToken(token);
                } catch (Exception e) {
                     // Token sai định dạng, hết hạn, hoặc bị giả mạo chữ ký thi bỏ qua, không set gì cả
                    filterChain.doFilter(request, response);
                    return;
                }

                if(email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    // Lấy thông tin User từ DB
                    UserDetails userDetails = userDetailsServiceImpl.loadUserByUsername(email);

                    if(jwtUtil.isTokenValid(email, token)) {
                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                        // Cấp quyền cho Request này đi tiếp vào Controller
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }

                }
            } catch (Exception ex) {
                 logger.error("Không thể thiết lập xác thực người dùng: ", ex);
            }
            filterChain.doFilter(request, response);
        
    }

}
