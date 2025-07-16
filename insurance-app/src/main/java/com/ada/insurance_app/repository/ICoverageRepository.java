package com.ada.insurance_app.repository;

import com.ada.insurance_app.entity.Coverage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ICoverageRepository extends JpaRepository<Coverage, Long> {
}
