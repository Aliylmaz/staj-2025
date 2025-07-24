package com.ada.insurance_app.core.exception;

public class UnauthorizedRoleAccessException extends RuntimeException {
    public UnauthorizedRoleAccessException(String message) {
        super(message);
    }
}
