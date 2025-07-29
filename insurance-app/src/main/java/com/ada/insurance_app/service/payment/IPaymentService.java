package com.ada.insurance_app.service.payment;

import com.ada.insurance_app.entity.Payment;
import com.ada.insurance_app.core.enums.PaymentStatus;
import com.ada.insurance_app.request.payment.CreatePaymentRequest;
import com.ada.insurance_app.request.payment.UpdatePaymentRequest;
import java.util.List;
import java.util.UUID;

public interface IPaymentService {
    Payment makeDummyPayment(Payment payment, Long policyId);
    List<Payment> getPaymentsByPolicy(Long policyId);
    List<Payment> getPaymentsByStatus(PaymentStatus status);
    double getTotalPaidAmountByPolicy(Long policyId);
    Payment getPayment(UUID paymentId);
    
    // Request sınıflarını kullanan yeni metodlar
    Payment createPayment(CreatePaymentRequest request);
    Payment updatePayment(UUID paymentId, UpdatePaymentRequest request);
}
