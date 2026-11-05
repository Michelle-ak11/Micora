
package com.micora.backend.Config;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handle(ResponseStatusException e) {
        String message = e.getReason() == null ? "" : e.getReason();
        return ResponseEntity.status(e.getStatusCode())
            .body(Map.of("status", e.getStatusCode().value(), "message", message));
    }
}