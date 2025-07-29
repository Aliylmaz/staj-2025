package com.ada.insurance_app.core.exception;

public class AgentNotFoundException extends RuntimeException {
    public AgentNotFoundException(String message) {
        super(message);
    }
} 