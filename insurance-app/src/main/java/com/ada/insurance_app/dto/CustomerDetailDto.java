package com.ada.insurance_app.dto;

import java.util.List;
import java.util.UUID;

public class CustomerDetailDto {
    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private List<VehicleDto> vehicles;
}
