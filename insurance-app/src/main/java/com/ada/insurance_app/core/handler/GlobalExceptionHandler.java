package com.ada.insurance_app.core.handler;

import com.ada.insurance_app.core.common.dto.GeneralResponse;
import com.ada.insurance_app.core.exception.*;
import com.ada.insurance_app.response.UserResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.lang.IllegalArgumentException;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(InvalidPasswordException.class)
    public ResponseEntity<Object> handleInvalidPasswordException(InvalidPasswordException ex) {
        return buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Object> handleUserNotFoundException(UserNotFoundException ex) {
        return buildErrorResponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Object> handleIllegalArgumentException(IllegalArgumentException ex) {
        return buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }
    @ExceptionHandler(ExpiredPasswordResetTokenException.class)
    public ResponseEntity<Object> handleExpiredPasswordResetTokenException(ExpiredPasswordResetTokenException ex) {
        return buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }
    @ExceptionHandler(InvalidPasswordResetTokenException.class)
    public ResponseEntity<Object> handleInvalidPasswordResetTokenException(InvalidPasswordResetTokenException ex) {
        return buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }
    @ExceptionHandler(PasswordMismatchException.class)
    public ResponseEntity<Object> handlePasswordMismatchException(PasswordMismatchException ex) {
        return buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }
    @ExceptionHandler(UnauthorizedAccessException.class)
    public ResponseEntity<Object> handleUnauthorizedAccessException(UnauthorizedAccessException ex) {
        return buildErrorResponse(HttpStatus.UNAUTHORIZED, ex.getMessage());
    }
    @ExceptionHandler(CoverageNotFoundException.class)
    public ResponseEntity<Object> handleCoverageNotFoundException(CoverageNotFoundException ex) {
        return buildErrorResponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }
    @ExceptionHandler(CustomerNotFoundException.class)
    public ResponseEntity<Object> handleCustomerNotFoundException(CustomerNotFoundException ex) {
        return buildErrorResponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }
    @ExceptionHandler(DuplicateEntityException.class)
    public ResponseEntity<Object> handleDuplicateEntityException(DuplicateEntityException ex) {
        return buildErrorResponse(HttpStatus.CONFLICT, ex.getMessage());
    }
    @ExceptionHandler(InvalidCustomerTypeException.class)
    public ResponseEntity<Object> handleInvalidCustomerTypeException(InvalidCustomerTypeException ex) {
        return buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }
    @ExceptionHandler(InvalidInsuranceTypeException.class)
    public ResponseEntity<Object> handleInvalidInsuranceTypeException(InvalidInsuranceTypeException ex) {
        return buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }
    @ExceptionHandler(InvalidRequestException.class)
    public ResponseEntity<Object> handleInvalidRequestException(InvalidRequestException ex) {
        return buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }
    @ExceptionHandler(OfferAlreadyProcessedException.class)
    public ResponseEntity<Object> handleOfferAlreadyProcessedException(OfferAlreadyProcessedException ex) {
        return buildErrorResponse(HttpStatus.CONFLICT, ex.getMessage());
    }
    @ExceptionHandler(PolicyNotFoundException.class)
    public ResponseEntity<Object> handlePolicyNotFoundException(PolicyNotFoundException ex) {
        return buildErrorResponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }
    @ExceptionHandler(UnauthorizedRoleAccessException.class)
    public ResponseEntity<Object> handleUnauthorizedRoleAccessException(UnauthorizedRoleAccessException ex) {
        return buildErrorResponse(HttpStatus.FORBIDDEN, ex.getMessage());
    }
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Object> handleResourceNotFoundException(ResourceNotFoundException ex) {
        return buildErrorResponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }








    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationException(MethodArgumentNotValidException ex) {
        var errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> new UserResponse(error.getField(), error.getDefaultMessage()))
                .collect(Collectors.toList());

        return new ResponseEntity<>(
                GeneralResponse.error("Validation failed", errors, HttpStatus.BAD_REQUEST),
                HttpStatus.BAD_REQUEST
        );
    }






    private ResponseEntity<Object> buildErrorResponse(HttpStatus status, String message) {
        Map<String, Object> errorDetails = new LinkedHashMap<>();
        errorDetails.put("timestamp", LocalDateTime.now());
        errorDetails.put("status", status.value());
        errorDetails.put("error", status.getReasonPhrase());
        errorDetails.put("message", message);

        return new ResponseEntity<>(errorDetails, status);
    }
}
