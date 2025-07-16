package com.ada.insurance_app.repository;

import com.ada.insurance_app.entity.Claim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface IClaimRepository extends JpaRepository<Claim, UUID> {
}
