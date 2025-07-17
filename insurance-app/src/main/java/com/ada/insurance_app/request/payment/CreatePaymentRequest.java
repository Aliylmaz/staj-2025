package com.ada.insurance_app.request.payment;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CreatePaymentRequest {

    @NotNull(message = "Policy ID must not be null")
    private Long policyId;

    @NotNull(message = "Payment amount must not be null")
    @Positive(message = "Amount must be greater than zero")
    private BigDecimal amount;

    @NotNull(message = "Payment date must not be null")
    private LocalDateTime paymentDate;

    // Simulated card details (they won't be stored)
    @NotBlank(message = "Card number is required")
    private String cardNumber;

    @NotBlank(message = "Card holder name is required")
    private String cardHolder;

    @NotBlank(message = "Expiry date is required")
    private String expiryDate;

    @NotBlank(message = "CVV is required")
    private String cvv;
}
