package com.srivelva.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews", indexes = {
    @Index(name = "idx_review_product", columnList = "product_id")
})
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Product ID is required")
    @Column(name = "product_id", nullable = false)
    private Long productId;

    @NotBlank(message = "Username is required")
    @Column(nullable = false, length = 150)
    private String username;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    @Column(nullable = false)
    private Integer rating;

    @NotBlank(message = "Review comment is required")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String comment;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // ── Constructors ──
    public Review() {}

    public Review(Long productId, String username, Integer rating, String comment) {
        this.productId = productId;
        this.username  = username;
        this.rating    = rating;
        this.comment   = comment;
    }

    // ── Getters & Setters ──
    public Long getId()                        { return id; }
    public void setId(Long id)                 { this.id = id; }

    public Long getProductId()                 { return productId; }
    public void setProductId(Long productId)   { this.productId = productId; }

    public String getUsername()                { return username; }
    public void setUsername(String username)   { this.username = username; }

    public Integer getRating()                 { return rating; }
    public void setRating(Integer rating)      { this.rating = rating; }

    public String getComment()                 { return comment; }
    public void setComment(String comment)     { this.comment = comment; }

    public LocalDateTime getCreatedAt()        { return createdAt; }
}
