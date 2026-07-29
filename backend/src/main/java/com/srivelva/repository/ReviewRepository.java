package com.srivelva.repository;

import com.srivelva.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    /**
     * All reviews for a specific product, newest first.
     */
    List<Review> findByProductIdOrderByCreatedAtDesc(Long productId);

    /**
     * Average star rating for a product — used in the product detail summary.
     */
    @Query("SELECT COALESCE(AVG(r.rating), 0) FROM Review r WHERE r.productId = :productId")
    Double findAverageRatingByProductId(@Param("productId") Long productId);

    /**
     * Total review count for a product.
     */
    long countByProductId(Long productId);
}
