package com.ada.insurance_app.core.security;

import jakarta.servlet.http.HttpServletRequest;

public class SecurityUtils {
    public static String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
