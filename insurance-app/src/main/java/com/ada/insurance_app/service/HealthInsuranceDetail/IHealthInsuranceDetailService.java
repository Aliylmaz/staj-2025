package com.ada.insurance_app.service.HealthInsuranceDetail;

import com.ada.insurance_app.dto.HealthInsuranceDetailDto;
import com.ada.insurance_app.request.health.CreateHealthInsuranceDetailRequest;
import com.ada.insurance_app.request.health.UpdateHealthInsuranceDetailRequest;

import java.util.List;
import java.util.UUID;

public interface IHealthInsuranceDetailService {

    HealthInsuranceDetailDto create(CreateHealthInsuranceDetailRequest request);

    HealthInsuranceDetailDto update(UUID id, UpdateHealthInsuranceDetailRequest request);

    void delete(UUID id);

    HealthInsuranceDetailDto getById(UUID id);

    List<HealthInsuranceDetailDto> getAll();
}
