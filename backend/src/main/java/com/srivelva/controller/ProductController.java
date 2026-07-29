package com.srivelva.controller;

import com.srivelva.dto.ApiResponse;
import com.srivelva.model.Product;
import com.srivelva.service.ProductService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

/**
 * ProductController — CRUD for products, including image upload.
 *
 * POST and PUT accept multipart/form-data with an optional image file.
 * The uploaded image is saved to ./uploads/ and served via WebConfig
 * at http://localhost:8080/uploads/{filename}.
 *
 * NOTE: consumes is set to MULTIPART_FORM_DATA_VALUE only.
 *   Listing APPLICATION_JSON_VALUE alongside multipart caused Spring to
 *   attempt JSON deserialization of multipart requests and throw 500.
 */
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private static final Logger log = LoggerFactory.getLogger(ProductController.class);

    private static final Path   UPLOAD_DIR   = Paths.get("uploads");
    private static final long   MAX_IMG_BYTES = 10 * 1024 * 1024; // 10 MB safety guard
    private static final String[] ALLOWED_EXT = { ".jpg", ".jpeg", ".png", ".webp", ".gif" };

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
        initUploadDir();
    }

    private void initUploadDir() {
        try {
            Files.createDirectories(UPLOAD_DIR);
            log.info("[Products] Upload directory ready: {}", UPLOAD_DIR.toAbsolutePath());
        } catch (IOException e) {
            log.error("[Products] Cannot create upload directory: {}", e.getMessage());
        }
    }

    // ── Read ────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<ApiResponse<List<Product>>> getProducts(
            @RequestParam(required = false) String category) {
        try {
            List<Product> products = (category != null && !category.isBlank())
                    ? productService.getProductsByCategory(category)
                    : productService.getAllProducts();
            return ResponseEntity.ok(ApiResponse.ok(products));
        } catch (Exception e) {
            log.error("[Products] GET /api/products failed", e);
            throw e;   // re-throw so GlobalExceptionHandler returns 500 JSON
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Product>> getProductById(@PathVariable Long id) {
        return productService.getProductById(id)
                .<ResponseEntity<ApiResponse<Product>>>map(
                        p -> ResponseEntity.ok(ApiResponse.ok(p)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Product not found with id: " + id)));
    }

    // ── Write ────────────────────────────────────────────────────

    /**
     * POST /api/products
     * Content-Type: multipart/form-data
     *
     * Required fields: name, price, description, category
     * Optional field:  image (file)
     *
     * FIX: consumes is multipart ONLY — mixing JSON caused 500 on multipart requests.
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Product>> createProduct(
            @RequestParam("name")        String name,
            @RequestParam("price")       String priceStr,           // String → parse manually to avoid 400 on whitespace
            @RequestParam("description") String description,
            @RequestParam("category")    String category,
            @RequestParam(value = "stockQuantity", required = false, defaultValue = "10") String stockQuantityStr,
            @RequestParam(value = "image", required = false) MultipartFile image) {

        // Manual validation — gives clear 400 instead of 500 on bad input
        Double price = parsePrice(priceStr);
        if (price == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("'price' must be a valid number greater than 0"));
        }
        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("'name' is required"));
        }
        if (description == null || description.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("'description' is required"));
        }
        if (category == null || category.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("'category' is required"));
        }

        int stockQty = 10;
        try { stockQty = Integer.parseInt(stockQuantityStr.trim()); if (stockQty < 0) stockQty = 0; } catch (NumberFormatException ignored) {}

        Product product = new Product();
        product.setName(name.trim());
        product.setPrice(price);
        product.setDescription(description.trim());
        product.setCategory(category.trim());
        product.setStockQuantity(stockQty);

        if (image != null && !image.isEmpty()) {
            String imageUrl = saveImage(image);
            if (imageUrl != null) {
                product.setImageUrl(imageUrl);
            } else {
                log.warn("[Products] Image save failed — product saved without image");
            }
        }

        Product created = productService.createProduct(product);
        log.info("[Products] Created product #{} '{}'", created.getId(), created.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                             .body(ApiResponse.ok("Product created successfully", created));
    }

    /**
     * PUT /api/products/{id}
     * Content-Type: multipart/form-data
     *
     * All fields required. If no new image is uploaded, existing imageUrl is kept.
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Product>> updateProduct(
            @PathVariable Long id,
            @RequestParam("name")        String name,
            @RequestParam("price")       String priceStr,
            @RequestParam("description") String description,
            @RequestParam("category")    String category,
            @RequestParam(value = "stockQuantity", required = false, defaultValue = "-1") String stockQuantityStr,
            @RequestParam(value = "image", required = false) MultipartFile image) {

        Double price = parsePrice(priceStr);
        if (price == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("'price' must be a valid number greater than 0"));
        }

        int stockQty = -1;
        try { stockQty = Integer.parseInt(stockQuantityStr.trim()); if (stockQty < 0) stockQty = 0; } catch (NumberFormatException ignored) {}

        Product updates = new Product();
        updates.setName(name == null ? "" : name.trim());
        updates.setPrice(price);
        updates.setDescription(description == null ? "" : description.trim());
        updates.setCategory(category == null ? "" : category.trim());
        if (stockQty >= 0) updates.setStockQuantity(stockQty);

        if (image != null && !image.isEmpty()) {
            String imageUrl = saveImage(image);
            if (imageUrl != null) updates.setImageUrl(imageUrl);
        }
        // If no new image, updates.imageUrl remains null → ProductService preserves existing

        return productService.updateProduct(id, updates)
                .<ResponseEntity<ApiResponse<Product>>>map(
                        updated -> ResponseEntity.ok(ApiResponse.ok("Product updated", updated)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Product not found with id: " + id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        boolean deleted = productService.deleteProduct(id);
        if (deleted) return ResponseEntity.ok(ApiResponse.success("Product deleted successfully"));
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                             .body(ApiResponse.error("Product not found with id: " + id));
    }

    // ── Helpers ──────────────────────────────────────────────────

    /**
     * Parses a price string to Double.
     * Returns null if the value is missing, non-numeric, or <= 0.
     */
    private Double parsePrice(String priceStr) {
        if (priceStr == null || priceStr.isBlank()) return null;
        try {
            double val = Double.parseDouble(priceStr.trim());
            return val > 0 ? val : null;
        } catch (NumberFormatException e) {
            return null;
        }
    }

    /**
     * Saves the uploaded file to UPLOAD_DIR with a UUID name.
     * Returns the public URL path (/uploads/{filename}), or null on failure.
     *
     * Validates:
     *   1. File size ≤ MAX_IMG_BYTES
     *   2. Extension is one of ALLOWED_EXT
     */
    private String saveImage(MultipartFile file) {
        // Size guard (belt-and-suspenders — multipart config is the primary guard)
        if (file.getSize() > MAX_IMG_BYTES) {
            log.warn("[Products] Rejected image — size {} bytes exceeds {}",
                     file.getSize(), MAX_IMG_BYTES);
            return null;
        }

        // Extension whitelist
        String original  = file.getOriginalFilename();
        String extension = ".jpg";   // safe default
        if (original != null && original.contains(".")) {
            String ext = original.substring(original.lastIndexOf('.')).toLowerCase();
            boolean allowed = false;
            for (String a : ALLOWED_EXT) { if (a.equals(ext)) { allowed = true; break; } }
            extension = allowed ? ext : ".jpg";
        }

        String filename = UUID.randomUUID() + extension;
        Path   target   = UPLOAD_DIR.resolve(filename);

        try {
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            log.info("[Products] Image saved: {}", filename);
            return "/uploads/" + filename;
        } catch (IOException e) {
            log.error("[Products] Image save failed for file '{}': {}", original, e.getMessage(), e);
            return null;
        }
    }
}
