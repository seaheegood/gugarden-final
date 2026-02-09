package com.gugarden.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "rental_inquiries")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentalInquiry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false, length = 20)
    private String phone;

    private String company;

    private String location;

    @Column(name = "space_size", length = 100)
    private String spaceSize;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(columnDefinition = "ENUM('new','contacted','completed')")
    @Builder.Default
    private String status = "new";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
