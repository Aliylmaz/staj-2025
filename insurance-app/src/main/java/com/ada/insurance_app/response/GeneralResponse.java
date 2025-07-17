package com.ada.insurance_app.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

import javax.swing.text.DateFormatter;
import java.time.format.DateTimeFormatter;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeneralResponse<T> {
    private  String message;
    private T data;
    private  int status;
    private boolean success;
    private String timestamp;

    private static final DateTimeFormatter FORMATTER= DateTimeFormatter.ISO_DATE_TIME;


    public static <T> GeneralResponse<T> success(String message, T data) {
        return GeneralResponse.<T>builder()
                .message(message)
                .data(data)
                .status(200)
                .success(true)
                .timestamp(java.time.LocalDateTime.now().format(FORMATTER))
                .build();
    }
    public static <T> GeneralResponse<T> success(String message, T data, HttpStatus status) {
        return GeneralResponse.<T>builder()
                .message(message)
                .data(data)
                .status(status.value())
                .success(true)
                .timestamp(java.time.LocalDateTime.now().format(FORMATTER))
                .build();
    }

    public static <T> GeneralResponse<T> error(String message, HttpStatus status) {
        return GeneralResponse.<T>builder()
                .message(message)
                .status(status.value())
                .success(false)
                .timestamp(java.time.LocalDateTime.now().format(FORMATTER))
                .build();
    }

    public static <T> GeneralResponse<T> error(String message, T data, HttpStatus status) {
        return GeneralResponse.<T>builder()
                .message(message)
                .data(data)
                .status(status.value())
                .success(false)
                .timestamp(java.time.LocalDateTime.now().format(FORMATTER))
                .build();
    }

}
