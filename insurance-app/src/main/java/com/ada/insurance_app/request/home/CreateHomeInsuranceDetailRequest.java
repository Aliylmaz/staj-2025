package com.ada.insurance_app.request.home;

import lombok.Data;

import java.util.UUID;

@Data
public class CreateHomeInsuranceDetailRequest {
    private String address;
    private int buildingAge;
    private double squareMeters;
    private boolean earthquakeResistance;
    private Integer floorNumber;
    private Integer totalFloors;
    private UUID customerId;
    
    public boolean getEarthquakeResistance() {
        return earthquakeResistance;
    }
    
    public void setEarthquakeResistance(boolean earthquakeResistance) {
        this.earthquakeResistance = earthquakeResistance;
    }
}