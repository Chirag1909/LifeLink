package com.lifelink.repository;

import com.lifelink.model.Donation;
import com.lifelink.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DonationRepository extends JpaRepository<Donation, Long> {
    List<Donation> findByDonorOrderByDateDesc(User donor);
    List<Donation> findAllByOrderByDateDesc();
}
