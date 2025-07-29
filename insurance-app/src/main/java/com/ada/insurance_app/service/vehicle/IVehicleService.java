package com.ada.insurance_app.service.vehicle;

import com.ada.insurance_app.dto.VehicleDto;
import com.ada.insurance_app.request.vehicle.AddVehicleRequest;
import com.ada.insurance_app.request.vehicle.UpdateVehicleRequest;
import java.util.List;
import java.util.UUID;

public interface IVehicleService {
    VehicleDto addVehicle(VehicleDto vehicleDto, UUID customerId);
    VehicleDto updateVehicle(UUID vehicleId, VehicleDto vehicleDto);
    void deleteVehicle(UUID vehicleId);
    VehicleDto getVehicleById(UUID vehicleId);
    VehicleDto getVehicleByPlate(String plateNumber);
    VehicleDto getVehicleByVin(String vin);
    VehicleDto getVehicleByEngineNumber(String engineNumber);
    List<VehicleDto> getVehiclesByCustomer(UUID customerId);
    List<VehicleDto> searchVehiclesByMake(String make);
    List<VehicleDto> searchVehiclesByModel(String model);
    List<VehicleDto> getAllVehicles();
    boolean existsByPlateNumber(String plateNumber);
    boolean existsByVin(String vin);
    long countByCustomerId(UUID customerId);
    
    // Request sınıflarını kullanan yeni metodlar
    VehicleDto createVehicleFromRequest(AddVehicleRequest request);
    VehicleDto updateVehicleFromRequest(UUID vehicleId, UpdateVehicleRequest request);
}
