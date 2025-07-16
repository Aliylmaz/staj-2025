package com.ada.insurance_app.repository;

import com.ada.insurance_app.entity.Offer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IOfferRepository extends JpaRepository<Offer,Long> {
}
