package com.srivelva.service;

import com.srivelva.dto.VariantDto;
import com.srivelva.model.Product;
import com.srivelva.model.ProductVariant;
import com.srivelva.repository.ProductRepository;
import com.srivelva.repository.ProductVariantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ProductService {

    private final ProductRepository        productRepository;
    private final ProductVariantRepository variantRepository;

    public ProductService(ProductRepository productRepository,
                          ProductVariantRepository variantRepository) {
        this.productRepository = productRepository;
        this.variantRepository = variantRepository;
    }

    // ── Read ────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<Product> getAllProducts() {
        List<Product> products = productRepository.findAll();
        // Initialize variants within transaction to avoid LazyInitializationException
        products.forEach(p -> p.getVariants().size());
        return products;
    }

    @Transactional(readOnly = true)
    public List<Product> getProductsByCategory(String category) {
        List<Product> products = productRepository.findByCategoryIgnoreCase(category);
        products.forEach(p -> p.getVariants().size());
        return products;
    }

    @Transactional(readOnly = true)
    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id).map(p -> {
            p.getVariants().size(); // initialize variants
            return p;
        });
    }

    // ── Write ───────────────────────────────────────────────────

    public Product createProduct(Product product) {
        if (product.getCategory() != null) {
            product.setCategory(product.getCategory().trim().toLowerCase());
        }
        return productRepository.save(product);
    }

    public Optional<Product> updateProduct(Long id, Product updated) {
        return productRepository.findById(id).map(existing -> {
            existing.setName(updated.getName());
            existing.setPrice(updated.getPrice());
            existing.setDescription(updated.getDescription());
            if (updated.getCategory() != null) {
                existing.setCategory(updated.getCategory().trim().toLowerCase());
            }
            if (updated.getImageUrl() != null) {
                existing.setImageUrl(updated.getImageUrl());
            }
            if (updated.getStockQuantity() >= 0) {
                existing.setStockQuantity(updated.getStockQuantity());
            }
            return productRepository.save(existing);
        });
    }

    public boolean deleteProduct(Long id) {
        if (!productRepository.existsById(id)) return false;
        productRepository.deleteById(id);
        return true;
    }

    // ── Variant CRUD ────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ProductVariant> getVariants(Long productId) {
        return variantRepository.findByProductIdOrderByPriceAsc(productId);
    }

    public ProductVariant addVariant(Long productId, VariantDto dto) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + productId));
        ProductVariant v = new ProductVariant(dto.getSize(), dto.getPrice(),
                dto.getStockQuantity() > 0 ? dto.getStockQuantity() : 10, product);
        return variantRepository.save(v);
    }

    public Optional<ProductVariant> updateVariant(Long variantId, VariantDto dto) {
        return variantRepository.findById(variantId).map(v -> {
            v.setSize(dto.getSize());
            v.setPrice(dto.getPrice());
            if (dto.getStockQuantity() >= 0) v.setStockQuantity(dto.getStockQuantity());
            return variantRepository.save(v);
        });
    }

    public boolean deleteVariant(Long variantId) {
        if (!variantRepository.existsById(variantId)) return false;
        variantRepository.deleteById(variantId);
        return true;
    }

    /** Replace all variants for a product at once */
    public List<ProductVariant> replaceVariants(Long productId, List<VariantDto> dtos) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + productId));
        variantRepository.deleteByProductId(productId);
        for (VariantDto dto : dtos) {
            ProductVariant v = new ProductVariant(dto.getSize(), dto.getPrice(),
                    dto.getStockQuantity() > 0 ? dto.getStockQuantity() : 10, product);
            variantRepository.save(v);
        }
        return variantRepository.findByProductIdOrderByPriceAsc(productId);
    }
}
