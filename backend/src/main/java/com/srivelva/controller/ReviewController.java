package com.srivelva.controller;

import com.srivelva.dto.ApiResponse;
import com.srivelva.model.Review;
import com.srivelva.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    /**
     * GET /api/reviews/{productId}
     * Returns all reviews for a product along with the computed average rating
     * and total count so the frontend does not have to calculate these itself.
     *
     * Response shape:
     * {
     *   "success": true,
     *   "data": {
     *     "reviews":       [ { id, productId, username, rating, comment, createdAt }, … ],
     *     "averageRating": 4.6,
     *     "totalReviews":  12
     *   }
     * }
     */
    @GetMapping("/{productId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getReviewsByProduct(
            @PathVariable Long productId) {

        List<Review> reviews       = reviewService.getReviewsByProduct(productId);
        Double       avgRating     = reviewService.getAverageRating(productId);
        long         totalReviews  = reviewService.getReviewCount(productId);

        Map<String, Object> payload = new HashMap<>();
        payload.put("reviews",       reviews);
        payload.put("averageRating", Math.round(avgRating * 10.0) / 10.0);   // round to 1 d.p.
        payload.put("totalReviews",  totalReviews);

        return ResponseEntity.ok(ApiResponse.ok(payload));
    }

    /**
     * POST /api/reviews
     * Submits a new customer review for a product.
     *
     * Request body example:
     * {
     *   "productId": 1,
     *   "username":  "Priya S.",
     *   "rating":    5,
     *   "comment":   "Absolutely love this oil!"
     * }
     */
    /**
     * POST /api/reviews
     * Submits a new customer review for a product.
     *
     * Request body example:
     * {
     *   "productId": 1,
     *   "username":  "Priya S.",
     *   "rating":    5,
     *   "comment":   "Absolutely love this oil!"
     * }
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Review>> createReview(
            @Valid @RequestBody Review review) {

        Review saved = reviewService.createReview(review);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(saved));
    }

    /**
     * DELETE /api/reviews/{reviewId}
     * Admin-only: delete a review by ID.
     * Protected by AdminAuthFilter (DELETE on /api/reviews/** requires token).
     */
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(
            @PathVariable Long reviewId) {

        reviewService.deleteReview(reviewId);
        return ResponseEntity.ok(ApiResponse.ok("Review deleted successfully", null));
    }
}
