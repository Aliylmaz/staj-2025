package com.ada.insurance_app.service.coverage;

import com.ada.insurance_app.dto.CoverageDto;
import com.ada.insurance_app.request.coverage.CreateCoverageRequest;
import com.ada.insurance_app.request.coverage.UpdateCoverageRequest;

import java.util.List;

public interface ICoverageService {

    CoverageDto create(CreateCoverageRequest request);

    CoverageDto update(Long id, UpdateCoverageRequest request);

    void delete(Long id);

    CoverageDto getById(Long id);

    List<CoverageDto> getAll();

    List<CoverageDto> getCoveragesByPolicy(Long policyId);
}
