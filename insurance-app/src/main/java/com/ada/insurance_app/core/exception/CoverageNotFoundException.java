package com.ada.insurance_app.core.exception;

public class CoverageNotFoundException extends RuntimeException {
    public CoverageNotFoundException(String message) {
        super(message);
    }
}
