package com.ada.insurance_app.core.validation;

import com.ada.insurance_app.core.enums.CustomerType;
import com.ada.insurance_app.request.customer.AddCustomerRequest;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.util.StringUtils;

public class CustomerRequestValidator implements ConstraintValidator<ValidCustomerRequest, AddCustomerRequest> {

    @Override
    public boolean isValid(AddCustomerRequest request, ConstraintValidatorContext context) {
        if (request.getCustomerType() == CustomerType.INDIVIDUAL) {
            return StringUtils.hasText(request.getNationalId()) && request.getDateOfBirth() != null;
        } else if (request.getCustomerType() == CustomerType.CORPORATE) {
            return StringUtils.hasText(request.getTaxNumber())
                    && StringUtils.hasText(request.getCompanyName())
                    && StringUtils.hasText(request.getCompanyRegistrationNumber());
        }
        return true; // fallback
    }
}
