package com.srivelva.controller;

import com.srivelva.dto.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import org.springframework.validation.FieldError;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // ── 400 · Bean Validation (@Valid on @RequestBody) ─────────────────────
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationErrors(
            MethodArgumentNotValidException ex, HttpServletRequest request) {

        log(request, ex);
        Map<String, String> fieldErrors = ex.getBindingResult()
                .getAllErrors().stream()
                .filter(e -> e instanceof FieldError)
                .map(e -> (FieldError) e)
                .collect(Collectors.toMap(
                        FieldError::getField,
                        fe -> fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "Invalid value",
                        (a, b) -> a,
                        LinkedHashMap::new));

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.validationError("Validation failed", fieldErrors));
    }

    // ── 400 · Hibernate/JPA constraint violation (save fails) ─────────────
    // Fires when an entity with @NotBlank / @NotNull fails validation at the
    // persistence layer — e.g. ProductController building a Product manually
    // and calling productRepository.save() without @Valid on the endpoint.
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleConstraintViolation(
            ConstraintViolationException ex, HttpServletRequest request) {

        log(request, ex);
        Map<String, String> fieldErrors = ex.getConstraintViolations().stream()
                .collect(Collectors.toMap(
                        v -> {
                            String path = v.getPropertyPath().toString();
                            // Strip leading method/param path to get just the field name
                            int dot = path.lastIndexOf('.');
                            return dot >= 0 ? path.substring(dot + 1) : path;
                        },
                        ConstraintViolation::getMessage,
                        (a, b) -> a,
                        LinkedHashMap::new));

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.validationError("Validation failed", fieldErrors));
    }

    // ── 400 · Multipart parse failure (bad Content-Type / boundary) ──────
    // Fires when Spring's multipart resolver can't parse the request —
    // typically because the frontend sent Content-Type without a boundary.
    @ExceptionHandler(org.springframework.web.multipart.MultipartException.class)
    public ResponseEntity<ApiResponse<Void>> handleMultipartError(
            org.springframework.web.multipart.MultipartException ex,
            HttpServletRequest request) {

        log(request, ex);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(
                    "Multipart request parse failed. Ensure the request uses correct "
                    + "multipart/form-data format with a valid boundary. Detail: "
                    + ex.getMessage()));
    }

    // ── 413 · File too large ───────────────────────────────────────────────
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<Void>> handleFileTooLarge(
            MaxUploadSizeExceededException ex, HttpServletRequest request) {

        log(request, ex);
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(ApiResponse.error("File is too large. Maximum allowed size is 10 MB."));
    }

    // ── 400 · Malformed JSON body ──────────────────────────────────────────
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> handleMalformedJson(
            HttpMessageNotReadableException ex, HttpServletRequest request) {

        log(request, ex);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Request body is missing or contains invalid JSON"));
    }

    // ── 400 · Wrong path-variable type ────────────────────────────────────
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Void>> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex, HttpServletRequest request) {

        log(request, ex);
        String msg = String.format("Parameter '%s' must be of type %s",
                ex.getName(),
                ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(msg));
    }

    // ── 400 · Missing required @RequestParam ──────────────────────────────
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiResponse<Void>> handleMissingParam(
            MissingServletRequestParameterException ex, HttpServletRequest request) {

        log(request, ex);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Required parameter '" + ex.getParameterName() + "' is missing"));
    }

    // ── 404 · No route matched ────────────────────────────────────────────
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(
            NoResourceFoundException ex, HttpServletRequest request) {

        // 404s for static resources are noisy — log at debug level only
        System.out.printf("[WARN] 404 %s %s%n", request.getMethod(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("No endpoint found for: "
                        + request.getMethod() + " " + request.getRequestURI()));
    }

    // ── 405 · HTTP method not allowed ────────────────────────────────────
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<Void>> handleMethodNotAllowed(
            HttpRequestMethodNotSupportedException ex, HttpServletRequest request) {

        log(request, ex);
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED)
                .body(ApiResponse.error("HTTP method '" + ex.getMethod()
                        + "' is not supported for this endpoint"));
    }

    // ── 500 · Catch-all ───────────────────────────────────────────────────
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneric(
            Exception ex, HttpServletRequest request) {

        // Print the FULL stack trace so the root cause is visible in the Spring Boot console
        System.err.printf("[ERROR] %s %s → %s: %s%n",
                request.getMethod(), request.getRequestURI(),
                ex.getClass().getName(),
                ex.getMessage() != null ? ex.getMessage() : "(no message)");
        ex.printStackTrace(System.err);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("An unexpected error occurred. Please try again later."));
    }

    // ── Helper ────────────────────────────────────────────────────────────

    private ApiResponse<Map<String, String>> buildValidationResponse(Map<String, String> fieldErrors) {
        return ApiResponse.validationError("Validation failed", fieldErrors);
    }

    /**
     * Logs every handled exception at a consistent format.
     * The full stack trace is included so the Spring Boot console shows the root cause.
     */
    private void log(HttpServletRequest request, Exception ex) {
        System.err.printf("[WARN] %s %s → %s: %s%n",
                request.getMethod(), request.getRequestURI(),
                ex.getClass().getSimpleName(),
                ex.getMessage() != null ? ex.getMessage() : "(no message)");
        ex.printStackTrace(System.err);
    }
}
