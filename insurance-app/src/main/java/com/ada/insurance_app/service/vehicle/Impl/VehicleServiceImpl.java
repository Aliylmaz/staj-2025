package com.ada.insurance_app.service.vehicle.Impl;

import com.ada.insurance_app.core.exception.CustomerNotFoundException;
import com.ada.insurance_app.core.exception.DuplicateEntityException;
import com.ada.insurance_app.core.exception.VehicleNotFoundException;
import com.ada.insurance_app.dto.VehicleDto;
import com.ada.insurance_app.entity.Customer;
import com.ada.insurance_app.entity.Vehicle;
import com.ada.insurance_app.mapper.VehicleMapper;
import com.ada.insurance_app.repository.ICustomerRepository;
import com.ada.insurance_app.repository.IVehicleRepository;
import com.ada.insurance_app.request.vehicle.AddVehicleRequest;
import com.ada.insurance_app.request.vehicle.UpdateVehicleRequest;
import com.ada.insurance_app.service.vehicle.IVehicleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class VehicleServiceImpl implements IVehicleService {
    
    private final IVehicleRepository vehicleRepository;
    private final ICustomerRepository customerRepository;
    private final VehicleMapper vehicleMapper;

    @Override
    @Transactional
    public VehicleDto addVehicle(VehicleDto vehicleDto, UUID customerId) {
        // Validate input
        validateVehicleDto(vehicleDto);
        
        // Check if customer exists
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found with id: " + customerId));
        
        // Check for duplicate plate number
        if (vehicleRepository.existsByPlateNumber(vehicleDto.getPlateNumber())) {
            throw new DuplicateEntityException("Vehicle with plate number " + vehicleDto.getPlateNumber() + " already exists");
        }
        
        // Check for duplicate VIN
        if (vehicleDto.getVin() != null && vehicleRepository.existsByVin(vehicleDto.getVin())) {
            throw new DuplicateEntityException("Vehicle with VIN " + vehicleDto.getVin() + " already exists");
        }
        
        Vehicle vehicle = vehicleMapper.toEntity(vehicleDto);
        vehicle.setCustomer(customer);
        
        Vehicle savedVehicle = vehicleRepository.save(vehicle);
        log.info("Vehicle added successfully: {} for customer: {}", vehicle.getPlateNumber(), customerId);
        
        return vehicleMapper.toDto(savedVehicle);
    }

    @Override
    @Transactional
    public VehicleDto updateVehicle(UUID vehicleId, VehicleDto vehicleDto) {
        // Validate input
        validateVehicleDto(vehicleDto);
        
        // Check if vehicle exists
        Vehicle existingVehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new VehicleNotFoundException("Vehicle not found with id: " + vehicleId));
        
        // Check for duplicate plate number (excluding current vehicle)
        if (!existingVehicle.getPlateNumber().equals(vehicleDto.getPlateNumber()) && 
            vehicleRepository.existsByPlateNumber(vehicleDto.getPlateNumber())) {
            throw new DuplicateEntityException("Vehicle with plate number " + vehicleDto.getPlateNumber() + " already exists");
        }
        
        // Check for duplicate VIN (excluding current vehicle)
        if (vehicleDto.getVin() != null && !vehicleDto.getVin().equals(existingVehicle.getVin()) && 
            vehicleRepository.existsByVin(vehicleDto.getVin())) {
            throw new DuplicateEntityException("Vehicle with VIN " + vehicleDto.getVin() + " already exists");
        }
        
        // Update vehicle fields
        existingVehicle.setMake(vehicleDto.getMake());
        existingVehicle.setModel(vehicleDto.getModel());
        existingVehicle.setYear(vehicleDto.getYear());
        existingVehicle.setPlateNumber(vehicleDto.getPlateNumber());
        existingVehicle.setVin(vehicleDto.getVin());
        existingVehicle.setEngineNumber(vehicleDto.getEngineNumber());
        existingVehicle.setFuelType(vehicleDto.getFuelType());
        existingVehicle.setGearType(vehicleDto.getGearType());
        existingVehicle.setColor(vehicleDto.getColor());
        
        Vehicle updatedVehicle = vehicleRepository.save(existingVehicle);
        log.info("Vehicle updated successfully: {} with id: {}", updatedVehicle.getPlateNumber(), vehicleId);
        
        return vehicleMapper.toDto(updatedVehicle);
    }

    @Override
    @Transactional
    public void deleteVehicle(UUID vehicleId) {
        // Check if vehicle exists
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new VehicleNotFoundException("Vehicle not found with id: " + vehicleId));
        
        // Check if vehicle has active policies (business rule)
        // TODO: Add policy service dependency to check for active policies
        
        vehicleRepository.deleteById(vehicleId);
        log.info("Vehicle deleted successfully with id: {}", vehicleId);
    }

    @Override
    public VehicleDto getVehicleById(UUID vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new VehicleNotFoundException("Vehicle not found with id: " + vehicleId));
        
        return vehicleMapper.toDto(vehicle);
    }

    @Override
    public VehicleDto getVehicleByPlate(String plateNumber) {
        if (!StringUtils.hasText(plateNumber)) {
            throw new IllegalArgumentException("Plate number cannot be empty");
        }
        
        Vehicle vehicle = vehicleRepository.findByPlateNumber(plateNumber)
                .orElseThrow(() -> new VehicleNotFoundException("Vehicle not found with plate number: " + plateNumber));
        
        return vehicleMapper.toDto(vehicle);
    }

    @Override
    public VehicleDto getVehicleByVin(String vin) {
        if (!StringUtils.hasText(vin)) {
            throw new IllegalArgumentException("VIN cannot be empty");
        }
        
        Vehicle vehicle = vehicleRepository.findByVin(vin)
                .orElseThrow(() -> new VehicleNotFoundException("Vehicle not found with VIN: " + vin));
        
        return vehicleMapper.toDto(vehicle);
    }

    @Override
    public VehicleDto getVehicleByEngineNumber(String engineNumber) {
        if (!StringUtils.hasText(engineNumber)) {
            throw new IllegalArgumentException("Engine number cannot be empty");
        }
        
        Vehicle vehicle = vehicleRepository.findByEngineNumber(engineNumber)
                .orElseThrow(() -> new VehicleNotFoundException("Vehicle not found with engine number: " + engineNumber));
        
        return vehicleMapper.toDto(vehicle);
    }

    @Override
    public List<VehicleDto> getVehiclesByCustomer(UUID customerId) {
        // Check if customer exists
        if (!customerRepository.existsById(customerId)) {
            throw new CustomerNotFoundException("Customer not found with id: " + customerId);
        }
        
        List<Vehicle> vehicles = vehicleRepository.findByCustomerId(customerId);
        return vehicles.stream()
                .map(vehicleMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<VehicleDto> searchVehiclesByMake(String make) {
        if (!StringUtils.hasText(make)) {
            throw new IllegalArgumentException("Make cannot be empty");
        }
        
        List<Vehicle> vehicles = vehicleRepository.findByMakeContainingIgnoreCase(make);
        return vehicles.stream()
                .map(vehicleMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<VehicleDto> searchVehiclesByModel(String model) {
        if (!StringUtils.hasText(model)) {
            throw new IllegalArgumentException("Model cannot be empty");
        }
        
        List<Vehicle> vehicles = vehicleRepository.findByModelContainingIgnoreCase(model);
        return vehicles.stream()
                .map(vehicleMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<VehicleDto> getAllVehicles() {
        List<Vehicle> vehicles = vehicleRepository.findAll();
        return vehicles.stream()
                .map(vehicleMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public boolean existsByPlateNumber(String plateNumber) {
        if (!StringUtils.hasText(plateNumber)) {
            return false;
        }
        return vehicleRepository.existsByPlateNumber(plateNumber);
    }

    @Override
    public boolean existsByVin(String vin) {
        if (!StringUtils.hasText(vin)) {
            return false;
        }
        return vehicleRepository.existsByVin(vin);
    }

    @Override
    public long countByCustomerId(UUID customerId) {
        if (!customerRepository.existsById(customerId)) {
            throw new CustomerNotFoundException("Customer not found with id: " + customerId);
        }
        return vehicleRepository.countByCustomerId(customerId);
    }

    @Override
    @Transactional
    public VehicleDto createVehicleFromRequest(AddVehicleRequest request) {
        // Validate request
        validateAddVehicleRequest(request);
        
        // Check if customer exists
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found with id: " + request.getCustomerId()));
        
        // Check for duplicate plate number
        if (vehicleRepository.existsByPlateNumber(request.getPlateNumber())) {
            throw new DuplicateEntityException("Vehicle with plate number " + request.getPlateNumber() + " already exists");
        }
        
        // Check for duplicate VIN
        if (vehicleRepository.existsByVin(request.getVin())) {
            throw new DuplicateEntityException("Vehicle with VIN " + request.getVin() + " already exists");
        }
        
        // Check for duplicate engine number
        if (vehicleRepository.existsByEngineNumber(request.getEngineNumber())) {
            throw new DuplicateEntityException("Vehicle with engine number " + request.getEngineNumber() + " already exists");
        }
        
        // Create vehicle entity from request
        Vehicle vehicle = new Vehicle();
        vehicle.setCustomer(customer);
        vehicle.setMake(request.getMake());
        vehicle.setModel(request.getModel());
        vehicle.setYear(request.getYear());
        vehicle.setPlateNumber(request.getPlateNumber());
        vehicle.setVin(request.getVin());
        vehicle.setEngineNumber(request.getEngineNumber());
        vehicle.setFuelType(request.getFuelType());
        vehicle.setGearType(request.getGearType());
        vehicle.setUsageType(request.getUsageType());
        vehicle.setKilometers(request.getKilometers());
        vehicle.setRegistrationDate(request.getRegistrationDate());
        vehicle.setCreatedAt(LocalDateTime.now());
        
        Vehicle savedVehicle = vehicleRepository.save(vehicle);
        log.info("Vehicle created from request successfully: {} for customer: {}", savedVehicle.getPlateNumber(), request.getCustomerId());
        
        return vehicleMapper.toDto(savedVehicle);
    }

    @Override
    @Transactional
    public VehicleDto updateVehicleFromRequest(UUID vehicleId, UpdateVehicleRequest request) {
        // Validate request
        validateUpdateVehicleRequest(request);
        
        // Check if vehicle exists
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new VehicleNotFoundException("Vehicle not found with id: " + vehicleId));
        
        // Update vehicle fields if provided
        if (StringUtils.hasText(request.getMake())) {
            vehicle.setMake(request.getMake());
        }
        
        if (StringUtils.hasText(request.getModel())) {
            vehicle.setModel(request.getModel());
        }
        
        if (request.getYear() != null) {
            vehicle.setYear(request.getYear());
        }
        
        if (StringUtils.hasText(request.getPlateNumber())) {
            // Check for duplicate plate number (excluding current vehicle)
            if (!request.getPlateNumber().equals(vehicle.getPlateNumber()) && 
                vehicleRepository.existsByPlateNumber(request.getPlateNumber())) {
                throw new DuplicateEntityException("Vehicle with plate number " + request.getPlateNumber() + " already exists");
            }
            vehicle.setPlateNumber(request.getPlateNumber());
        }
        
        if (StringUtils.hasText(request.getVin())) {
            // Check for duplicate VIN (excluding current vehicle)
            if (!request.getVin().equals(vehicle.getVin()) && 
                vehicleRepository.existsByVin(request.getVin())) {
                throw new DuplicateEntityException("Vehicle with VIN " + request.getVin() + " already exists");
            }
            vehicle.setVin(request.getVin());
        }
        
        if (StringUtils.hasText(request.getEngineNumber())) {
            // Check for duplicate engine number (excluding current vehicle)
            if (!request.getEngineNumber().equals(vehicle.getEngineNumber()) && 
                vehicleRepository.existsByEngineNumber(request.getEngineNumber())) {
                throw new DuplicateEntityException("Vehicle with engine number " + request.getEngineNumber() + " already exists");
            }
            vehicle.setEngineNumber(request.getEngineNumber());
        }
        
        if (request.getFuelType() != null) {
            vehicle.setFuelType(request.getFuelType());
        }
        
        if (request.getGearType() != null) {
            vehicle.setGearType(request.getGearType());
        }
        
        if (request.getUsageType() != null) {
            vehicle.setUsageType(request.getUsageType());
        }
        
        if (request.getKilometers() != null) {
            vehicle.setKilometers(request.getKilometers());
        }
        
        if (request.getRegistrationDate() != null) {
            vehicle.setRegistrationDate(request.getRegistrationDate());
        }
        
        vehicle.setUpdatedAt(LocalDateTime.now());
        
        Vehicle updatedVehicle = vehicleRepository.save(vehicle);
        log.info("Vehicle updated from request successfully: {} with id: {}", updatedVehicle.getPlateNumber(), vehicleId);
        
        return vehicleMapper.toDto(updatedVehicle);
    }

    // Private validation methods
    private void validateVehicleDto(VehicleDto vehicleDto) {
        if (vehicleDto == null) {
            throw new IllegalArgumentException("Vehicle data cannot be null");
        }
        
        if (!StringUtils.hasText(vehicleDto.getPlateNumber())) {
            throw new IllegalArgumentException("Plate number is required");
        }
        
        if (!StringUtils.hasText(vehicleDto.getMake())) {
            throw new IllegalArgumentException("Make is required");
        }
        
        if (!StringUtils.hasText(vehicleDto.getModel())) {
            throw new IllegalArgumentException("Model is required");
        }
        
        if (vehicleDto.getYear() == null || vehicleDto.getYear() < 1900 || vehicleDto.getYear() > 2030) {
            throw new IllegalArgumentException("Invalid year: must be between 1900 and 2030");
        }
        
        // Validate plate number format (basic Turkish format)
        if (!vehicleDto.getPlateNumber().matches("^[0-9]{2}[A-Z]{1,3}[0-9]{2,4}$")) {
            throw new IllegalArgumentException("Invalid plate number format");
        }
    }
    
    private void validateAddVehicleRequest(AddVehicleRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("AddVehicleRequest cannot be null");
        }
        
        if (!StringUtils.hasText(request.getMake())) {
            throw new IllegalArgumentException("Make is required");
        }
        
        if (!StringUtils.hasText(request.getModel())) {
            throw new IllegalArgumentException("Model is required");
        }
        
        if (request.getYear() == null || request.getYear() < 1900 || request.getYear() > 2030) {
            throw new IllegalArgumentException("Invalid year: must be between 1900 and 2030");
        }
        
        if (!StringUtils.hasText(request.getPlateNumber())) {
            throw new IllegalArgumentException("Plate number is required");
        }
        
        if (!StringUtils.hasText(request.getVin())) {
            throw new IllegalArgumentException("VIN is required");
        }
        
        if (!StringUtils.hasText(request.getEngineNumber())) {
            throw new IllegalArgumentException("Engine number is required");
        }
        
        if (request.getCustomerId() == null) {
            throw new IllegalArgumentException("Customer ID is required");
        }
        
        // Validate plate number format (basic Turkish format)
        if (!request.getPlateNumber().matches("^[0-9]{2}[A-Z]{1,3}[0-9]{2,4}$")) {
            throw new IllegalArgumentException("Invalid plate number format");
        }
        
        // Validate VIN format (17 characters)
        if (request.getVin().length() != 17) {
            throw new IllegalArgumentException("VIN must be exactly 17 characters");
        }
    }
    
    private void validateUpdateVehicleRequest(UpdateVehicleRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("UpdateVehicleRequest cannot be null");
        }
        
        // At least one field should be provided for update
        if (!StringUtils.hasText(request.getMake()) && !StringUtils.hasText(request.getModel()) && 
            request.getYear() == null && !StringUtils.hasText(request.getPlateNumber()) &&
            !StringUtils.hasText(request.getVin()) && !StringUtils.hasText(request.getEngineNumber()) &&
            request.getFuelType() == null && request.getGearType() == null && 
            request.getUsageType() == null && request.getKilometers() == null &&
            request.getRegistrationDate() == null) {
            throw new IllegalArgumentException("At least one field must be provided for update");
        }
        
        // Validate year if provided
        if (request.getYear() != null && (request.getYear() < 1900 || request.getYear() > 2030)) {
            throw new IllegalArgumentException("Invalid year: must be between 1900 and 2030");
        }
        
        // Validate plate number format if provided
        if (StringUtils.hasText(request.getPlateNumber()) && 
            !request.getPlateNumber().matches("^[0-9]{2}[A-Z]{1,3}[0-9]{2,4}$")) {
            throw new IllegalArgumentException("Invalid plate number format");
        }
        
        // Validate VIN format if provided
        if (StringUtils.hasText(request.getVin()) && request.getVin().length() != 17) {
            throw new IllegalArgumentException("VIN must be exactly 17 characters");
        }
    }
}
