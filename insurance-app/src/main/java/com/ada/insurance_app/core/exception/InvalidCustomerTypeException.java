package com.ada.insurance_app.core.exception;

public class InvalidCustomerTypeException extends RuntimeException {
    public InvalidCustomerTypeException(String message) {
        super(message);
    }
}
