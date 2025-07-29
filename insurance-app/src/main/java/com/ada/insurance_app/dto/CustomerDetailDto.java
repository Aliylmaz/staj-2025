package com.ada.insurance_app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerDetailDto {
    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private List<VehicleDto> vehicles;
}
