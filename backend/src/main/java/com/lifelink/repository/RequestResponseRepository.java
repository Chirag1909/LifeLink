package com.lifelink.repository;

import com.lifelink.model.BloodRequest;
import com.lifelink.model.RequestResponse;
import com.lifelink.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RequestResponseRepository extends JpaRepository<RequestResponse, Long> {
    List<RequestResponse> findByBloodRequest(BloodRequest bloodRequest);
    List<RequestResponse> findByDonor(User donor);
}
