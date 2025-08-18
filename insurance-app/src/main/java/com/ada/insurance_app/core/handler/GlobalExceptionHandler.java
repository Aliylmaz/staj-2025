package com.ada.insurance_app.core.handler;

import com.ada.insurance_app.core.common.dto.GeneralResponse;
import com.ada.insurance_app.core.exception.*;
import com.ada.insurance_app.core.exception.IllegalArgumentException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;



@RestControllerAdvice
public class GlobalExceptionHandler {

    // --- DTO @Valid (body) ---
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public GeneralResponse<Object> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        FieldError::getDefaultMessage,
                        (a,b)->a, LinkedHashMap::new));
        return GeneralResponse.error("Validation failed", fieldErrors, HttpStatus.BAD_REQUEST);
    }


    // --- Path/query param validation (jakarta validation) ---
    @ExceptionHandler(ConstraintViolationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public GeneralResponse<Object> handleConstraint(ConstraintViolationException ex) {
        Map<String, String> errors = ex.getConstraintViolations()
                .stream()
                .collect(Collectors.toMap(
                        v -> v.getPropertyPath().toString(),
                        ConstraintViolation::getMessage,
                        (a, b) -> a,
                        LinkedHashMap::new
                ));

        return GeneralResponse.error("Constraint violation", errors, HttpStatus.BAD_REQUEST);
    }

    // --- Bozuk body / parse hataları (JSON, enum, tarih) ---
    @ExceptionHandler(HttpMessageNotReadableException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public GeneralResponse<Object> handleUnreadable(HttpMessageNotReadableException ex) {
        return GeneralResponse.error("Malformed request body", null, HttpStatus.BAD_REQUEST);
    }

    // --- UUID ve diğer type mismatch ---
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public GeneralResponse<Object> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String msg = "Invalid parameter";
        if (ex.getRequiredType() != null && ex.getRequiredType().equals(java.util.UUID.class)) {
            msg = "Invalid UUID format: " + ex.getValue();
        }
        Map<String, Object> info = Map.of("param", ex.getName(), "value", ex.getValue());
        return GeneralResponse.error(msg, info, HttpStatus.BAD_REQUEST);
    }

    // --- Security ---
    @ExceptionHandler({ BadCredentialsException.class, AuthenticationException.class })
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public GeneralResponse<Object> handleAuth(Exception ex) {
        return GeneralResponse.error("Authentication failed", null, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public GeneralResponse<Object> handleAccessDenied(Exception ex) {
        return GeneralResponse.error("Access denied", null, HttpStatus.FORBIDDEN);
    }

    // --- Persistence (unique key vs.) ---
    @ExceptionHandler(DataIntegrityViolationException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public GeneralResponse<Object> handleDataIntegrity(DataIntegrityViolationException ex) {
        return GeneralResponse.error("Data integrity violation", null, HttpStatus.CONFLICT);
    }

    // --- Domain bazlı istisnalar (sizin existing’ler) ---
    @ExceptionHandler({
            InvalidPasswordException.class, ExpiredPasswordResetTokenException.class,
            InvalidPasswordResetTokenException.class, PasswordMismatchException.class,
            InvalidCustomerTypeException.class, InvalidInsuranceTypeException.class,
            InvalidRequestException.class, IllegalArgumentException.class
    })
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public GeneralResponse<Object> handleBadRequest(RuntimeException ex) {
        return GeneralResponse.error(ex.getMessage(), null, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler({
            UserNotFoundException.class, CoverageNotFoundException.class,
            CustomerNotFoundException.class, PolicyNotFoundException.class,
            ResourceNotFoundException.class
    })
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public GeneralResponse<Object> handleNotFound(RuntimeException ex) {
        return GeneralResponse.error(ex.getMessage(), null, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler({
            DuplicateEntityException.class, OfferAlreadyProcessedException.class
    })
    @ResponseStatus(HttpStatus.CONFLICT)
    public GeneralResponse<Object> handleConflict(RuntimeException ex) {
        return GeneralResponse.error(ex.getMessage(), null, HttpStatus.CONFLICT);
    }

    // --- Catch-all ---
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public GeneralResponse<Object> handleUnknown(Exception ex) {
        // burada log.error ile stacktrace basın
        return GeneralResponse.error("Unexpected error", null, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
