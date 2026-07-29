package com.srivelva.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Generic response envelope.
 * {
 *   "success": true,
 *   "message": "Product created",
 *   "data": { ... }
 * }
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private boolean success;
    private String  message;
    private T       data;

    private ApiResponse() {}

    public static <T> ApiResponse<T> ok(T data) {
        ApiResponse<T> r = new ApiResponse<>();
        r.success = true;
        r.data    = data;
        return r;
    }

    /**
     * Message-only success response with no data payload.
     * Returns ApiResponse&lt;Void&gt; so it is compatible with
     * ResponseEntity&lt;ApiResponse&lt;Void&gt;&gt; without type-inference errors.
     *
     *   // Before (compile error — T inferred as String, not Void):
     *   return ResponseEntity.ok(ApiResponse.ok("Done"));
     *
     *   // After (compiles cleanly):
     *   return ResponseEntity.ok(ApiResponse.success("Done"));
     */
    public static ApiResponse<Void> success(String message) {
        ApiResponse<Void> r = new ApiResponse<>();
        r.success = true;
        r.message = message;
        return r;
    }

    public static <T> ApiResponse<T> ok(String message, T data) {
        ApiResponse<T> r = new ApiResponse<>();
        r.success = true;
        r.message = message;
        r.data    = data;
        return r;
    }

    public static <T> ApiResponse<T> error(String message) {
        ApiResponse<T> r = new ApiResponse<>();
        r.success = false;
        r.message = message;
        return r;
    }

    /**
     * Used by GlobalExceptionHandler to return field-level validation errors
     * with success=false and the errors map in the data field.
     */
    public static <T> ApiResponse<T> validationError(String message, T fieldErrors) {
        ApiResponse<T> r = new ApiResponse<>();
        r.success = false;
        r.message = message;
        r.data    = fieldErrors;
        return r;
    }

    public boolean isSuccess() { return success; }
    public String  getMessage() { return message; }
    public T       getData()    { return data; }
}
