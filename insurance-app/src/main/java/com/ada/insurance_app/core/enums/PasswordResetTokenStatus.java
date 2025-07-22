package com.ada.insurance_app.core.enums;


public enum PasswordResetTokenStatus {
    ACTIVE("Active"),
    USED("Used"),
    EXPIRED("Expired");

    private final String description;

    PasswordResetTokenStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}