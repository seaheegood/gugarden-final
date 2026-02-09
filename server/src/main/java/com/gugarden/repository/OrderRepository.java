package com.gugarden.repository;

import com.gugarden.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Integer> {

    @Query("SELECT o FROM Order o WHERE o.user.id = :userId ORDER BY o.createdAt DESC")
    List<Order> findByUserIdOrderByCreatedAtDesc(@Param("userId") Integer userId);

    Optional<Order> findByIdAndUserId(Integer id, Integer userId);

    // Admin queries
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.user WHERE (:status IS NULL OR o.status = :status) ORDER BY o.createdAt DESC")
    Page<Order> findAllForAdmin(@Param("status") Order.OrderStatus status, Pageable pageable);

    // Dashboard stats
    @Query(value = "SELECT COUNT(*) FROM orders WHERE status != 'cancelled'", nativeQuery = true)
    long countExcludingCancelled();

    @Query(value = "SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status IN ('paid','preparing','shipped','delivered')", nativeQuery = true)
    long sumTotalRevenue();

    @Query(value = "SELECT COUNT(*) FROM orders WHERE status = 'pending'", nativeQuery = true)
    long countPending();

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.user ORDER BY o.createdAt DESC")
    List<Order> findTop5RecentOrders(Pageable pageable);

    // User order count
    @Query("SELECT COUNT(o) FROM Order o WHERE o.user.id = :userId")
    long countByUserId(@Param("userId") Integer userId);

    @Query(value = "SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE user_id = :userId AND status != 'cancelled'", nativeQuery = true)
    long sumTotalSpentByUserId(@Param("userId") Integer userId);

    @Query("SELECT o FROM Order o WHERE o.user.id = :userId ORDER BY o.createdAt DESC")
    List<Order> findRecentByUserId(@Param("userId") Integer userId, Pageable pageable);
}
