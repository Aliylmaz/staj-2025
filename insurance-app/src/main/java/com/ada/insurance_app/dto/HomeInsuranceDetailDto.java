package com.ada.insurance_app.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class HomeInsuranceDetailDto {
    private UUID id;
    private String address;
    private int buildingAge;
    private double squareMeters;
    private boolean earthquakeResistance;
    private Integer floorNumber;

    private Integer totalFloors;

    private UUID customerId;
} 