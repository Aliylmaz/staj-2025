package com.ada.insurance_app.service.payment.Impl;

import com.ada.insurance_app.core.exception.PaymentNotFoundException;
import com.ada.insurance_app.core.exception.PolicyNotFoundException;
import com.ada.insurance_app.entity.Payment;
import com.ada.insurance_app.entity.Policy;
import com.ada.insurance_app.core.enums.PaymentStatus;
import com.ada.insurance_app.repository.IPaymentRepository;
import com.ada.insurance_app.repository.IPolicyRepository;
import com.ada.insurance_app.request.payment.CreatePaymentRequest;
import com.ada.insurance_app.request.payment.UpdatePaymentRequest;
import com.ada.insurance_app.service.payment.IPaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements IPaymentService {
    private final IPaymentRepository paymentRepository;
    private final IPolicyRepository policyRepository;

    @Override
    @Transactional
    public Payment makeDummyPayment(Payment payment, Long policyId) {
        // Validate payment data
        validatePayment(payment);
        
        // Check if policy exists
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new PolicyNotFoundException("Policy not found with id: " + policyId));
        
        // Business rule: Check if policy is active
        if (!"ACTIVE".equals(policy.getStatus().name())) {
            throw new IllegalArgumentException("Cannot make payment for inactive policy");
        }
        
        // Business rule: Check if payment amount matches policy premium
        if (payment.getAmount().compareTo(policy.getPremium()) != 0) {
            throw new IllegalArgumentException("Payment amount must match policy premium");
        }
        
        payment.setPolicy(policy);
        payment.setStatus(PaymentStatus.SUCCESS); // Dummy payment
        
        Payment savedPayment = paymentRepository.save(payment);
        log.info("Payment processed successfully: {} for policy: {}", savedPayment.getId(), policyId);
        
        return savedPayment;
    }

    @Override
    public List<Payment> getPaymentsByPolicy(Long policyId) {
        // Check if policy exists
        if (!policyRepository.existsById(policyId)) {
            throw new PolicyNotFoundException("Policy not found with id: " + policyId);
        }
        
        List<Payment> payments = paymentRepository.findByPolicyId(policyId);
        return payments;
    }

    @Override
    public List<Payment> getPaymentsByStatus(PaymentStatus status) {
        if (status == null) {
            throw new IllegalArgumentException("Payment status cannot be null");
        }
        
        List<Payment> payments = paymentRepository.findByStatus(status);
        return payments;
    }

    @Override
    public double getTotalPaidAmountByPolicy(Long policyId) {
        // Check if policy exists
        if (!policyRepository.existsById(policyId)) {
            throw new PolicyNotFoundException("Policy not found with id: " + policyId);
        }
        
        BigDecimal totalAmount = paymentRepository.getTotalSuccessfulPaymentsByPolicy(policyId);
        return totalAmount != null ? totalAmount.doubleValue() : 0.0;
    }

    @Override
    public Payment getPayment(UUID paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new PaymentNotFoundException("Payment not found with id: " + paymentId));
        
        return payment;
    }

    @Override
    @Transactional
    public Payment createPayment(CreatePaymentRequest request) {
        // Validate request
        validateCreatePaymentRequest(request);
        
        // Check if policy exists
        Policy policy = policyRepository.findById(request.getPolicyId())
                .orElseThrow(() -> new PolicyNotFoundException("Policy not found with id: " + request.getPolicyId()));
        
        // Business rule: Check if policy is active
        if (!"ACTIVE".equals(policy.getStatus().name())) {
            throw new IllegalArgumentException("Cannot make payment for inactive policy");
        }
        
        // Business rule: Check if payment amount matches policy premium
        if (request.getAmount().compareTo(policy.getPremium()) != 0) {
            throw new IllegalArgumentException("Payment amount must match policy premium");
        }
        
        // Create payment entity from request
        Payment payment = new Payment();
        payment.setPolicy(policy);
        payment.setAmount(request.getAmount());
        payment.setPaymentDate(request.getPaymentDate());
        payment.setStatus(PaymentStatus.SUCCESS); // Dummy payment simulation
        
        // Generate transaction reference
        payment.setTransactionReference("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        
        Payment savedPayment = paymentRepository.save(payment);
        log.info("Payment created successfully: {} for policy: {}", savedPayment.getId(), request.getPolicyId());
        
        return savedPayment;
    }

    @Override
    @Transactional
    public Payment updatePayment(UUID paymentId, UpdatePaymentRequest request) {
        // Get existing payment
        Payment payment = getPayment(paymentId);
        
        // Update fields if provided
        if (request.getAmount() != null) {
            payment.setAmount(request.getAmount());
        }
        
        if (request.getPaymentDate() != null) {
            payment.setPaymentDate(request.getPaymentDate());
        }
        
        if (StringUtils.hasText(request.getTransactionReference())) {
            payment.setTransactionReference(request.getTransactionReference());
        }
        
        if (request.getStatus() != null) {
            payment.setStatus(request.getStatus());
        }
        
        Payment updatedPayment = paymentRepository.save(payment);
        log.info("Payment updated successfully: {}", paymentId);
        
        return updatedPayment;
    }

    // Private validation methods
    private void validatePayment(Payment payment) {
        if (payment == null) {
            throw new IllegalArgumentException("Payment data cannot be null");
        }
        
        if (payment.getAmount() == null || payment.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Payment amount must be greater than zero");
        }
    }
    
    private void validateCreatePaymentRequest(CreatePaymentRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("CreatePaymentRequest cannot be null");
        }
        
        if (request.getPolicyId() == null) {
            throw new IllegalArgumentException("Policy ID cannot be null");
        }
        
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Payment amount must be greater than zero");
        }
        
        if (request.getPaymentDate() == null) {
            throw new IllegalArgumentException("Payment date cannot be null");
        }
        
        // Validate card details (simulated validation)
        if (!StringUtils.hasText(request.getCardNumber()) || request.getCardNumber().length() < 13) {
            throw new IllegalArgumentException("Invalid card number");
        }
        
        if (!StringUtils.hasText(request.getCardHolder())) {
            throw new IllegalArgumentException("Card holder name is required");
        }
        
        if (!StringUtils.hasText(request.getExpiryDate())) {
            throw new IllegalArgumentException("Expiry date is required");
        }
        
        if (!StringUtils.hasText(request.getCvv()) || request.getCvv().length() < 3) {
            throw new IllegalArgumentException("Invalid CVV");
        }
    }
}
