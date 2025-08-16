package com.ada.insurance_app.repository;

import com.ada.insurance_app.entity.Vehicle;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IVehicleRepository extends JpaRepository<Vehicle, UUID> {


    Optional<Vehicle> findByPlateNumber(String plateNumber);


    Optional<Vehicle> findByVin(String vin);


    Optional<Vehicle> findByEngineNumber(String engineNumber);


    @Query("SELECT v FROM Vehicle v WHERE v.offer.id = :offerId")
    Optional<Vehicle> findByOfferId(@Param("offerId") Long offerId);


    List<Vehicle> findByMakeContainingIgnoreCase(String make);

    List<Vehicle> findByModelContainingIgnoreCase(String model);


    boolean existsByPlateNumber(String plateNumber);

    boolean existsByVin(String vin);

    List<Vehicle> findAllByCustomer_Id(UUID customerId);


    @Query("SELECT CASE WHEN COUNT(v) > 0 THEN true ELSE false END FROM Vehicle v WHERE v.engineNumber = :engineNumber")
    boolean existsByEngineNumber(String engineNumber);
}
