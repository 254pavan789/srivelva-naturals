package com.srivelva.repository;

import com.srivelva.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT p FROM Product p WHERE LOWER(p.category) = LOWER(:category)")
    List<Product> findByCategoryIgnoreCase(String category);

    boolean existsByNameIgnoreCase(String name);

    @Modifying
    @Transactional
    @Query("UPDATE Product p SET p.category = LOWER(p.category)")
    void normalizeAllCategoriesToLowercase();

    /**
     * Fix image URL and category for an existing product by name.
     * Always updates to the canonical PNG path and lowercase category.
     * Used by DataInitializer on every startup to correct old svg paths.
     */
    @Modifying
    @Transactional
    @Query("UPDATE Product p SET p.imageUrl = :imageUrl, p.category = LOWER(:category) WHERE LOWER(p.name) = LOWER(:name)")
    void fixImageAndCategory(String name, String imageUrl, String category);
}
