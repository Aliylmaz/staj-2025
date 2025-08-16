package com.ada.insurance_app.controller.vehicle;

import com.ada.insurance_app.core.common.dto.GeneralResponse;
import com.ada.insurance_app.dto.VehicleDto;
import com.ada.insurance_app.request.vehicle.AddVehicleRequest;
import com.ada.insurance_app.request.vehicle.UpdateVehicleRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

public interface IVehicleController {

    ResponseEntity<GeneralResponse<VehicleDto>> updateVehicle(UUID vehicleId, VehicleDto vehicleDto);

    ResponseEntity<GeneralResponse<Void>> deleteVehicle(UUID vehicleId);

    ResponseEntity<GeneralResponse<VehicleDto>> getVehicleById(UUID vehicleId);

    ResponseEntity<GeneralResponse<VehicleDto>> getVehicleByPlate(String plateNumber);

    ResponseEntity<GeneralResponse<VehicleDto>> getVehicleByVin(String vin);

    ResponseEntity<GeneralResponse<VehicleDto>> getVehicleByEngineNumber(String engineNumber);

    ResponseEntity<GeneralResponse<List<VehicleDto>>> getVehiclesByCustomer(UUID customerId);

    ResponseEntity<GeneralResponse<List<VehicleDto>>> searchVehiclesByMake(String make);

    ResponseEntity<GeneralResponse<List<VehicleDto>>> searchVehiclesByModel(String model);

    ResponseEntity<GeneralResponse<List<VehicleDto>>> getAllVehicles();

    ResponseEntity<GeneralResponse<Boolean>> existsByPlateNumber(String plateNumber);

    ResponseEntity<GeneralResponse<Boolean>> existsByVin(String vin);

    ResponseEntity<GeneralResponse<Long>> countByCustomerId(UUID customerId);
    
    // Request sınıflarını kullanan yeni endpoint'ler
    @PostMapping("/create")
    ResponseEntity<GeneralResponse<VehicleDto>> createVehicle(@RequestBody AddVehicleRequest request);
    
    @PutMapping("/{vehicleId}")
    ResponseEntity<GeneralResponse<VehicleDto>> updateVehicleFromRequest(@PathVariable UUID vehicleId, @RequestBody UpdateVehicleRequest request);
}