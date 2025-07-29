package com.ada.insurance_app.controller.policy;

import com.ada.insurance_app.core.common.dto.GeneralResponse;
import com.ada.insurance_app.dto.PolicyDto;
import com.ada.insurance_app.request.policy.CreatePolicyRequest;
import com.ada.insurance_app.request.policy.UpdatePolicyRequest;
import com.ada.insurance_app.request.policy.CancelPolicyRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

public interface IPolicyController {
    

    ResponseEntity<GeneralResponse<PolicyDto>> createPolicy( CreatePolicyRequest request);
    

    ResponseEntity<GeneralResponse<PolicyDto>> updatePolicy( Long policyId,  UpdatePolicyRequest request);
    

    ResponseEntity<GeneralResponse<Void>> cancelPolicy( Long policyId,  CancelPolicyRequest request);


    ResponseEntity<GeneralResponse<PolicyDto>> getPolicy( Long policyId);
    

    ResponseEntity<GeneralResponse<List<PolicyDto>>> getPoliciesByAgent( UUID agentId);
    

    ResponseEntity<GeneralResponse<List<PolicyDto>>> getPoliciesByCustomer( UUID customerId);
    

    ResponseEntity<GeneralResponse<List<PolicyDto>>> getAllPolicies();
    

    ResponseEntity<GeneralResponse<Void>> deletePolicy( Long policyId);
}
