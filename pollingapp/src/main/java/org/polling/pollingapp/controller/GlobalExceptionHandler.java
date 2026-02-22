package org.polling.pollingapp.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        String message = ex.getMessage();

        // Map known business errors to appropriate HTTP status codes
        HttpStatus status;
        if (message != null && (message.contains("already registered") || message.contains("already taken"))) {
            status = HttpStatus.CONFLICT; // 409
        } else if (message != null && (message.contains("not found") || message.contains("Invalid email or password"))) {
            status = HttpStatus.UNAUTHORIZED; // 401
        } else {
            status = HttpStatus.BAD_REQUEST; // 400
        }

        return ResponseEntity.status(status).body(Map.of("message", message != null ? message : "An error occurred"));
    }
}
