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

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/payments")
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

    @Override
    @GetMapping("/policy/{policyId}/history")
    public ResponseEntity<GeneralResponse<List<Payment>>> getPolicyPaymentHistory(@PathVariable Long policyId) {
        try {
            log.info("Getting payment history for policy: {}", policyId);
            List<Payment> payments = paymentService.findPolicyPaymentHistory(policyId);
            return ResponseEntity.ok(GeneralResponse.success("Payment history retrieved successfully", payments));
        } catch (Exception e) {
            log.error("Error getting payment history: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(GeneralResponse.error("Failed to get payment history: " + e.getMessage(), HttpStatus.NOT_FOUND));
        }
    }


    @Override
    @GetMapping("/search")
    public ResponseEntity<GeneralResponse<List<Payment>>> searchPayments(@RequestParam String keyword) {
        try {
            List<Payment> results = paymentService.searchPayments(keyword);
            return ResponseEntity.ok(GeneralResponse.success("Search results retrieved", results));
        } catch (Exception e) {
            log.error("Error searching payments: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(GeneralResponse.error("Search failed: " + e.getMessage(), HttpStatus.BAD_REQUEST));
        }
    }


    @Override
    @GetMapping("/latest")
    public ResponseEntity<GeneralResponse<List<Payment>>> getLatestPayments() {
        try {
            log.info("Retrieving latest payments");
            List<Payment> latest = paymentService.getLatestPayments();
            return ResponseEntity.ok(GeneralResponse.success("Latest payments retrieved", latest));
        } catch (Exception e) {
            log.error("Error retrieving latest payments: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(GeneralResponse.error("Failed to retrieve latest payments", HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }


    @Override
    @GetMapping("/policy/{policyId}/has-success")
    public ResponseEntity<GeneralResponse<Boolean>> hasSuccessfulPayment(@PathVariable Long policyId) {
        try {
            log.info("Checking if policy has successful payments: {}", policyId);
            boolean result = paymentService.hasSuccessfulPayment(policyId);
            return ResponseEntity.ok(GeneralResponse.success("Check completed", result));
        } catch (Exception e) {
            log.error("Error checking success payments: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(GeneralResponse.error("Error checking payment: " + e.getMessage(), HttpStatus.BAD_REQUEST));
        }
    }


    @Override
    @GetMapping("/range")
    public ResponseEntity<GeneralResponse<List<Payment>>> findPaymentsBetweenDates(
            @RequestParam("start") String start,
            @RequestParam("end") String end) {
        try {
            LocalDateTime startDate = LocalDateTime.parse(start);
            LocalDateTime endDate = LocalDateTime.parse(end);

            log.info("Fetching payments between {} and {}", startDate, endDate);
            List<Payment> payments = paymentService.findPaymentsBetweenDates(startDate, endDate);
            return ResponseEntity.ok(GeneralResponse.success("Payments within date range retrieved", payments));
        } catch (Exception e) {
            log.error("Error retrieving payments by date range: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(GeneralResponse.error("Invalid date format or request error: " + e.getMessage(), HttpStatus.BAD_REQUEST));
        }
    }

    @Override
    @PostMapping("/pay/{policyId}")
    public ResponseEntity<GeneralResponse<Payment>> payForPolicy(@PathVariable Long policyId, @RequestBody CreatePaymentRequest request) {
        try {
            log.info("Processing payment for policy: {}", policyId);
            request.setPolicyId(policyId);
            Payment payment = paymentService.createPayment(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(GeneralResponse.success("Payment processed successfully", payment));
        } catch (Exception e) {
            log.error("Error processing payment for policy: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(GeneralResponse.error("Failed to process payment: " + e.getMessage(), HttpStatus.BAD_REQUEST));
        }
    }
}
