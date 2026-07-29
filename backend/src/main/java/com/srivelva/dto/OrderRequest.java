package com.srivelva.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class OrderRequest {

    @NotBlank(message = "Customer name is required")
    private String customerName;

    @NotBlank(message = "Phone number is required")
    private String phone;

    @NotBlank(message = "Email address is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    @NotBlank(message = "Delivery address is required")
    private String address;

    private String notes;

    @NotNull(message = "Total amount is required")
    private Double totalAmount;

    private List<OrderItemDto> items;

    public String getCustomerName()              { return customerName; }
    public void   setCustomerName(String name)   { this.customerName = name; }
    public String getPhone()                     { return phone; }
    public void   setPhone(String phone)         { this.phone = phone; }
    public String getEmail()                     { return email; }
    public void   setEmail(String email)         { this.email = email; }
    public String getAddress()                   { return address; }
    public void   setAddress(String address)     { this.address = address; }
    public String getNotes()                     { return notes; }
    public void   setNotes(String notes)         { this.notes = notes; }
    public Double getTotalAmount()               { return totalAmount; }
    public void   setTotalAmount(Double amount)  { this.totalAmount = amount; }
    public List<OrderItemDto> getItems()         { return items; }
    public void   setItems(List<OrderItemDto> i) { this.items = i; }

    public static class OrderItemDto {
        private Long    productId;
        private Long    variantId;
        private String  productName;
        private String  size;
        private Integer quantity;
        private Double  price;

        public Long    getProductId()               { return productId; }
        public void    setProductId(Long id)        { this.productId = id; }
        public Long    getVariantId()               { return variantId; }
        public void    setVariantId(Long id)        { this.variantId = id; }
        public String  getProductName()             { return productName; }
        public void    setProductName(String name)  { this.productName = name; }
        public String  getSize()                    { return size; }
        public void    setSize(String size)         { this.size = size; }
        public Integer getQuantity()                { return quantity; }
        public void    setQuantity(Integer qty)     { this.quantity = qty; }
        public Double  getPrice()                   { return price; }
        public void    setPrice(Double price)       { this.price = price; }
    }
}
