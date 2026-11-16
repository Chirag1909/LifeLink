package com.lifelink.controller;

import com.lifelink.config.JwtUtils;
import com.lifelink.dto.ApiResponse;
import com.lifelink.dto.LoginRequest;
import com.lifelink.dto.RegisterRequest;
import com.lifelink.model.User;
import com.lifelink.repository.UserRepository;
import com.lifelink.util.BloodCompatibility;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail().trim().toLowerCase())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("A user with this email is already registered."));
        }

        String role = "admin".equalsIgnoreCase(req.getRole()) ? "requester" : (req.getRole() != null ? req.getRole().toLowerCase() : "requester");

        if ("donor".equals(role) && (req.getBloodGroup() == null || req.getBloodGroup().trim().isEmpty())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Blood group is required for donors."));
        }

        User user = new User();
        user.setName(req.getName().trim());
        user.setEmail(req.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setPhone(req.getPhone().trim());
        user.setRole(role);
        user.setCity(req.getCity().trim());
        user.setIsAvailable(req.getIsAvailable() != null ? req.getIsAvailable() : true);
        user.setIsVerified(true);
        user.setIsBlocked(false);

        if ("donor".equals(role)) {
            user.setBloodGroup(req.getBloodGroup().trim());
            user.setEligibility(BloodCompatibility.calculateDonorEligibility(user));
        }

        User savedUser = userRepository.save(user);
        String token = jwtUtils.generateToken(savedUser);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Registration successful! Welcome to LifeLink.");
        resp.put("token", token);
        resp.put("user", savedUser);

        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail().trim().toLowerCase()).orElse(null);

        if (user == null || !passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid email or password credentials."));
        }

        if (Boolean.TRUE.equals(user.getIsBlocked())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Your account has been blocked by an administrator. Please contact support."));
        }

        if ("donor".equals(user.getRole())) {
            user.setEligibility(BloodCompatibility.calculateDonorEligibility(user));
        }

        String token = jwtUtils.generateToken(user);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Logged in successfully.");
        resp.put("token", token);
        resp.put("user", user);

        return ResponseEntity.ok(resp);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(@AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Authentication required."));
        }

        User user = userRepository.findById(currentUser.getId()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("User not found."));
        }

        if ("donor".equals(user.getRole())) {
            user.setEligibility(BloodCompatibility.calculateDonorEligibility(user));
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("user", user);

        return ResponseEntity.ok(resp);
    }
}
