package com.ada.insurance_app.service.dashboard.Impl;

import com.ada.insurance_app.repository.*;
import com.ada.insurance_app.service.dashboard.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {
    private final IPolicyRepository policyRepository;
    private final ICustomerRepository customerRepository;
    private final IClaimRepository claimRepository;
    private final IPaymentRepository paymentRepository;
    private final IOfferRepository offerRepository;

    @Override
    public long getTotalPolicyCount() {
        return policyRepository.count();
    }
    @Override
    public long getTotalCustomerCount() {
        return customerRepository.count();
    }
    @Override
    public long getTotalClaimCount() {
        return claimRepository.count();
    }
    @Override
    public long getTotalPaymentCount() {
        return paymentRepository.count();
    }
    @Override
    public long getTotalOfferCount() {
        return offerRepository.count();
    }
    @Override
    public double getTotalPremiumSum() {
        return policyRepository.sumTotalPremium();
    }
} 