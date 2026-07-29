package com.srivelva.model;

import jakarta.persistence.*;

@Entity
@Table(name = "product_variants")
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // e.g. "500ml", "1 Litre", "500g", "1 Kg", "30ml"
    @Column(nullable = false, length = 50)
    private String size;

    @Column(nullable = false)
    private Double price;

    @Column(name = "stock_quantity", nullable = false)
    private int stockQuantity = 10;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    public ProductVariant() {}

    public ProductVariant(String size, Double price, int stockQuantity, Product product) {
        this.size          = size;
        this.price         = price;
        this.stockQuantity = stockQuantity;
        this.product       = product;
    }

    public Long    getId()                          { return id; }
    public void    setId(Long id)                   { this.id = id; }
    public String  getSize()                        { return size; }
    public void    setSize(String size)             { this.size = size; }
    public Double  getPrice()                       { return price; }
    public void    setPrice(Double price)           { this.price = price; }
    public int     getStockQuantity()               { return stockQuantity; }
    public void    setStockQuantity(int qty)        { this.stockQuantity = qty; }
    public Product getProduct()                     { return product; }
    public void    setProduct(Product product)      { this.product = product; }
}
