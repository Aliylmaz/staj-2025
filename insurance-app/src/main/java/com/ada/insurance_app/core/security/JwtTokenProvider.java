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
            return token;
        } catch (Exception e) {
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
            return null;
        }
    }

    public boolean validateToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .setSigningKey(jwtSecret)
                    .parseClaimsJws(token)
                    .getBody();
            
            // Check if token is expired
            if (claims.getExpiration().before(new Date())) {
                return false;
            }
            
            return true;
        } catch (Exception ex) {
            return false;
        }
    }
}
