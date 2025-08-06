package com.ada.insurance_app.controller.payment;

import com.ada.insurance_app.core.common.dto.GeneralResponse;
import com.ada.insurance_app.entity.Payment;
import com.ada.insurance_app.request.payment.CreatePaymentRequest;
import com.ada.insurance_app.request.payment.UpdatePaymentRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

public interface IPaymentController {
    
    ResponseEntity<GeneralResponse<Payment>> createPayment( CreatePaymentRequest request);
    
    ResponseEntity<GeneralResponse<Payment>> updatePayment( UUID paymentId,  UpdatePaymentRequest request);
    
    ResponseEntity<GeneralResponse<List<Payment>>> getPaymentsByPolicy( Long policyId);
    
    ResponseEntity<GeneralResponse<Payment>> getPayment(UUID paymentId);
    
    ResponseEntity<GeneralResponse<List<Payment>>> getPaymentsByStatus( String status);
    
    ResponseEntity<GeneralResponse<Double>> getTotalPaidAmountByPolicy( Long policyId);

    ResponseEntity<GeneralResponse<List<Payment>>> getPolicyPaymentHistory( Long policyId);

    ResponseEntity<GeneralResponse<List<Payment>>> searchPayments( String keyword);

    ResponseEntity<GeneralResponse<List<Payment>>> getLatestPayments();

    ResponseEntity<GeneralResponse<Boolean>> hasSuccessfulPayment( Long policyId);

    ResponseEntity<GeneralResponse<List<Payment>>> findPaymentsBetweenDates(
            @RequestParam("start") String start,
            @RequestParam("end") String end
    );

    // Pay for policy endpoint
    ResponseEntity<GeneralResponse<Payment>> payForPolicy(Long policyId, CreatePaymentRequest request);
}
