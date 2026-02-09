package com.gugarden.repository;

import com.gugarden.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Integer> {

    @Query("SELECT ci FROM CartItem ci JOIN FETCH ci.product p WHERE ci.user.id = :userId AND p.isActive = true ORDER BY ci.createdAt DESC")
    List<CartItem> findByUserIdWithProduct(@Param("userId") Integer userId);

    Optional<CartItem> findByUserIdAndProductId(Integer userId, Integer productId);

    Optional<CartItem> findByIdAndUserId(Integer id, Integer userId);

    void deleteByUserId(Integer userId);
}
