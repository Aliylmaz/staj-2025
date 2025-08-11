package com.ada.insurance_app.controller.coverage.Impl;

import com.ada.insurance_app.controller.coverage.ICoverageController;
import com.ada.insurance_app.core.common.dto.GeneralResponse;
import com.ada.insurance_app.core.enums.InsuranceType;
import com.ada.insurance_app.dto.CoverageDto;
import com.ada.insurance_app.request.coverage.CreateCoverageRequest;
import com.ada.insurance_app.request.coverage.UpdateCoverageRequest;
import com.ada.insurance_app.service.coverage.ICoverageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/coverages")
@RequiredArgsConstructor
public class CoverageControllerImpl implements ICoverageController {

    private final ICoverageService coverageService;

    @Override
    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GeneralResponse<CoverageDto>> create(CreateCoverageRequest request) {
        try {
            CoverageDto createdCoverage = coverageService.create(request);
            return ResponseEntity.ok(GeneralResponse.success("Coverage created successfully", createdCoverage));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(GeneralResponse.error(
                    "Failed to create coverage: " + e.getMessage(), HttpStatus.BAD_REQUEST));
        }
    }

    @Override
    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GeneralResponse<CoverageDto>> update(Long id, UpdateCoverageRequest request) {
        try {
            CoverageDto updatedCoverage = coverageService.update(id, request);
            return ResponseEntity.ok(GeneralResponse.success("Coverage updated successfully", updatedCoverage));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(GeneralResponse.error(
                    "Failed to update coverage: " + e.getMessage(), HttpStatus.BAD_REQUEST));
        }
    }

    @Override
    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GeneralResponse<Void>> delete(Long id) {
        try {
            coverageService.delete(id);
            return ResponseEntity.ok(GeneralResponse.success("Coverage deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(GeneralResponse.error(
                    "Failed to delete coverage: " + e.getMessage(), HttpStatus.BAD_REQUEST));
        }
    }

    @Override
    @GetMapping("/get/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT', 'CUSTOMER')")
    public ResponseEntity<GeneralResponse<CoverageDto>> getById(Long id) {
        try {
            CoverageDto coverage = coverageService.getById(id);
            return ResponseEntity.ok(GeneralResponse.success("Coverage retrieved successfully", coverage));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(GeneralResponse.error(
                    "Coverage not found: " + e.getMessage(), HttpStatus.NOT_FOUND));
        }
    }

    @Override
    @GetMapping("/get-all")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT', 'CUSTOMER')")
    public ResponseEntity<GeneralResponse<List<CoverageDto>>> getAll() {
        try {
            List<CoverageDto> coverages = coverageService.getAll();
            return ResponseEntity.ok(GeneralResponse.success("Coverages retrieved successfully", coverages));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(GeneralResponse.error(
                    "Failed to retrieve coverages: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @Override
    @GetMapping("/by-insurance-type")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT', 'CUSTOMER')")
    public ResponseEntity<GeneralResponse<List<CoverageDto>>> getCoveragesByInsuranceType(@RequestParam InsuranceType type) {
        try {
            List<CoverageDto> coverages = coverageService.getCoveragesByInsuranceType(type);
            return ResponseEntity.ok(GeneralResponse.success("Coverages retrieved successfully", coverages));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(GeneralResponse.error(
                    "Failed to retrieve coverages by insurance type: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @GetMapping("/by-offer/{offerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT', 'CUSTOMER')")
    public ResponseEntity<GeneralResponse<List<CoverageDto>>> getCoveragesByOfferId(@PathVariable Long offerId) {
        try {
            List<CoverageDto> coverages = coverageService.getCoveragesByOfferId(offerId);
            return ResponseEntity.ok(GeneralResponse.success("Coverages retrieved successfully for offer", coverages));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(GeneralResponse.error(
                    "Failed to retrieve coverages for offer: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }
}
