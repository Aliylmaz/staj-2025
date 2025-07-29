package com.ada.insurance_app.repository.auth.User;

import com.ada.insurance_app.dto.CustomerDto;
import com.ada.insurance_app.dto.OfferDto;
import com.ada.insurance_app.dto.PolicyDto;
import com.ada.insurance_app.entity.User;
import com.ada.insurance_app.request.customer.UpdateIndividualCustomerRequest;
import com.ada.insurance_app.request.offer.OfferUpdateRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface IAgentRepository extends JpaRepository<User, UUID> {

}
