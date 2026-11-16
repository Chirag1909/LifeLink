package com.lifelink.controller;

import com.lifelink.dto.ApiResponse;
import com.lifelink.dto.CreateBloodRequestDto;
import com.lifelink.dto.DonorSearchResultDto;
import com.lifelink.dto.StatusUpdateDto;
import com.lifelink.model.*;
import com.lifelink.repository.BloodRequestRepository;
import com.lifelink.repository.DonationRepository;
import com.lifelink.repository.RequestResponseRepository;
import com.lifelink.repository.UserRepository;
import com.lifelink.util.BloodCompatibility;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/requests")
public class RequestController {

    private final BloodRequestRepository bloodRequestRepository;
    private final UserRepository userRepository;
    private final DonationRepository donationRepository;
    private final RequestResponseRepository requestResponseRepository;

    public RequestController(BloodRequestRepository bloodRequestRepository,
                             UserRepository userRepository,
                             DonationRepository donationRepository,
                             RequestResponseRepository requestResponseRepository) {
        this.bloodRequestRepository = bloodRequestRepository;
        this.userRepository = userRepository;
        this.donationRepository = donationRepository;
        this.requestResponseRepository = requestResponseRepository;
    }

    private void syncExpiredRequests() {
        try {
            bloodRequestRepository.autoExpireOverdueRequests(LocalDateTime.now());
        } catch (Exception e) {
            // Ignore
        }
    }

