package com.lifelink.repository;

import com.lifelink.model.BloodRequest;
import com.lifelink.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BloodRequestRepository extends JpaRepository<BloodRequest, Long>, JpaSpecificationExecutor<BloodRequest> {
    List<BloodRequest> findByRequestedByOrderByCreatedAtDesc(User requestedBy);
    List<BloodRequest> findByAcceptedByOrderByCreatedAtDesc(User acceptedBy);
    List<BloodRequest> findByStatusOrderByCreatedAtDesc(String status);
    long countByStatus(String status);
    long countByUrgency(String urgency);

    @Transactional
    @Modifying
    @Query("UPDATE BloodRequest r SET r.status = 'Expired' WHERE r.status = 'Open' AND r.neededBy < :now")
    int autoExpireOverdueRequests(LocalDateTime now);
}
