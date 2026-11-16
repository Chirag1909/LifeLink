package com.lifelink.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "blood_requests")
public class BloodRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String patientName;

    @Column(nullable = false, length = 10)
    private String bloodGroup;

    @Column(nullable = false)
    private Integer unitsNeeded = 1;

    @Column(nullable = false, length = 200)
    private String hospital;

    @Column(nullable = false, length = 80)
    private String city;

    @Column(nullable = false, length = 30)
    private String contactPhone;

    @Column(nullable = false, length = 20)
    private String urgency = "Normal"; // "Critical", "Urgent", "Normal"

    @Column(nullable = false)
    private LocalDateTime neededBy;

    @Column(nullable = false, length = 20)
    private String status = "Open"; // "Open", "Accepted", "Fulfilled", "Closed", "Expired"

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "requested_by_id", nullable = false)
    private User requestedBy;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "accepted_by_id")
    private User acceptedBy;

    @OneToMany(mappedBy = "bloodRequest", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<RequestResponse> responses = new ArrayList<>();

    @Column(length = 500)
    private String notes = "";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public BloodRequest() {}

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @JsonProperty("_id")
    public String getMongoCompatId() {
        return id != null ? id.toString() : null;
    }

    // Auto-check expired status
    public String getStatus() {
        if ("Open".equals(status) && neededBy != null && neededBy.isBefore(LocalDateTime.now())) {
            return "Expired";
        }
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public String getBloodGroup() {
        return bloodGroup;
    }

    public void setBloodGroup(String bloodGroup) {
        this.bloodGroup = bloodGroup;
    }

    public Integer getUnitsNeeded() {
        return unitsNeeded;
    }

    public void setUnitsNeeded(Integer unitsNeeded) {
        this.unitsNeeded = unitsNeeded;
    }

    public String getHospital() {
        return hospital;
    }

    public void setHospital(String hospital) {
        this.hospital = hospital;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getUrgency() {
        return urgency;
    }

    public void setUrgency(String urgency) {
        this.urgency = urgency;
    }

    public LocalDateTime getNeededBy() {
        return neededBy;
    }

    public void setNeededBy(LocalDateTime neededBy) {
        this.neededBy = neededBy;
    }

    public User getRequestedBy() {
        return requestedBy;
    }

    public void setRequestedBy(User requestedBy) {
        this.requestedBy = requestedBy;
    }

    public User getAcceptedBy() {
        return acceptedBy;
    }

    public void setAcceptedBy(User acceptedBy) {
        this.acceptedBy = acceptedBy;
    }

    public List<RequestResponse> getResponses() {
        return responses;
    }

    public void setResponses(List<RequestResponse> responses) {
        this.responses = responses;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
