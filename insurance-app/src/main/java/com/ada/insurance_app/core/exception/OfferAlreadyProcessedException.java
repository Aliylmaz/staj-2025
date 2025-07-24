package com.ada.insurance_app.core.exception;

public class OfferAlreadyProcessedException extends RuntimeException {
    public OfferAlreadyProcessedException(String message) {
        super(message);
    }
}
