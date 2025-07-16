package com.ada.insurance_app.repository;

import com.ada.insurance_app.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IDocumetRepository extends JpaRepository<Document,Long> {
}
