package com.ada.insurance_app.core.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = CustomerRequestValidator.class)
@Target({ ElementType.TYPE })
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidCustomerRequest {
    String message() default "Invalid customer fields based on customer type";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
