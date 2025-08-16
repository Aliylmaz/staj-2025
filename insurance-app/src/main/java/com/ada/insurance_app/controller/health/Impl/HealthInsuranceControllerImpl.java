package com.ada.insurance_app.controller.health.Impl;

import com.ada.insurance_app.controller.health.IHealthInsuranceController;
import com.ada.insurance_app.core.common.dto.GeneralResponse;
import com.ada.insurance_app.dto.HealthInsuranceDetailDto;
import com.ada.insurance_app.request.health.CreateHealthInsuranceDetailRequest;
import com.ada.insurance_app.request.health.UpdateHealthInsuranceDetailRequest;
import com.ada.insurance_app.service.HealthInsuranceDetail.IHealthInsuranceDetailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/health")
@RequiredArgsConstructor
public class HealthInsuranceControllerImpl implements IHealthInsuranceController {

    private final IHealthInsuranceDetailService healthInsuranceDetailService;


    @Override
    public ResponseEntity<GeneralResponse<HealthInsuranceDetailDto>> create(CreateHealthInsuranceDetailRequest request) {
        try {
            if (request.getOfferId() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(GeneralResponse.error(
                        "OfferId is required for health insurance detail creation", HttpStatus.BAD_REQUEST));
            }
            HealthInsuranceDetailDto createdDetail = healthInsuranceDetailService.create(request);
            return ResponseEntity.ok(GeneralResponse.success("Health insurance detail created successfully", createdDetail));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(GeneralResponse.error(
                    "Failed to create health insurance detail: " + e.getMessage(), HttpStatus.BAD_REQUEST));
        }
    }

    @Override
    public ResponseEntity<GeneralResponse<HealthInsuranceDetailDto>> update(UUID id, UpdateHealthInsuranceDetailRequest request) {
        try {
            if (request.getOfferId() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(GeneralResponse.error(
                        "OfferId is required for health insurance detail update", HttpStatus.BAD_REQUEST));
            }
            HealthInsuranceDetailDto updatedDetail = healthInsuranceDetailService.update(id, request);
            return ResponseEntity.ok(GeneralResponse.success("Health insurance detail updated successfully", updatedDetail));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(GeneralResponse.error(
                    "Failed to update health insurance detail: " + e.getMessage(), HttpStatus.BAD_REQUEST));
        }
    }

    @Override
    public ResponseEntity<GeneralResponse<Void>> delete(UUID id) {
        try {
            healthInsuranceDetailService.delete(id);
            return ResponseEntity.ok(GeneralResponse.success("Health insurance detail deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(GeneralResponse.error(
                    "Failed to delete health insurance detail: " + e.getMessage(), HttpStatus.BAD_REQUEST));
        }
    }

    @Override
    public ResponseEntity<GeneralResponse<HealthInsuranceDetailDto>> getById(UUID id) {
        try {
            HealthInsuranceDetailDto detail = healthInsuranceDetailService.getById(id);
            return ResponseEntity.ok(GeneralResponse.success("Health insurance detail retrieved successfully", detail));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(GeneralResponse.error(
                    "Health insurance detail not found: " + e.getMessage(), HttpStatus.NOT_FOUND));
        }
    }

    @Override
    public ResponseEntity<GeneralResponse<List<HealthInsuranceDetailDto>>> getAll() {
        try {
            List<HealthInsuranceDetailDto> details = healthInsuranceDetailService.getAll();
            return ResponseEntity.ok(GeneralResponse.success("Health insurance details retrieved successfully", details));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(GeneralResponse.error(
                    "Failed to retrieve health insurance details: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }
}
