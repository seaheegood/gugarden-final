package com.gugarden.repository;

import com.gugarden.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Integer> {

    @Query("SELECT p FROM Product p JOIN FETCH p.category WHERE p.isActive = true ORDER BY p.createdAt DESC")
    List<Product> findAllActive();

    @Query("SELECT p FROM Product p JOIN FETCH p.category WHERE p.category.slug = :slug AND p.isActive = true ORDER BY p.createdAt DESC")
    List<Product> findByCategorySlugAndActive(@Param("slug") String slug);

    @Query("SELECT p FROM Product p JOIN FETCH p.category WHERE p.isFeatured = true AND p.isActive = true ORDER BY p.createdAt DESC")
    List<Product> findFeatured();

    @Query("SELECT p FROM Product p JOIN FETCH p.category WHERE p.isRentable = true AND p.isActive = true ORDER BY p.createdAt ASC")
    List<Product> findRentable();

    @Query("SELECT p FROM Product p JOIN FETCH p.category WHERE p.id = :id AND p.isActive = true")
    Optional<Product> findByIdAndActive(@Param("id") Integer id);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.isActive = true")
    long countActive();

    @Modifying
    @Query("UPDATE Product p SET p.stock = p.stock - :quantity WHERE p.id = :id")
    void decreaseStock(@Param("id") Integer id, @Param("quantity") int quantity);

    @Modifying
    @Query("UPDATE Product p SET p.stock = p.stock + :quantity WHERE p.id = :id")
    void increaseStock(@Param("id") Integer id, @Param("quantity") int quantity);

    // Admin: all products with optional filters
    @Query("SELECT p FROM Product p JOIN FETCH p.category c WHERE " +
           "(:category IS NULL OR c.slug = :category) AND " +
           "(:search IS NULL OR p.name LIKE %:search%) " +
           "ORDER BY p.createdAt DESC")
    Page<Product> findAllForAdmin(@Param("category") String category,
                                  @Param("search") String search,
                                  Pageable pageable);

    @Query("SELECT COUNT(p) FROM Product p JOIN p.category c WHERE " +
           "(:category IS NULL OR c.slug = :category) AND " +
           "(:search IS NULL OR p.name LIKE %:search%)")
    long countForAdmin(@Param("category") String category, @Param("search") String search);
}
