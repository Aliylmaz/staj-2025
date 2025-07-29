package com.ada.insurance_app.controller.health;

import com.ada.insurance_app.core.common.dto.GeneralResponse;
import com.ada.insurance_app.dto.HealthInsuranceDetailDto;
import com.ada.insurance_app.request.health.CreateHealthInsuranceDetailRequest;
import com.ada.insurance_app.request.health.UpdateHealthInsuranceDetailRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RequestMapping("/project/health")
public interface IHealthInsuranceController {


    ResponseEntity<GeneralResponse<HealthInsuranceDetailDto>> create(
            CreateHealthInsuranceDetailRequest request
    );


    ResponseEntity<GeneralResponse<HealthInsuranceDetailDto>> update(
            UUID id,
            UpdateHealthInsuranceDetailRequest request
    );


    ResponseEntity<GeneralResponse<Void>> delete(UUID id);


    ResponseEntity<GeneralResponse<HealthInsuranceDetailDto>> getById(UUID id);


    ResponseEntity<GeneralResponse<List<HealthInsuranceDetailDto>>> getAll();
}
