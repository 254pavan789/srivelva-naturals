package com.srivelva.dto;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.srivelva.model.Order;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;

public class OrderResponse {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private Long   id;
    private String customerName;
    private String phone;
    private String email;
    private String address;
    private String notes;
    private Double totalAmount;
    private String status;
    private String paymentStatus;
    private String whatsappUrl;
    private LocalDateTime createdAt;
    private List<Map<String, Object>> items;

    // Cancellation
    private String        cancellationReason;
    private LocalDateTime cancelledAt;
    private String        refundStatus;

    public static String buildWhatsAppUrl(String rawPhone, Long orderId,
                                          String customerName, String status) {
        if (rawPhone == null || rawPhone.isBlank()) return null;
        String digits = rawPhone.replaceAll("\\D", "");
        String phone  = (digits.startsWith("91") && digits.length() == 12)
                ? digits : "91" + digits;
        String statusLabel = switch (status == null ? "" : status.toUpperCase()) {
            case "PENDING"   -> "pending review";
            case "CONFIRMED" -> "confirmed";
            case "PAID"      -> "paid and being processed";
            case "SHIPPED"   -> "shipped and on its way";
            case "DELIVERED" -> "delivered";
            default          -> status != null ? status.toLowerCase() : "updated";
        };
        String message = String.format(
            "Hello %s, your order (ID: #%d) is now %s. "
          + "Thank you for shopping with Sri Velva Naturals!",
            customerName == null ? "Customer" : customerName, orderId, statusLabel);
        return "https://wa.me/" + phone + "?text="
             + java.net.URLEncoder.encode(message, java.nio.charset.StandardCharsets.UTF_8);
    }

    public static OrderResponse from(Order order) {
        OrderResponse r    = new OrderResponse();
        r.id               = order.getId();
        r.customerName     = order.getCustomerName();
        r.phone            = order.getPhone();
        r.email            = order.getEmail();
        r.address          = order.getAddress();
        r.notes            = order.getNotes();
        r.totalAmount      = order.getTotalAmount();
        r.status           = order.getStatus();
        r.paymentStatus    = order.getPaymentStatus();
        r.createdAt        = order.getCreatedAt();
        r.items            = parseItems(order.getItemsJson());
        r.cancellationReason = order.getCancellationReason();
        r.cancelledAt      = order.getCancelledAt();
        r.refundStatus     = order.getRefundStatus();
        r.whatsappUrl      = buildWhatsAppUrl(
                order.getPhone(), order.getId(),
                order.getCustomerName(), order.getStatus());
        return r;
    }

    private static List<Map<String, Object>> parseItems(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return MAPPER.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    // Getters
    public Long   getId()               { return id; }
    public String getCustomerName()     { return customerName; }
    public String getPhone()            { return phone; }
    public String getEmail()            { return email; }
    public String getAddress()          { return address; }
    public String getNotes()            { return notes; }
    public Double getTotalAmount()      { return totalAmount; }
    public String getStatus()           { return status; }
    public String getPaymentStatus()    { return paymentStatus; }
    public String getWhatsappUrl()      { return whatsappUrl; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public List<Map<String, Object>> getItems() { return items; }
    public String        getCancellationReason() { return cancellationReason; }
    public LocalDateTime getCancelledAt()        { return cancelledAt; }
    public String        getRefundStatus()       { return refundStatus; }
}
