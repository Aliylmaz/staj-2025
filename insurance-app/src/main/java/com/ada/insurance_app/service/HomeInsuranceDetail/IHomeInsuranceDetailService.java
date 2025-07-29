package com.ada.insurance_app.service.HomeInsuranceDetail;

import com.ada.insurance_app.dto.HomeInsuranceDetailDto;
import com.ada.insurance_app.entity.HomeInsuranceDetail;
import com.ada.insurance_app.request.home.CreateHomeInsuranceDetailRequest;
import com.ada.insurance_app.request.home.UpdateHomeInsuranceDetailRequest;

import java.util.List;
import java.util.UUID;

public interface IHomeInsuranceDetailService {

    HomeInsuranceDetailDto create(CreateHomeInsuranceDetailRequest request);

    HomeInsuranceDetailDto update(UUID id, UpdateHomeInsuranceDetailRequest request);

    void delete(UUID id);

    HomeInsuranceDetailDto getById(UUID id);

    List<HomeInsuranceDetailDto> getAll();
}
