package com.ada.insurance_app.controller.payment.Impl;

import com.ada.insurance_app.controller.payment.IPaymentController;
import com.ada.insurance_app.core.common.dto.GeneralResponse;
import com.ada.insurance_app.core.enums.PaymentStatus;
import com.ada.insurance_app.entity.Payment;
import com.ada.insurance_app.request.payment.CreatePaymentRequest;
import com.ada.insurance_app.request.payment.UpdatePaymentRequest;
import com.ada.insurance_app.service.payment.IPaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/project/payment")
@RequiredArgsConstructor
public class PaymentControllerImpl implements IPaymentController {
    
    private final IPaymentService paymentService;
    
    @Override
    @PostMapping("/create")
    public ResponseEntity<GeneralResponse<Payment>> createPayment(@RequestBody CreatePaymentRequest request) {
        try {
            log.info("Creating payment for policy: {}", request.getPolicyId());
            Payment payment = paymentService.createPayment(request);
            
            return ResponseEntity.ok(GeneralResponse.success("Payment created successfully", payment));
        } catch (Exception e) {
            log.error("Error creating payment: {}", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    GeneralResponse.error("Failed to create payment: " + e.getMessage(), HttpStatus.BAD_REQUEST)
            );
        }
    }
    
    @Override
    @PutMapping("/{paymentId}")
    public ResponseEntity<GeneralResponse<Payment>> updatePayment(@PathVariable UUID paymentId, @RequestBody UpdatePaymentRequest request) {
        try {
            log.info("Updating payment: {}", paymentId);
            Payment payment = paymentService.updatePayment(paymentId, request);
            
            return ResponseEntity.ok(GeneralResponse.success("Payment updated successfully", payment));
        } catch (Exception e) {
            log.error("Error updating payment: {}", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    GeneralResponse.error("Failed to update payment: " + e.getMessage(), HttpStatus.BAD_REQUEST)
            );
        }
    }
    
    @Override
    @GetMapping("/policy/{policyId}")
    public ResponseEntity<GeneralResponse<List<Payment>>> getPaymentsByPolicy(@PathVariable Long policyId) {
        try {
            log.info("Getting payments for policy: {}", policyId);
            List<Payment> payments = paymentService.getPaymentsByPolicy(policyId);
            
            return ResponseEntity.ok(GeneralResponse.success("Payments retrieved successfully", payments));
        } catch (Exception e) {
            log.error("Error getting payments for policy: {}", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    GeneralResponse.error("Failed to get payments: " + e.getMessage(), HttpStatus.NOT_FOUND)
            );
        }
    }
    
    @Override
    @GetMapping("/{paymentId}")
    public ResponseEntity<GeneralResponse<Payment>> getPayment(@PathVariable UUID paymentId) {
        try {
            log.info("Getting payment: {}", paymentId);
            Payment payment = paymentService.getPayment(paymentId);
            
            return  ResponseEntity.ok(GeneralResponse.success("Payment retrieved successfully", payment));
        } catch (Exception e) {
            log.error("Error getting payment: {}", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    GeneralResponse.error("Failed to get payment: " + e.getMessage(), HttpStatus.NOT_FOUND)
            );
        }
    }
    
    @Override
    @GetMapping("/status/{status}")
    public ResponseEntity<GeneralResponse<List<Payment>>> getPaymentsByStatus(@PathVariable String status) {
        try {
            log.info("Getting payments by status: {}", status);
            PaymentStatus paymentStatus = PaymentStatus.valueOf(status.toUpperCase());
            List<Payment> payments = paymentService.getPaymentsByStatus(paymentStatus);
            
            return ResponseEntity.ok(GeneralResponse.success("Payments retrieved successfully", payments));
        } catch (Exception e) {
            log.error("Error getting payments by status: {}", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    GeneralResponse.error("Failed to get payments by status: " + e.getMessage(), HttpStatus.BAD_REQUEST)
            );
        }
    }
    
    @Override
    @GetMapping("/policy/{policyId}/total")
    public ResponseEntity<GeneralResponse<Double>> getTotalPaidAmountByPolicy(@PathVariable Long policyId) {
        try {
            log.info("Getting total paid amount for policy: {}", policyId);
            Double totalAmount = paymentService.getTotalPaidAmountByPolicy(policyId);
            
            return ResponseEntity.ok(GeneralResponse.success("Total paid amount retrieved successfully", totalAmount));
        } catch (Exception e) {
            log.error("Error getting total amount for policy: {}", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    GeneralResponse.error("Failed to get total paid amount: " + e.getMessage(), HttpStatus.NOT_FOUND)
            );
        }
    }
}
