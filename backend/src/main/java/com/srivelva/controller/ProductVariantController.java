package com.srivelva.controller;

import com.srivelva.dto.ApiResponse;
import com.srivelva.dto.VariantDto;
import com.srivelva.model.ProductVariant;
import com.srivelva.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Variant endpoints:
 *   GET    /api/products/{id}/variants
 *   POST   /api/products/{id}/variants
 *   PUT    /api/products/{id}/variants         (replace all)
 *   PUT    /api/variants/{variantId}
 *   DELETE /api/variants/{variantId}
 */
@RestController
public class ProductVariantController {

    private final ProductService productService;

    public ProductVariantController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/api/products/{id}/variants")
    public ResponseEntity<ApiResponse<List<ProductVariant>>> getVariants(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(productService.getVariants(id)));
    }

    @PostMapping("/api/products/{id}/variants")
    public ResponseEntity<ApiResponse<ProductVariant>> addVariant(
            @PathVariable Long id, @RequestBody VariantDto dto) {
        ProductVariant created = productService.addVariant(id, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Variant added", created));
    }

    /** Replace all variants in one call — used by admin panel */
    @PutMapping("/api/products/{id}/variants")
    public ResponseEntity<ApiResponse<List<ProductVariant>>> replaceVariants(
            @PathVariable Long id, @RequestBody List<VariantDto> dtos) {
        List<ProductVariant> updated = productService.replaceVariants(id, dtos);
        return ResponseEntity.ok(ApiResponse.ok("Variants updated", updated));
    }

    @PutMapping("/api/variants/{variantId}")
    public ResponseEntity<ApiResponse<ProductVariant>> updateVariant(
            @PathVariable Long variantId, @RequestBody VariantDto dto) {
        return productService.updateVariant(variantId, dto)
                .<ResponseEntity<ApiResponse<ProductVariant>>>map(
                        v -> ResponseEntity.ok(ApiResponse.ok("Variant updated", v)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Variant not found")));
    }

    @DeleteMapping("/api/variants/{variantId}")
    public ResponseEntity<ApiResponse<Void>> deleteVariant(@PathVariable Long variantId) {
        boolean deleted = productService.deleteVariant(variantId);
        if (deleted) return ResponseEntity.ok(ApiResponse.success("Variant deleted"));
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Variant not found"));
    }
}
