package com.ada.insurance_app.core.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class SecurityUtils {

    private static final Logger log = LoggerFactory.getLogger(SecurityUtils.class);

    public static String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            return token;
        } else {
            return null;
        }
    }

    public static Authentication getCurrentAuthentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    public static String getCurrentUsername() {
        Authentication authentication = getCurrentAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("No authenticated user found");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        }

        throw new IllegalStateException("Unable to extract username from authentication context");
    }

    public static UUID getCurrentUserId() {
        try {
            Authentication authentication = getCurrentAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated()) {
                throw new IllegalStateException("No authenticated user found");
            }

            Object principal = authentication.getPrincipal();
            
            if (principal instanceof CustomUserDetailsInterface) {
                UUID userId = ((CustomUserDetailsInterface) principal).getId();
                return userId;
            }

            // Try to get user ID from JWT token if not available from authentication context
            try {
                ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
                if (attributes != null) {
                    HttpServletRequest request = attributes.getRequest();
                    String token = extractToken(request);
                    if (token != null) {
                        // We need to inject JwtTokenProvider here, but since this is a static method,
                        // we'll need to get it from the application context
                        // For now, let's try to get the user ID from the username
                        String username = getCurrentUsername();
                        
                        // This would require a UserService to get user by username
                        // For now, we'll throw an exception and handle it in the service layer
                        throw new IllegalStateException("User ID not available in authentication context, need to implement user lookup");
                    }
                }
            } catch (Exception e) {
                // Silent fail for security reasons
            }

            throw new IllegalStateException("Unable to extract user ID from authentication context");
        } catch (Exception e) {
            throw e;
        }
    }

    public static boolean isAuthenticated() {
        Authentication authentication = getCurrentAuthentication();
        return authentication != null && authentication.isAuthenticated();
    }

    // Interface for CustomUserDetails to get user ID
    public interface CustomUserDetailsInterface extends UserDetails {
        UUID getId();
    }
}