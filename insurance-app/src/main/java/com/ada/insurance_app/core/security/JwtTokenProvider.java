package com.ada.insurance_app.core.security;

import io.jsonwebtoken.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.UUID;

@Component
@Slf4j
public class JwtTokenProvider {

    @Value("${security.jwt.secret}")
    private String jwtSecret;

    @Value("${security.jwt.expirationMs}")
    private Long jwtExpirationMs;

    public String generateToken(Authentication authentication) {
        try {
            String username = authentication.getName();
            UUID userId = null;
            
            // Try to extract user ID from CustomUserDetails
            if (authentication.getPrincipal() instanceof SecurityUtils.CustomUserDetailsInterface) {
                userId = ((SecurityUtils.CustomUserDetailsInterface) authentication.getPrincipal()).getId();
            }
            
            Date now = new Date();
            Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

            JwtBuilder builder = Jwts.builder()
                    .setSubject(username)
                    .setIssuedAt(now)
                    .setExpiration(expiryDate)
                    .signWith(SignatureAlgorithm.HS512, jwtSecret);
            
            // Add user ID as a claim if available
            if (userId != null) {
                builder.claim("userId", userId.toString());
            }

            String token = builder.compact();
            log.info("JWT Token generated for user: {} with ID: {}", username, userId);
            return token;
        } catch (Exception e) {
            log.error("Error generating JWT token: {}", e.getMessage(), e);
            throw e;
        }
    }

    public String getUsernameFromToken(String token) {
        try {
            return Jwts.parser()
                    .setSigningKey(jwtSecret)
                    .parseClaimsJws(token)
                    .getBody()
                    .getSubject();
        } catch (Exception e) {
            log.error("Error extracting username from token: {}", e.getMessage());
            throw e;
        }
    }

    public UUID getUserIdFromToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .setSigningKey(jwtSecret)
                    .parseClaimsJws(token)
                    .getBody();
            
            String userIdStr = claims.get("userId", String.class);
            if (userIdStr != null) {
                return UUID.fromString(userIdStr);
            }
            return null;
        } catch (Exception e) {
            log.error("Error extracting user ID from token: {}", e.getMessage());
            return null;
        }
    }

    public boolean validateToken(String token) {
        try {
            log.info("JWT TokenProvider - Validating token: {}", token.substring(0, Math.min(20, token.length())));
            log.info("JWT TokenProvider - JWT Secret configured: {}", jwtSecret != null ? "YES" : "NO");
            
            Claims claims = Jwts.parser()
                    .setSigningKey(jwtSecret)
                    .parseClaimsJws(token)
                    .getBody();
            
            log.info("JWT TokenProvider - Token claims parsed successfully");
            log.info("JWT TokenProvider - Token subject: {}", claims.getSubject());
            log.info("JWT TokenProvider - Token issued at: {}", claims.getIssuedAt());
            log.info("JWT TokenProvider - Token expiration: {}", claims.getExpiration());
            
            // Check if token is expired
            if (claims.getExpiration().before(new Date())) {
                log.error("JWT TokenProvider - Token is expired");
                return false;
            }
            
            log.info("JWT TokenProvider - Token validation successful");
            return true;
        } catch (JwtException ex) {
            log.error("JWT TokenProvider - JWT Exception during validation: {}", ex.getMessage(), ex);
            return false;
        } catch (IllegalArgumentException ex) {
            log.error("JWT TokenProvider - IllegalArgumentException during validation: {}", ex.getMessage(), ex);
            return false;
        } catch (Exception ex) {
            log.error("JWT TokenProvider - Unexpected error during token validation: {}", ex.getMessage(), ex);
            return false;
        }
    }
}
