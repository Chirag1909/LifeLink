package com.lifelink.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class CreateBloodRequestDto {
    @NotBlank(message = "Patient name is required")
    private String patientName;

    @NotBlank(message = "Blood group is required")
    private String bloodGroup;

    @NotNull(message = "Units needed must be specified")
    @Min(value = 1, message = "Units needed must be at least 1 unit")
    private Integer unitsNeeded = 1;

    @NotBlank(message = "Hospital name/address is required")
    private String hospital;

    @NotBlank(message = "City is required")
    private String city;

    private String contactPhone;
    private String urgency = "Normal";

    @NotNull(message = "A valid needed-by date is required")
    private LocalDateTime neededBy;

    private String notes;

    public CreateBloodRequestDto() {}

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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
