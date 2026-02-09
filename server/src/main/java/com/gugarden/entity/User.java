package com.gugarden.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true)
    private String email;

    private String password;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 20)
    private String phone;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "address_detail")
    private String addressDetail;

    @Column(length = 10)
    private String zipcode;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('user','admin')")
    @Builder.Default
    private Role role = Role.user;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('local','naver','kakao')")
    @Builder.Default
    private Provider provider = Provider.local;

    @Column(name = "provider_id")
    private String providerId;

    @Column(name = "profile_image", length = 500)
    private String profileImage;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum Role {
        user, admin
    }

    public enum Provider {
        local, naver, kakao
    }
}
