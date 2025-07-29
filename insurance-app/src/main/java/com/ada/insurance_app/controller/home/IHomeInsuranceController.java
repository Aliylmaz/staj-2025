package com.ada.insurance_app.controller.home;

import com.ada.insurance_app.core.common.dto.GeneralResponse;
import com.ada.insurance_app.dto.HomeInsuranceDetailDto;
import com.ada.insurance_app.entity.HomeInsuranceDetail;
import com.ada.insurance_app.request.home.CreateHomeInsuranceDetailRequest;
import com.ada.insurance_app.request.home.UpdateHomeInsuranceDetailRequest;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.UUID;

public interface IHomeInsuranceController {
    ResponseEntity<GeneralResponse<HomeInsuranceDetailDto>> create(CreateHomeInsuranceDetailRequest request);

    ResponseEntity<GeneralResponse<HomeInsuranceDetailDto>> update(UUID id, UpdateHomeInsuranceDetailRequest request);

    ResponseEntity<GeneralResponse<Void>> delete(UUID id);

    ResponseEntity<GeneralResponse<HomeInsuranceDetailDto>> getById(UUID id);

    ResponseEntity<GeneralResponse<List<HomeInsuranceDetailDto>>> getAll();
}
