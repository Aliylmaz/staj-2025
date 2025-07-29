package com.ada.insurance_app.repository;

import com.ada.insurance_app.entity.Customer;
import com.ada.insurance_app.core.enums.CustomerType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ICustomerRepository extends JpaRepository<Customer, UUID> {
    Optional<Customer> findByUserId(UUID userId);
    Optional<Customer> findByCustomerNumber(String customerNumber);
    List<Customer> findByCustomerType(CustomerType customerType);
    List<Customer> findByCityIgnoreCase(String city);
    @Query("SELECT c FROM Customer c WHERE c.user.email = :email")
    Optional<Customer> findByUserEmail(String email);
    long countByCustomerType(CustomerType customerType);


    boolean existsByTaxNumber(@NotBlank(message = "Tax number is required") String taxNumber);

    boolean existsByNationalId(@NotBlank @Size(min = 11, max = 11, message = "National ID must be 11 characters long") String nationalId);
}
