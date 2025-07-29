package com.ada.insurance_app.response;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestAdminResponse {
    private String message;
    private Object data;
    private int status;
    private boolean success;
    private String timestamp;
    private String path;

    public static TestAdminResponse success(String message, Object data, String path) {
        return TestAdminResponse.builder()
                .message(message)
                .data(data)
                .status(HttpStatus.OK.value())
                .success(true)
                .timestamp(LocalDateTime.now().toString())
                .path(path)
                .build();
    }

    public static TestAdminResponse error(String message, String path) {
        return TestAdminResponse.builder()
                .message(message)
                .status(HttpStatus.BAD_REQUEST.value())
                .success(false)
                .timestamp(LocalDateTime.now().toString())
                .path(path)
                .build();
    }
}