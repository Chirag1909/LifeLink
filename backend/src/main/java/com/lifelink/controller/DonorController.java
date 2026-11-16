package com.lifelink.controller;

import com.lifelink.dto.ApiResponse;
import com.lifelink.dto.DonorSearchResultDto;
import com.lifelink.dto.UpdateProfileDto;
import com.lifelink.model.Donation;
import com.lifelink.model.User;
import com.lifelink.repository.DonationRepository;
import com.lifelink.repository.UserRepository;
import com.lifelink.util.BloodCompatibility;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/donors")
public class DonorController {

    private final UserRepository userRepository;
    private final DonationRepository donationRepository;

    public DonorController(UserRepository userRepository, DonationRepository donationRepository) {
        this.userRepository = userRepository;
        this.donationRepository = donationRepository;
    }

    @GetMapping
    public ResponseEntity<?> searchDonors(
            @RequestParam(required = false) String bloodGroup,
            @RequestParam(required = false) String city,
            @RequestParam(required = false, defaultValue = "compatible") String matchMode
    ) {
        List<User> allDonors = userRepository.findByRole("donor");
        LocalDate ninetyDaysAgo = LocalDate.now().minusDays(BloodCompatibility.DONATION_COOLDOWN_DAYS);

        List<DonorSearchResultDto> eligibleDonors = allDonors.stream()
                .filter(d -> Boolean.FALSE.equals(d.getIsBlocked()))
                .filter(d -> Boolean.TRUE.equals(d.getIsVerified()))
                .filter(d -> Boolean.TRUE.equals(d.getIsAvailable()))
                // 90 days cooldown filter
                .filter(d -> d.getLastDonationDate() == null || !d.getLastDonationDate().isAfter(ninetyDaysAgo))
                // City filter (case-insensitive substring)
                .filter(d -> {
                    if (city == null || city.trim().isEmpty()) return true;
                    return d.getCity() != null && d.getCity().toLowerCase().contains(city.trim().toLowerCase());
                })
                // Blood group filter
                .filter(d -> {
                    if (bloodGroup == null || bloodGroup.trim().isEmpty() || "All Groups".equalsIgnoreCase(bloodGroup.trim())) {
                        return true;
                    }
                    if ("exact".equalsIgnoreCase(matchMode)) {
                        return bloodGroup.trim().equalsIgnoreCase(d.getBloodGroup());
                    } else {
                        List<String> compatibleGroups = BloodCompatibility.getCompatibleDonorGroups(bloodGroup.trim());
                        return compatibleGroups.contains(d.getBloodGroup());
                    }
                })
                .map(d -> new DonorSearchResultDto(
                        d.getId(),
                        d.getName(),
                        d.getBloodGroup(),
                        d.getCity(),
                        d.getIsAvailable(),
                        d.getLastDonationDate(),
                        BloodCompatibility.maskPhoneNumber(d.getPhone()), // Mask phone for public privacy!
                        true,
                        d.getCreatedAt()
                ))
                .sorted((a, b) -> b.getCreatedAt() != null ? b.getCreatedAt().compareTo(a.getCreatedAt()) : 0)
                .collect(Collectors.toList());

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("count", eligibleDonors.size());
        resp.put("donors", eligibleDonors);

        return ResponseEntity.ok(resp);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal User currentUser, @RequestBody UpdateProfileDto dto) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication required."));
        }

        User user = userRepository.findById(currentUser.getId()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body(ApiResponse.error("User not found."));
        }

        if (dto.getName() != null && !dto.getName().trim().isEmpty()) user.setName(dto.getName().trim());
        if (dto.getPhone() != null && !dto.getPhone().trim().isEmpty()) user.setPhone(dto.getPhone().trim());
        if (dto.getCity() != null && !dto.getCity().trim().isEmpty()) user.setCity(dto.getCity().trim());
        if (dto.getBloodGroup() != null && !dto.getBloodGroup().trim().isEmpty()) user.setBloodGroup(dto.getBloodGroup().trim());

        User saved = userRepository.save(user);
        saved.setEligibility(BloodCompatibility.calculateDonorEligibility(saved));

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Profile updated successfully.");
        resp.put("user", saved);

        return ResponseEntity.ok(resp);
    }

    @PatchMapping("/availability")
    public ResponseEntity<?> toggleAvailability(@AuthenticationPrincipal User currentUser, @RequestBody(required = false) Map<String, Object> body) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication required."));
        }

        User user = userRepository.findById(currentUser.getId()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body(ApiResponse.error("User not found."));
        }

        if (body != null && body.containsKey("isAvailable") && body.get("isAvailable") instanceof Boolean) {
            user.setIsAvailable((Boolean) body.get("isAvailable"));
        } else {
            user.setIsAvailable(!Boolean.TRUE.equals(user.getIsAvailable()));
        }

        User saved = userRepository.save(user);
        saved.setEligibility(BloodCompatibility.calculateDonorEligibility(saved));

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Availability updated to " + (Boolean.TRUE.equals(saved.getIsAvailable()) ? "Available" : "Unavailable") + ".");
        resp.put("isAvailable", saved.getIsAvailable());
        resp.put("user", saved);

        return ResponseEntity.ok(resp);
    }

    @GetMapping("/history")
    public ResponseEntity<?> getDonationHistory(@AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication required."));
        }

        List<Donation> history = donationRepository.findByDonorOrderByDateDesc(currentUser);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("count", history.size());
        resp.put("history", history);

        return ResponseEntity.ok(resp);
    }
}
