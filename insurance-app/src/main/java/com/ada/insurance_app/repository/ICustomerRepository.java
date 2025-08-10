package com.ada.insurance_app.repository;

import com.ada.insurance_app.entity.Customer;
import com.ada.insurance_app.core.enums.CustomerType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ICustomerRepository extends JpaRepository<Customer, UUID> {
    Optional<Customer> findByUserId(UUID userId);

    Optional<Customer> findCustomerByCustomerNumber(String customerNumber);

    List<Customer> findCustomerByCustomerType(CustomerType customerType);

    List<Customer> findByCity(String city);

    Optional<Customer> findByUser_Email(String userEmail);

    long countByCustomerType(CustomerType customerType);


    boolean existsByTaxNumber(@NotBlank(message = "Tax number is required") String taxNumber);

    boolean existsByNationalId(@NotBlank @Size(min = 11, max = 11, message = "National ID must be 11 characters long") String nationalId);


    @Query("SELECT COUNT(DISTINCT p.customer.id) FROM Policy p WHERE p.agent.id = :agentId")
    Long countByAgentId(UUID agentId);
    
    @Query("SELECT DISTINCT c FROM Customer c WHERE c.id IN " +
           "(SELECT DISTINCT o.customer.id FROM Offer o WHERE o.agent.id = :agentId) OR " +
           "c.id IN (SELECT DISTINCT p.customer.id FROM Policy p WHERE p.agent.id = :agentId)")
    List<Customer> findCustomersByAgentId(@Param("agentId") UUID agentId);
    
    @Query("SELECT COUNT(DISTINCT c.id) FROM Customer c WHERE c.id IN " +
           "(SELECT DISTINCT o.customer.id FROM Offer o WHERE o.agent.id = :agentId) OR " +
           "c.id IN (SELECT DISTINCT p.customer.id FROM Policy p WHERE p.agent.id = :agentId)")
    Long countCustomersByAgentId(@Param("agentId") UUID agentId);
}
