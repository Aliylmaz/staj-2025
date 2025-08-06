package com.ada.insurance_app.controller.home.Impl;

import com.ada.insurance_app.controller.home.IHomeInsuranceController;
import com.ada.insurance_app.core.common.dto.GeneralResponse;
import com.ada.insurance_app.dto.HomeInsuranceDetailDto;
import com.ada.insurance_app.entity.HomeInsuranceDetail;
import com.ada.insurance_app.request.home.CreateHomeInsuranceDetailRequest;
import com.ada.insurance_app.request.home.UpdateHomeInsuranceDetailRequest;
import com.ada.insurance_app.service.HomeInsuranceDetail.IHomeInsuranceDetailService;
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
@RequestMapping("/api/v1/home")
@RequiredArgsConstructor
public class HomeInsuranceControllerImpl implements IHomeInsuranceController {

    private final IHomeInsuranceDetailService homeInsuranceDetailService;


    @Override
    public ResponseEntity<GeneralResponse<HomeInsuranceDetailDto>> create(CreateHomeInsuranceDetailRequest request) {
        try {
            HomeInsuranceDetailDto createdDetail = homeInsuranceDetailService.create(request);
            return ResponseEntity.ok(GeneralResponse.success("Home insurance detail created successfully", createdDetail));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(GeneralResponse.error(
                    "Failed to create home insurance detail: " + e.getMessage(), HttpStatus.BAD_REQUEST));
        }
    }

    @Override
    public ResponseEntity<GeneralResponse<HomeInsuranceDetailDto>> update(UUID id, UpdateHomeInsuranceDetailRequest request) {
        try {
            HomeInsuranceDetailDto updatedDetail = homeInsuranceDetailService.update(id, request);
            return ResponseEntity.ok(GeneralResponse.success("Home insurance detail updated successfully", updatedDetail));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(GeneralResponse.error(
                    "Failed to update home insurance detail: " + e.getMessage(), HttpStatus.BAD_REQUEST));
        }
    }

    @Override
    public ResponseEntity<GeneralResponse<Void>> delete(UUID id) {
        try {
            homeInsuranceDetailService.delete(id);
            return ResponseEntity.ok(GeneralResponse.success("Home insurance detail deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(GeneralResponse.error(
                    "Failed to delete home insurance detail: " + e.getMessage(), HttpStatus.BAD_REQUEST));
        }
    }

    @Override
    public ResponseEntity<GeneralResponse<HomeInsuranceDetailDto>> getById(UUID id) {
        try {
            HomeInsuranceDetailDto detail = homeInsuranceDetailService.getById(id);
            return ResponseEntity.ok(GeneralResponse.success("Home insurance detail retrieved successfully", detail));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(GeneralResponse.error(
                    "Home insurance detail not found: " + e.getMessage(), HttpStatus.NOT_FOUND));
        }
    }

    @Override
    public ResponseEntity<GeneralResponse<List<HomeInsuranceDetailDto>>> getAll() {
        try {
            List<HomeInsuranceDetailDto> details = homeInsuranceDetailService.getAll();
            return ResponseEntity.ok(GeneralResponse.success("Home insurance details retrieved successfully", details));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(GeneralResponse.error(
                    "Failed to retrieve home insurance details: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }
}
