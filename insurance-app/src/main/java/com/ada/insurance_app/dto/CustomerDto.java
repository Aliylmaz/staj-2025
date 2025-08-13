package com.ada.insurance_app.dto;

import com.ada.insurance_app.core.enums.CustomerType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CustomerDto {
    private UUID id;
    private String customerNumber;
    private CustomerType customerType;
    private UserDto user;
    
    // User bilgileri için convenience fields
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;

    // Bireysel için
    private String nationalId;
    private LocalDateTime dateOfBirth;

    // Kurumsal için
    private String companyName;
    private String taxNumber;
    private String companyRegistrationNumber;

    private String address;
    private String city;
    private String country;
    private String postalCode;
}
