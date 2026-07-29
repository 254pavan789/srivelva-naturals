package com.srivelva.repository;

import com.srivelva.model.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    List<ProductVariant> findByProductIdOrderByPriceAsc(Long productId);
    void deleteByProductId(Long productId);
}
