package com.gugarden.repository;

import com.gugarden.entity.RentalInquiry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RentalInquiryRepository extends JpaRepository<RentalInquiry, Integer> {

    Page<RentalInquiry> findByStatus(String status, Pageable pageable);

    Page<RentalInquiry> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<RentalInquiry> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);
}
