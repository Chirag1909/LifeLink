package com.lifelink.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class DonorSearchResultDto {
    private Long id;
    private String name;
    private String bloodGroup;
    private String city;
    private Boolean isAvailable;
    private LocalDate lastDonationDate;
    private String phone;
    private Boolean isMasked = true;
    private LocalDateTime createdAt;

    public DonorSearchResultDto() {}

    public DonorSearchResultDto(Long id, String name, String bloodGroup, String city, Boolean isAvailable,
                                LocalDate lastDonationDate, String phone, Boolean isMasked, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.bloodGroup = bloodGroup;
        this.city = city;
        this.isAvailable = isAvailable;
        this.lastDonationDate = lastDonationDate;
        this.phone = phone;
        this.isMasked = isMasked;
        this.createdAt = createdAt;
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBloodGroup() {
        return bloodGroup;
    }

    public void setBloodGroup(String bloodGroup) {
        this.bloodGroup = bloodGroup;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    @JsonProperty("isAvailable")
    public Boolean getIsAvailable() {
        return isAvailable;
    }

    public void setIsAvailable(Boolean isAvailable) {
        this.isAvailable = isAvailable;
    }

    public LocalDate getLastDonationDate() {
        return lastDonationDate;
    }

    public void setLastDonationDate(LocalDate lastDonationDate) {
        this.lastDonationDate = lastDonationDate;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    @JsonProperty("isMasked")
    public Boolean getIsMasked() {
        return isMasked;
    }

    public void setIsMasked(Boolean isMasked) {
        this.isMasked = isMasked;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
