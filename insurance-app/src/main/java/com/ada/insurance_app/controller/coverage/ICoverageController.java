package com.ada.insurance_app.controller.coverage;

import com.ada.insurance_app.core.common.dto.GeneralResponse;
import com.ada.insurance_app.core.enums.InsuranceType;
import com.ada.insurance_app.dto.CoverageDto;
import com.ada.insurance_app.request.coverage.CreateCoverageRequest;
import com.ada.insurance_app.request.coverage.UpdateCoverageRequest;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.UUID;

public interface ICoverageController {

     ResponseEntity<GeneralResponse<CoverageDto>> create(CreateCoverageRequest request);
     ResponseEntity<GeneralResponse<CoverageDto>> update(Long id, UpdateCoverageRequest request);
     ResponseEntity<GeneralResponse<Void>> delete(Long id);
     ResponseEntity<GeneralResponse<CoverageDto>> getById(Long id);
     ResponseEntity<GeneralResponse<List<CoverageDto>>> getAll();
     ResponseEntity<GeneralResponse<List<CoverageDto>>> getCoveragesByInsuranceType(InsuranceType insuranceType);

}
