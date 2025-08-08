package com.ada.insurance_app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AgentDto {
    private UUID id;
    private UUID userId;
    private String agentNumber;
    private String name;
    private String surname;
    private String phoneNumber;
    private String email;
    private List<Long> policyIds;

    private String address;
    private String city;
    private String country;
    private  String postalCode;


}