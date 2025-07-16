package com.ada.insurance_app.repository;

import com.ada.insurance_app.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ICustomerRepository extends JpaRepository<Customer, UUID> {
}
