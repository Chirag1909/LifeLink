package com.lifelink.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "donations")
public class Donation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "donor_id", nullable = false)
    private User donor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "blood_request_id", nullable = false)
    private BloodRequest request;

    @Column(nullable = false)
    private LocalDateTime date = LocalDateTime.now();

    @Column(nullable = false, length = 20)
    private String status = "Completed";

    @Column(nullable = false)
    private Integer units = 1;

    @Column(length = 200)
    private String hospital;

    @Column(length = 80)
    private String city;

    @Column(length = 500)
    private String notes = "Donation fulfilled successfully via LifeLink";

    public Donation() {}

    public Donation(User donor, BloodRequest request, Integer units, String hospital, String city, String notes) {
        this.donor = donor;
        this.request = request;
        this.date = LocalDateTime.now();
        this.status = "Completed";
        this.units = units != null ? units : 1;
        this.hospital = hospital;
        this.city = city;
        this.notes = notes;
    }

    @JsonProperty("_id")
    public String getMongoCompatId() {
        return id != null ? id.toString() : null;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getDonor() {
        return donor;
    }

    public void setDonor(User donor) {
        this.donor = donor;
    }

    public BloodRequest getRequest() {
        return request;
    }

    public void setRequest(BloodRequest request) {
        this.request = request;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getUnits() {
        return units;
    }

    public void setUnits(Integer units) {
        this.units = units;
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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
