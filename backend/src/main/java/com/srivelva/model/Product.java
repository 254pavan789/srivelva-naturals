package com.srivelva.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Product name is required")
    @Column(nullable = false, length = 200)
    private String name;

    /** Base price — used when no variants exist */
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    @Column(nullable = false)
    private Double price;

    @NotBlank(message = "Description is required")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(length = 500)
    private String imageUrl;

    @NotBlank(message = "Category is required")
    @Column(nullable = false, length = 100)
    private String category;

    @Column(name = "stock_quantity", nullable = false)
    private int stockQuantity = 10;

    /** Size variants — fetched eagerly so product API returns them inline */
    @JsonIgnoreProperties({"product"})
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("price ASC")
    private List<ProductVariant> variants = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @Transient
    public String getStockStatus() {
        if (stockQuantity > 5)  return "IN_STOCK";
        if (stockQuantity > 0)  return "LOW_STOCK";
        return "OUT_OF_STOCK";
    }

    public Product() {}

    public Product(String name, Double price, String description, String imageUrl, String category) {
        this.name        = name;
        this.price       = price;
        this.description = description;
        this.imageUrl    = imageUrl;
        this.category    = category;
    }

    public Long   getId()                          { return id; }
    public void   setId(Long id)                   { this.id = id; }
    public String getName()                        { return name; }
    public void   setName(String name)             { this.name = name; }
    public Double getPrice()                       { return price; }
    public void   setPrice(Double price)           { this.price = price; }
    public String getDescription()                 { return description; }
    public void   setDescription(String desc)      { this.description = desc; }
    public String getImageUrl()                    { return imageUrl; }
    public void   setImageUrl(String imageUrl)     { this.imageUrl = imageUrl; }
    public String getCategory()                    { return category; }
    public void   setCategory(String category)     { this.category = category; }
    public int    getStockQuantity()               { return stockQuantity; }
    public void   setStockQuantity(int qty)        { this.stockQuantity = qty; }
    public List<ProductVariant> getVariants()      { return variants; }
    public void   setVariants(List<ProductVariant> v) { this.variants = v; }
    public LocalDateTime getCreatedAt()            { return createdAt; }
    public LocalDateTime getUpdatedAt()            { return updatedAt; }
}