    @PostMapping
    public ResponseEntity<?> createRequest(@AuthenticationPrincipal User currentUser, @Valid @RequestBody CreateBloodRequestDto dto) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication required."));
        }

        BloodRequest request = new BloodRequest();
        request.setPatientName(dto.getPatientName().trim());
        request.setBloodGroup(dto.getBloodGroup().trim());
        request.setUnitsNeeded(dto.getUnitsNeeded() != null ? dto.getUnitsNeeded() : 1);
        request.setHospital(dto.getHospital().trim());
        request.setCity(dto.getCity().trim());
        request.setContactPhone(dto.getContactPhone() != null && !dto.getContactPhone().trim().isEmpty() ? dto.getContactPhone().trim() : currentUser.getPhone());
        request.setUrgency(dto.getUrgency() != null ? dto.getUrgency() : "Normal");
        request.setNeededBy(dto.getNeededBy());
        request.setNotes(dto.getNotes() != null ? dto.getNotes().trim() : "");
        request.setRequestedBy(currentUser);
        request.setStatus("Open");

        BloodRequest saved = bloodRequestRepository.save(request);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Blood request submitted successfully.");
        resp.put("request", saved);

        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    @GetMapping
    public ResponseEntity<?> getRequests(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String bloodGroup,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String urgency,
            @RequestParam(required = false) String scope
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication required."));
        }

        syncExpiredRequests();

        List<BloodRequest> allRequests = bloodRequestRepository.findAll();

        List<BloodRequest> filtered = allRequests.stream()
                // Role Scoping
                .filter(req -> {
                    if ("requester".equals(currentUser.getRole())) {
                        return req.getRequestedBy() != null && req.getRequestedBy().getId().equals(currentUser.getId());
                    } else if ("donor".equals(currentUser.getRole())) {
                        if ("my-accepted".equalsIgnoreCase(scope)) {
                            return req.getAcceptedBy() != null && req.getAcceptedBy().getId().equals(currentUser.getId());
                        } else {
                            // Donor sees Open requests they can donate to
                            String targetStatus = status != null ? status : "Open";
                            if (!targetStatus.equalsIgnoreCase(req.getStatus())) return false;

                            // City match
                            if (city != null && !city.trim().isEmpty()) {
                                if (req.getCity() == null || !req.getCity().toLowerCase().contains(city.trim().toLowerCase())) {
                                    return false;
                                }
                            } else if (!"all-cities".equalsIgnoreCase(scope)) {
                                if (currentUser.getCity() != null && req.getCity() != null &&
                                        !req.getCity().toLowerCase().contains(currentUser.getCity().toLowerCase())) {
                                    return false;
                                }
                            }

                            // Compatibility match
                            if (bloodGroup != null && !bloodGroup.trim().isEmpty()) {
                                return bloodGroup.equalsIgnoreCase(req.getBloodGroup());
                            } else {
                                List<String> canDonateTo = BloodCompatibility.CAN_DONATE_TO.get(currentUser.getBloodGroup());
                                return canDonateTo != null && canDonateTo.contains(req.getBloodGroup());
                            }
                        }
                    }
                    return true; // Admin sees all
                })
                // Filters
                .filter(req -> {
                    if (status != null && !status.trim().isEmpty() && !"All".equalsIgnoreCase(status) && !"donor".equals(currentUser.getRole())) {
                        return status.equalsIgnoreCase(req.getStatus());
                    }
                    return true;
                })
                .filter(req -> {
                    if (bloodGroup != null && !bloodGroup.trim().isEmpty() && !"donor".equals(currentUser.getRole())) {
                        return bloodGroup.equalsIgnoreCase(req.getBloodGroup());
                    }
                    return true;
                })
                .filter(req -> {
                    if (city != null && !city.trim().isEmpty() && !"donor".equals(currentUser.getRole())) {
                        return req.getCity() != null && req.getCity().toLowerCase().contains(city.trim().toLowerCase());
                    }
                    return true;
                })
                .filter(req -> {
                    if (urgency != null && !urgency.trim().isEmpty()) {
                        return urgency.equalsIgnoreCase(req.getUrgency());
                    }
                    return true;
                })
                .sorted((a, b) -> b.getCreatedAt() != null ? b.getCreatedAt().compareTo(a.getCreatedAt()) : 0)
                .collect(Collectors.toList());

        // Clone/mask phone for privacy if not owner/admin/accepted donor
        List<BloodRequest> sanitized = filtered.stream().map(r -> {
            if (r.getAcceptedBy() != null) {
                boolean isOwner = r.getRequestedBy() != null && r.getRequestedBy().getId().equals(currentUser.getId());
                boolean isAdmin = "admin".equals(currentUser.getRole());
                boolean isSelf = r.getAcceptedBy().getId().equals(currentUser.getId());

                if (!isOwner && !isAdmin && !isSelf) {
                    User maskedUser = new User();
                    maskedUser.setId(r.getAcceptedBy().getId());
                    maskedUser.setName(r.getAcceptedBy().getName());
                    maskedUser.setBloodGroup(r.getAcceptedBy().getBloodGroup());
                    maskedUser.setCity(r.getAcceptedBy().getCity());
                    maskedUser.setPhone(BloodCompatibility.maskPhoneNumber(r.getAcceptedBy().getPhone()));
                    r.setAcceptedBy(maskedUser);
                }
            }
            return r;
        }).collect(Collectors.toList());

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("count", sanitized.size());
        resp.put("total", sanitized.size());
        resp.put("page", 1);
        resp.put("pages", 1);
        resp.put("requests", sanitized);

        return ResponseEntity.ok(resp);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRequestById(@AuthenticationPrincipal User currentUser, @PathVariable Long id) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication required."));
        }

        syncExpiredRequests();

        BloodRequest request = bloodRequestRepository.findById(id).orElse(null);
        if (request == null) {
            return ResponseEntity.status(404).body(ApiResponse.error("Blood request not found."));
        }

        // Check privacy on acceptedBy phone
        if (request.getAcceptedBy() != null) {
            boolean isOwner = request.getRequestedBy() != null && request.getRequestedBy().getId().equals(currentUser.getId());
            boolean isAdmin = "admin".equals(currentUser.getRole());
            boolean isSelf = request.getAcceptedBy().getId().equals(currentUser.getId());

            if (!isOwner && !isAdmin && !isSelf) {
                User maskedUser = new User();
                maskedUser.setId(request.getAcceptedBy().getId());
                maskedUser.setName(request.getAcceptedBy().getName());
                maskedUser.setBloodGroup(request.getAcceptedBy().getBloodGroup());
                maskedUser.setCity(request.getAcceptedBy().getCity());
                maskedUser.setPhone(BloodCompatibility.maskPhoneNumber(request.getAcceptedBy().getPhone()));
                request.setAcceptedBy(maskedUser);
            }
        }

        // Find eligible matching donors for this request
        List<String> compatibleGroups = BloodCompatibility.getCompatibleDonorGroups(request.getBloodGroup());
        LocalDate ninetyDaysAgo = LocalDate.now().minusDays(BloodCompatibility.DONATION_COOLDOWN_DAYS);

        List<DonorSearchResultDto> matchingDonors = userRepository.findByRole("donor").stream()
                .filter(d -> Boolean.FALSE.equals(d.getIsBlocked()))
                .filter(d -> Boolean.TRUE.equals(d.getIsVerified()))
                .filter(d -> Boolean.TRUE.equals(d.getIsAvailable()))
                .filter(d -> d.getCity() != null && request.getCity() != null && d.getCity().toLowerCase().contains(request.getCity().toLowerCase()))
                .filter(d -> compatibleGroups.contains(d.getBloodGroup()))
                .filter(d -> d.getLastDonationDate() == null || !d.getLastDonationDate().isAfter(ninetyDaysAgo))
                .map(d -> new DonorSearchResultDto(
                        d.getId(),
                        d.getName(),
                        d.getBloodGroup(),
                        d.getCity(),
                        d.getIsAvailable(),
                        d.getLastDonationDate(),
                        BloodCompatibility.maskPhoneNumber(d.getPhone()),
                        true,
                        d.getCreatedAt()
                ))
                .collect(Collectors.toList());

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("request", request);
        resp.put("matchingDonors", matchingDonors);

        return ResponseEntity.ok(resp);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRequest(@AuthenticationPrincipal User currentUser, @PathVariable Long id, @RequestBody CreateBloodRequestDto dto) {
        if (currentUser == null) return ResponseEntity.status(401).body(ApiResponse.error("Authentication required."));

        BloodRequest request = bloodRequestRepository.findById(id).orElse(null);
        if (request == null) return ResponseEntity.status(404).body(ApiResponse.error("Request not found."));

        if (!request.getRequestedBy().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(403).body(ApiResponse.error("Unauthorized: You can only edit your own requests."));
        }

        if (!"Open".equals(request.getStatus())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Cannot edit request because it is already '" + request.getStatus() + "'. Only 'Open' requests can be edited."));
        }

        if (dto.getPatientName() != null) request.setPatientName(dto.getPatientName().trim());
        if (dto.getBloodGroup() != null) request.setBloodGroup(dto.getBloodGroup().trim());
        if (dto.getUnitsNeeded() != null) request.setUnitsNeeded(dto.getUnitsNeeded());
        if (dto.getHospital() != null) request.setHospital(dto.getHospital().trim());
        if (dto.getCity() != null) request.setCity(dto.getCity().trim());
        if (dto.getContactPhone() != null) request.setContactPhone(dto.getContactPhone().trim());
        if (dto.getUrgency() != null) request.setUrgency(dto.getUrgency().trim());
        if (dto.getNeededBy() != null) request.setNeededBy(dto.getNeededBy());
        if (dto.getNotes() != null) request.setNotes(dto.getNotes().trim());

        BloodRequest saved = bloodRequestRepository.save(request);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Request updated successfully.");
        resp.put("request", saved);

        return ResponseEntity.ok(resp);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRequest(@AuthenticationPrincipal User currentUser, @PathVariable Long id) {
        if (currentUser == null) return ResponseEntity.status(401).body(ApiResponse.error("Authentication required."));

        BloodRequest request = bloodRequestRepository.findById(id).orElse(null);
        if (request == null) return ResponseEntity.status(404).body(ApiResponse.error("Request not found."));

        boolean isOwner = request.getRequestedBy() != null && request.getRequestedBy().getId().equals(currentUser.getId());
        boolean isAdmin = "admin".equals(currentUser.getRole());

        if (!isOwner && !isAdmin) {
            return ResponseEntity.status(403).body(ApiResponse.error("Unauthorized: You can only delete your own requests."));
        }

        if (!isAdmin && !"Open".equals(request.getStatus())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Cannot delete request in '" + request.getStatus() + "' status. Only 'Open' requests can be deleted."));
        }

        bloodRequestRepository.delete(request);
        return ResponseEntity.ok(ApiResponse.ok("Request deleted successfully."));
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<?> acceptRequest(@AuthenticationPrincipal User currentUser, @PathVariable Long id) {
        if (currentUser == null) return ResponseEntity.status(401).body(ApiResponse.error("Authentication required."));

        BloodRequest request = bloodRequestRepository.findById(id).orElse(null);
        if (request == null) return ResponseEntity.status(404).body(ApiResponse.error("Request not found."));

        if (!"Open".equals(request.getStatus())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("This request is not open for acceptance (current status: '" + request.getStatus() + "')."));
        }

        if (request.getNeededBy() != null && request.getNeededBy().isBefore(LocalDateTime.now())) {
            request.setStatus("Expired");
            bloodRequestRepository.save(request);
            return ResponseEntity.badRequest().body(ApiResponse.error("This request has expired and can no longer be accepted."));
        }

        User donor = userRepository.findById(currentUser.getId()).orElse(null);
        EligibilityResult eligibility = BloodCompatibility.calculateDonorEligibility(donor);
        if (!eligibility.isEligible()) {
            Map<String, Object> errResp = new HashMap<>();
            errResp.put("success", false);
            errResp.put("message", "You are currently ineligible to accept donations: " + eligibility.getReason());
            errResp.put("eligibility", eligibility);
            return ResponseEntity.badRequest().body(errResp);
        }

        request.setStatus("Accepted");
        request.setAcceptedBy(donor);

        BloodRequest saved = bloodRequestRepository.save(request);

        RequestResponse response = new RequestResponse(donor, saved, "accepted");
        requestResponseRepository.save(response);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Request accepted! Requester has been notified and can now see your contact details.");
        resp.put("request", saved);

        return ResponseEntity.ok(resp);
    }

    @PostMapping("/{id}/decline")
    public ResponseEntity<?> declineRequest(@AuthenticationPrincipal User currentUser, @PathVariable Long id) {
        if (currentUser == null) return ResponseEntity.status(401).body(ApiResponse.error("Authentication required."));

        BloodRequest request = bloodRequestRepository.findById(id).orElse(null);
        if (request == null) return ResponseEntity.status(404).body(ApiResponse.error("Request not found."));

        RequestResponse response = new RequestResponse(currentUser, request, "declined");
        requestResponseRepository.save(response);

        return ResponseEntity.ok(ApiResponse.ok("Request declined. Thank you for your feedback."));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateRequestStatus(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateDto dto
    ) {
        if (currentUser == null) return ResponseEntity.status(401).body(ApiResponse.error("Authentication required."));

        BloodRequest request = bloodRequestRepository.findById(id).orElse(null);
        if (request == null) return ResponseEntity.status(404).body(ApiResponse.error("Request not found."));

        boolean isOwner = request.getRequestedBy() != null && request.getRequestedBy().getId().equals(currentUser.getId());
        boolean isAdmin = "admin".equals(currentUser.getRole());

        if (!isOwner && !isAdmin) {
            return ResponseEntity.status(403).body(ApiResponse.error("Unauthorized: Only the requester who created this request or an admin can update its status."));
        }

        request.setStatus(dto.getStatus());
        BloodRequest savedRequest = bloodRequestRepository.save(request);

        Donation donationRecord = null;
        if ("Fulfilled".equalsIgnoreCase(dto.getStatus()) && request.getAcceptedBy() != null) {
            User acceptedDonor = userRepository.findById(request.getAcceptedBy().getId()).orElse(null);

            donationRecord = new Donation(
                    acceptedDonor,
                    savedRequest,
                    savedRequest.getUnitsNeeded(),
                    savedRequest.getHospital(),
                    savedRequest.getCity(),
                    "Fulfilled for patient " + savedRequest.getPatientName() + " (" + savedRequest.getBloodGroup() + ")"
            );
            donationRepository.save(donationRecord);

            // Update donor's lastDonationDate to TODAY
            if (acceptedDonor != null) {
                acceptedDonor.setLastDonationDate(LocalDate.now());
                userRepository.save(acceptedDonor);
            }
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Request status successfully updated to '" + dto.getStatus() + "'.");
        resp.put("request", savedRequest);
        resp.put("donation", donationRecord);

        return ResponseEntity.ok(resp);
    }
}
