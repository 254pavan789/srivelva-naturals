package com.srivelva.dto;

/**
 * Request body for PUT /api/orders/{id}/cancel
 * Cancellation reason is optional — customer may leave it blank.
 */
public class CancelOrderRequest {

    private String reason;

    public String getReason() { return reason; }
    public void   setReason(String reason) { this.reason = reason; }
}
