package com.srivelva.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Customer name is required")
    @Column(name = "customer_name", nullable = false, length = 200)
    private String customerName;

    @NotBlank(message = "Phone number is required")
    @Column(nullable = false, length = 15)
    private String phone;

    @NotBlank(message = "Email address is required")
    @Email(message = "Email must be a valid email address")
    @Column(nullable = false, length = 200)
    private String email;

    @NotBlank(message = "Delivery address is required")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String address;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @NotNull(message = "Total amount is required")
    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;

    @Column(name = "items_json", columnDefinition = "TEXT")
    private String itemsJson;

    @Column(length = 50)
    private String status = "PENDING";

    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "refund_status", length = 30)
    private String refundStatus = "NOT_APPLICABLE";

    /**
     * Payment verification status (set by admin after verifying UPI payment).
     * Values: PENDING_VERIFICATION | VERIFIED | REJECTED
     */
    @Column(name = "payment_status", length = 50)
    private String paymentStatus = "PENDING_VERIFICATION";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Constructors
    public Order() {}

    // Getters & Setters
    public Long getId()                              { return id; }
    public void setId(Long id)                       { this.id = id; }

    public String getCustomerName()                  { return customerName; }
    public void setCustomerName(String name)         { this.customerName = name; }

    public String getPhone()                         { return phone; }
    public void setPhone(String phone)               { this.phone = phone; }

    public String getEmail()                         { return email; }
    public void setEmail(String email)               { this.email = email; }

    public String getAddress()                       { return address; }
    public void setAddress(String address)           { this.address = address; }

    public String getNotes()                         { return notes; }
    public void setNotes(String notes)               { this.notes = notes; }

    public Double getTotalAmount()                   { return totalAmount; }
    public void setTotalAmount(Double amount)        { this.totalAmount = amount; }

    public String getItemsJson()                     { return itemsJson; }
    public void setItemsJson(String itemsJson)       { this.itemsJson = itemsJson; }

    public String getStatus()                        { return status; }
    public void setStatus(String status)             { this.status = status; }

    public String getCancellationReason()            { return cancellationReason; }
    public void setCancellationReason(String reason) { this.cancellationReason = reason; }

    public LocalDateTime getCancelledAt()            { return cancelledAt; }
    public void setCancelledAt(LocalDateTime t)      { this.cancelledAt = t; }

    public String getRefundStatus()                  { return refundStatus; }
    public void setRefundStatus(String s)            { this.refundStatus = s; }

    public String getPaymentStatus()                 { return paymentStatus; }
    public void setPaymentStatus(String s)           { this.paymentStatus = s; }

    public LocalDateTime getCreatedAt()              { return createdAt; }
}
