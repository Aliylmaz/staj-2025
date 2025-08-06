package com.ada.insurance_app.core.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String token = SecurityUtils.extractToken(request);
        log.info("JWT Filter - Request URI: {}", request.getRequestURI());
        log.info("JWT Filter - Request Method: {}", request.getMethod());
        log.info("JWT Filter - Authorization Header: {}", request.getHeader("Authorization"));
        log.info("JWT Filter - Token extracted: {}", token != null ? "YES" : "NO");
        
        if (token != null) {
            log.info("JWT Filter - Token length: {}", token.length());
            log.info("JWT Filter - Token starts with: {}", token.substring(0, Math.min(20, token.length())));
            
            if (jwtTokenProvider.validateToken(token)) {
                log.info("JWT Filter - Token is valid");
                String username = jwtTokenProvider.getUsernameFromToken(token);
                log.info("JWT Filter - Username: {}", username);
                
                try {
                    var userDetails = userDetailsService.loadUserByUsername(username);
                    log.info("JWT Filter - UserDetails loaded: {}", userDetails.getUsername());
                    log.info("JWT Filter - UserDetails authorities: {}", userDetails.getAuthorities());

                    var auth = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());

                    SecurityContextHolder.getContext().setAuthentication(auth);
                    log.info("JWT Filter - Authentication set successfully for user: {}", username);
                } catch (Exception e) {
                    log.error("JWT Filter - Error loading user details for username {}: {}", username, e.getMessage(), e);
                }
            } else {
                log.error("JWT Filter - Token validation failed");
            }
        } else {
            log.warn("JWT Filter - No token found in request");
        }

        filterChain.doFilter(request, response);
    }
}
