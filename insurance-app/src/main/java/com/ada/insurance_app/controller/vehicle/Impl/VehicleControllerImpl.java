package com.ada.insurance_app.controller.vehicle.Impl;

import com.ada.insurance_app.controller.vehicle.IVehicleController;
import com.ada.insurance_app.core.common.dto.GeneralResponse;
import com.ada.insurance_app.dto.VehicleDto;
import com.ada.insurance_app.request.vehicle.AddVehicleRequest;
import com.ada.insurance_app.request.vehicle.UpdateVehicleRequest;
import com.ada.insurance_app.service.vehicle.IVehicleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/vehicles")
@RequiredArgsConstructor
public class VehicleControllerImpl implements IVehicleController {

    private final IVehicleService vehicleService;

    // addVehicle endpointi kaldırıldı, sadece createVehicle kullanılacak.

    @Override
    @PutMapping("/update/{vehicleId}")
    public ResponseEntity<GeneralResponse<VehicleDto>> updateVehicle(@PathVariable UUID vehicleId,
                                                                    @RequestBody VehicleDto vehicleDto) {
        VehicleDto updatedVehicle = vehicleService.updateVehicle(vehicleId, vehicleDto);
        return ResponseEntity.ok(GeneralResponse.success("Vehicle updated successfully", updatedVehicle));
    }

    @Override
    @DeleteMapping("/delete/{vehicleId}")
    public ResponseEntity<GeneralResponse<Void>> deleteVehicle(@PathVariable UUID vehicleId) {
        vehicleService.deleteVehicle(vehicleId);
        return ResponseEntity.ok(GeneralResponse.success("Vehicle deleted successfully", null));
    }

    @Override
    @GetMapping("/get/{vehicleId}")
    public ResponseEntity<GeneralResponse<VehicleDto>> getVehicleById(@PathVariable UUID vehicleId) {
        VehicleDto vehicle = vehicleService.getVehicleById(vehicleId);
        return ResponseEntity.ok(GeneralResponse.success("Vehicle retrieved successfully", vehicle));
    }

    @Override
    @GetMapping("/plate/{plateNumber}")
    public ResponseEntity<GeneralResponse<VehicleDto>> getVehicleByPlate(@PathVariable String plateNumber) {
        VehicleDto vehicle = vehicleService.getVehicleByPlate(plateNumber);
        return ResponseEntity.ok(GeneralResponse.success("Vehicle retrieved successfully", vehicle));
    }

    @Override
    @GetMapping("/vin/{vin}")
    public ResponseEntity<GeneralResponse<VehicleDto>> getVehicleByVin(@PathVariable String vin) {
        VehicleDto vehicle = vehicleService.getVehicleByVin(vin);
        return ResponseEntity.ok(GeneralResponse.success("Vehicle retrieved successfully", vehicle));
    }

    @Override
    @GetMapping("/engine/{engineNumber}")
    public ResponseEntity<GeneralResponse<VehicleDto>> getVehicleByEngineNumber(@PathVariable String engineNumber) {
        VehicleDto vehicle = vehicleService.getVehicleByEngineNumber(engineNumber);
        return ResponseEntity.ok(GeneralResponse.success("Vehicle retrieved successfully", vehicle));
    }

    @Override
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<GeneralResponse<List<VehicleDto>>> getVehiclesByCustomer(@PathVariable UUID customerId) {
        List<VehicleDto> vehicles = vehicleService.getVehiclesByCustomer(customerId);
        return ResponseEntity.ok(GeneralResponse.success("Vehicles retrieved successfully", vehicles));
    }

    @Override
    @GetMapping("/search/make")
    public ResponseEntity<GeneralResponse<List<VehicleDto>>> searchVehiclesByMake(@RequestParam String make) {
        List<VehicleDto> vehicles = vehicleService.searchVehiclesByMake(make);
        return ResponseEntity.ok(GeneralResponse.success("Vehicles retrieved successfully", vehicles));
    }

    @Override
    @GetMapping("/search/model")
    public ResponseEntity<GeneralResponse<List<VehicleDto>>> searchVehiclesByModel(@RequestParam String model) {
        List<VehicleDto> vehicles = vehicleService.searchVehiclesByModel(model);
        return ResponseEntity.ok(GeneralResponse.success("Vehicles retrieved successfully", vehicles));
    }

    @Override
    @GetMapping
    public ResponseEntity<GeneralResponse<List<VehicleDto>>> getAllVehicles() {
        List<VehicleDto> vehicles = vehicleService.getAllVehicles();
        return ResponseEntity.ok(GeneralResponse.success("All vehicles retrieved successfully", vehicles));
    }

    @Override
    @GetMapping("/check/plate/{plateNumber}")
    public ResponseEntity<GeneralResponse<Boolean>> existsByPlateNumber(@PathVariable String plateNumber) {
        boolean exists = vehicleService.existsByPlateNumber(plateNumber);
        return ResponseEntity.ok(GeneralResponse.success("Plate number check completed", exists));
    }

    @Override
    @GetMapping("/check/vin/{vin}")
    public ResponseEntity<GeneralResponse<Boolean>> existsByVin(@PathVariable String vin) {
        boolean exists = vehicleService.existsByVin(vin);
        return ResponseEntity.ok(GeneralResponse.success("VIN check completed", exists));
    }

    @Override
    @GetMapping("/count/customer/{customerId}")
    public ResponseEntity<GeneralResponse<Long>> countByCustomerId(@PathVariable UUID customerId) {
        long count = vehicleService.countByCustomerId(customerId);
        return ResponseEntity.ok(GeneralResponse.success("Vehicle count retrieved successfully", count));
    }
    
    @Override
    @PostMapping("/create")
    public ResponseEntity<GeneralResponse<VehicleDto>> createVehicle(@RequestBody AddVehicleRequest request) {
        try {
            if (request.getOfferId() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                        GeneralResponse.error("OfferId is required for vehicle creation", HttpStatus.BAD_REQUEST)
                );
            }
            log.info("Creating vehicle for customer: {} with plate: {}", request.getCustomerId(), request.getPlateNumber());
            VehicleDto vehicle = vehicleService.createVehicleFromRequest(request, request.getCustomerId(), request.getOfferId());
            
            return ResponseEntity.ok(GeneralResponse.success("Vehicle created successfully", vehicle));
        } catch (Exception e) {
            log.error("Error creating vehicle: {}", e.getMessage());
            
           return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    GeneralResponse.error("Failed to create vehicle: " + e.getMessage(), HttpStatus.BAD_REQUEST)
            );
        }
    }
    
    @Override
    @PutMapping("/update/request{vehicleId}")
    public ResponseEntity<GeneralResponse<VehicleDto>> updateVehicleFromRequest(@PathVariable UUID vehicleId, @RequestBody UpdateVehicleRequest request) {
        try {
            log.info("Updating vehicle: {}", vehicleId);
            VehicleDto vehicle = vehicleService.updateVehicleFromRequest(vehicleId, request);
            
          return ResponseEntity.ok(GeneralResponse.success("Vehicle updated successfully", vehicle));
        } catch (Exception e) {
            log.error("Error updating vehicle: {}", e.getMessage());
            
           return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    GeneralResponse.error("Failed to update vehicle: " + e.getMessage(), HttpStatus.BAD_REQUEST)
            );
        }
    }
}