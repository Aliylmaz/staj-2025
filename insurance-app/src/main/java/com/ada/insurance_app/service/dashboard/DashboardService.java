package com.ada.insurance_app.service.dashboard;

public interface DashboardService {
    long getTotalPolicyCount();
    long getTotalCustomerCount();
    long getTotalClaimCount();
    long getTotalPaymentCount();
    long getTotalOfferCount();
    double getTotalPremiumSum();

} 