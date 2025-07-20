package com.ada.insurance_app.repository;

import com.ada.insurance_app.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ICustomerRepository extends JpaRepository<Customer, UUID> {


    Optional<Customer> findByUserId(UUID userId);


    Optional<Customer> findByCustomerNumber(String customerNumber);


    Optional<Customer> findByNationalId(String nationalId);


    Optional<Customer> findByTaxNumber(String taxNumber);


    List<Customer> findByCityIgnoreCase(String city);


    List<Customer> findByCompanyNameContainingIgnoreCase(String companyName);


    @Query("SELECT c FROM Customer c WHERE c.user.email = :email")
    Optional<Customer> findByUserEmail(String email);
}
