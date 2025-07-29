package com.ada.insurance_app.service.policy;

import com.ada.insurance_app.dto.PolicyDto;
import com.ada.insurance_app.request.policy.CreatePolicyRequest;
import com.ada.insurance_app.request.policy.UpdatePolicyRequest;
import com.ada.insurance_app.request.policy.CancelPolicyRequest;
import java.util.List;
import java.util.UUID;

public interface IPolicyService {
    PolicyDto createPolicy(PolicyDto policyDto, UUID agentId, UUID customerId);
    PolicyDto updatePolicy(Long policyId, PolicyDto policyDto);
    void deletePolicy(Long policyId);
    PolicyDto getPolicyById(Long policyId);
    List<PolicyDto> getPoliciesByAgent(UUID agentId);
    List<PolicyDto> getPoliciesByCustomer(UUID customerId);
    List<PolicyDto> getAllPolicies();
    
    // Request sınıflarını kullanan yeni metodlar
    PolicyDto createPolicyFromRequest(CreatePolicyRequest request);
    PolicyDto updatePolicyFromRequest(Long policyId, UpdatePolicyRequest request);
    void cancelPolicyFromRequest(Long policyId, CancelPolicyRequest request);
}
