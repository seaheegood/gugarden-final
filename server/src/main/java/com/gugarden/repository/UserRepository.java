package com.gugarden.repository;

import com.gugarden.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE (u.provider = :provider AND u.providerId = :providerId) OR u.email = :email")
    List<User> findByProviderAndProviderIdOrEmail(
            @Param("provider") User.Provider provider,
            @Param("providerId") String providerId,
            @Param("email") String email);

    @Query("SELECT u FROM User u WHERE u.name LIKE %:search% OR u.email LIKE %:search%")
    Page<User> findByNameOrEmailContaining(@Param("search") String search, Pageable pageable);

    long count();
}
