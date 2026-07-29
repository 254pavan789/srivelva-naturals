package com.srivelva.dto;

public class VariantDto {
    private Long   id;
    private String size;
    private Double price;
    private int    stockQuantity;

    public VariantDto() {}
    public VariantDto(Long id, String size, Double price, int stockQuantity) {
        this.id            = id;
        this.size          = size;
        this.price         = price;
        this.stockQuantity = stockQuantity;
    }

    public Long   getId()                      { return id; }
    public void   setId(Long id)               { this.id = id; }
    public String getSize()                    { return size; }
    public void   setSize(String size)         { this.size = size; }
    public Double getPrice()                   { return price; }
    public void   setPrice(Double price)       { this.price = price; }
    public int    getStockQuantity()           { return stockQuantity; }
    public void   setStockQuantity(int qty)    { this.stockQuantity = qty; }
}
