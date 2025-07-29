package com.ada.insurance_app.core.exception;

public class OfferNotFoundException extends RuntimeException {
    public OfferNotFoundException(String message) {
        super(message);
    }
} 