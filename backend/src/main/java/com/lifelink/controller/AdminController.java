package com.lifelink.controller;

import com.lifelink.dto.ApiResponse;
import com.lifelink.model.BloodRequest;
import com.lifelink.model.Donation;
import com.lifelink.model.User;
import com.lifelink.repository.BloodRequestRepository;
import com.lifelink.repository.DonationRepository;
import com.lifelink.repository.UserRepository;
import com.lifelink.util.BloodCompatibility;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final BloodRequestRepository bloodRequestRepository;
    private final DonationRepository donationRepository;

    public AdminController(UserRepository userRepository,
                           BloodRequestRepository bloodRequestRepository,
                           DonationRepository donationRepository) {
        this.userRepository = userRepository;
        this.bloodRequestRepository = bloodRequestRepository;
        this.donationRepository = donationRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        long totalUsers = userRepository.count();
        long totalDonors = userRepository.countByRole("donor");
        long totalRequesters = userRepository.countByRole("requester");
        long totalRequests = bloodRequestRepository.count();
        long totalDonations = donationRepository.count();
        long totalFulfilled = bloodRequestRepository.countByStatus("Fulfilled");
        long availableDonors = userRepository.countByRoleAndIsAvailableTrueAndIsBlockedFalse("donor");

        // 1. Donors by Blood Group
        List<Map<String, Object>> donorsByBloodGroup = BloodCompatibility.BLOOD_GROUPS.stream()
                .map(bg -> {
                    long count = userRepository.countByRoleAndBloodGroup("donor", bg);
                    Map<String, Object> map = new HashMap<>();
                    map.put("bloodGroup", bg);
                    map.put("count", count);
                    return map;
                })
                .collect(Collectors.toList());

        // 2. Requests by Status
        List<String> statuses = List.of("Open", "Accepted", "Fulfilled", "Closed", "Expired");
        List<Map<String, Object>> requestsByStatus = statuses.stream()
                .map(st -> {
                    long count = bloodRequestRepository.countByStatus(st);
                    Map<String, Object> map = new HashMap<>();
                    map.put("status", st);
                    map.put("count", count);
                    return map;
                })
                .collect(Collectors.toList());

        // 3. Requests by Urgency
        List<String> urgencies = List.of("Critical", "Urgent", "Normal");
        List<Map<String, Object>> requestsByUrgency = urgencies.stream()
                .map(urg -> {
                    long count = bloodRequestRepository.countByUrgency(urg);
                    Map<String, Object> map = new HashMap<>();
                    map.put("urgency", urg);
                    map.put("count", count);
                    return map;
                })
                .collect(Collectors.toList());

        // 4. Recent Requests
        List<BloodRequest> recentRequests = bloodRequestRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt() != null ? b.getCreatedAt().compareTo(a.getCreatedAt()) : 0)
                .limit(5)
                .collect(Collectors.toList());

        // 5. Recent Donations
        List<Donation> recentDonations = donationRepository.findAllByOrderByDateDesc().stream()
                .limit(5)
                .collect(Collectors.toList());

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalDonors", totalDonors);
        stats.put("totalRequesters", totalRequesters);
        stats.put("totalRequests", totalRequests);
        stats.put("totalDonations", totalDonations);
        stats.put("totalFulfilled", totalFulfilled);
        stats.put("availableDonors", availableDonors);
        stats.put("donorsByBloodGroup", donorsByBloodGroup);
        stats.put("requestsByStatus", requestsByStatus);
        stats.put("requestsByUrgency", requestsByUrgency);
        stats.put("recentRequests", recentRequests);
        stats.put("recentDonations", recentDonations);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("stats", stats);

        return ResponseEntity.ok(resp);
    }

    @GetMapping("/users")
    public ResponseEntity<?> getUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean isVerified,
            @RequestParam(required = false) Boolean isBlocked
    ) {
        List<User> allUsers = userRepository.findAll();

        List<User> filtered = allUsers.stream()
                .filter(u -> {
                    if (role != null && !role.trim().isEmpty() && !"All".equalsIgnoreCase(role)) {
                        return role.equalsIgnoreCase(u.getRole());
                    }
                    return true;
                })
                .filter(u -> {
                    if (isVerified != null) {
                        return isVerified.equals(u.getIsVerified());
                    }
                    return true;
                })
                .filter(u -> {
                    if (isBlocked != null) {
                        return isBlocked.equals(u.getIsBlocked());
                    }
                    return true;
                })
                .filter(u -> {
                    if (search != null && !search.trim().isEmpty()) {
                        String s = search.trim().toLowerCase();
                        boolean nameMatch = u.getName() != null && u.getName().toLowerCase().contains(s);
                        boolean emailMatch = u.getEmail() != null && u.getEmail().toLowerCase().contains(s);
                        boolean cityMatch = u.getCity() != null && u.getCity().toLowerCase().contains(s);
                        boolean phoneMatch = u.getPhone() != null && u.getPhone().toLowerCase().contains(s);
                        return nameMatch || emailMatch || cityMatch || phoneMatch;
                    }
                    return true;
                })
                .sorted((a, b) -> b.getCreatedAt() != null ? b.getCreatedAt().compareTo(a.getCreatedAt()) : 0)
                .collect(Collectors.toList());

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("total", filtered.size());
        resp.put("page", 1);
        resp.put("pages", 1);
        resp.put("users", filtered);

        return ResponseEntity.ok(resp);
    }

    @PatchMapping("/users/{id}/verify")
    public ResponseEntity<?> verifyUser(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body(ApiResponse.error("User not found"));
        }

        if (body != null && body.containsKey("isVerified") && body.get("isVerified") instanceof Boolean) {
            user.setIsVerified((Boolean) body.get("isVerified"));
        } else {
            user.setIsVerified(!Boolean.TRUE.equals(user.getIsVerified()));
        }

        User saved = userRepository.save(user);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "User '" + saved.getName() + "' has been " + (Boolean.TRUE.equals(saved.getIsVerified()) ? "verified" : "unverified") + ".");
        resp.put("user", saved);

        return ResponseEntity.ok(resp);
    }

    @PatchMapping("/users/{id}/block")
    public ResponseEntity<?> blockUser(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Object> body
    ) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body(ApiResponse.error("User not found"));
        }

        if (user.getId().equals(currentUser.getId())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Admin cannot block their own account."));
        }

        if (body != null && body.containsKey("isBlocked") && body.get("isBlocked") instanceof Boolean) {
            user.setIsBlocked((Boolean) body.get("isBlocked"));
        } else {
            user.setIsBlocked(!Boolean.TRUE.equals(user.getIsBlocked()));
        }

        User saved = userRepository.save(user);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "User '" + saved.getName() + "' has been " + (Boolean.TRUE.equals(saved.getIsBlocked()) ? "blocked" : "unblocked") + ".");
        resp.put("user", saved);

        return ResponseEntity.ok(resp);
    }
}
