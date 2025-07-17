package com.ada.insurance_app.repository;

import com.ada.insurance_app.entity.Policy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IPolicyRepository extends JpaRepository<Policy,Long> {
}
