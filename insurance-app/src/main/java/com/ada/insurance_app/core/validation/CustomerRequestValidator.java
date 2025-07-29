package com.ada.insurance_app.core.validation;

import com.ada.insurance_app.request.customer.AddCorporateCustomerRequest;
import com.ada.insurance_app.request.customer.AddIndividualCustomerRequest;
import com.ada.insurance_app.request.customer.BaseCustomerRequest;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.util.StringUtils;

public class CustomerRequestValidator implements ConstraintValidator<ValidCustomerRequest, BaseCustomerRequest> {

    @Override
    public boolean isValid(BaseCustomerRequest request, ConstraintValidatorContext context) {
        if (request instanceof AddIndividualCustomerRequest individual) {
            return StringUtils.hasText(individual.getNationalId()) && individual.getDateOfBirth() != null;
        } else if (request instanceof AddCorporateCustomerRequest corporate) {
            return StringUtils.hasText(corporate.getTaxNumber())
                    && StringUtils.hasText(corporate.getCompanyName())
                    && StringUtils.hasText(corporate.getCompanyRegistrationNumber());
        }
        return true; // fallback, ileride genişletme için
    }
}
