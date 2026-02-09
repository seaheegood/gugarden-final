package com.gugarden.repository;

import com.gugarden.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductImageRepository extends JpaRepository<ProductImage, Integer> {

    List<ProductImage> findByProductIdOrderBySortOrderAsc(Integer productId);

    long countByProductId(Integer productId);

    @Query("SELECT COALESCE(MAX(pi.sortOrder), -1) FROM ProductImage pi WHERE pi.product.id = :productId")
    int findMaxSortOrderByProductId(@Param("productId") Integer productId);
}
