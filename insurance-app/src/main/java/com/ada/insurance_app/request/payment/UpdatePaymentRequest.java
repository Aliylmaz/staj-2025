package com.ada.insurance_app.request.payment;

import com.ada.insurance_app.core.enums.PaymentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class UpdatePaymentRequest {

    @NotNull(message = "Payment ID must not be null")
    private String paymentId; // UUID string

    private BigDecimal amount; // Optional - only if correction is needed

    private LocalDateTime paymentDate;

    private String transactionReference;

    private PaymentStatus status; // Optional: SUCCESS / FAILED / PENDING (string olarak alınabilir)
}
