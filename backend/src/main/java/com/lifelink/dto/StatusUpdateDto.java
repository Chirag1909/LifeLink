package com.lifelink.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class StatusUpdateDto {
    @NotBlank(message = "Status is required")
    @Pattern(regexp = "Fulfilled|Closed", message = "Status must be either 'Fulfilled' or 'Closed'")
    private String status;

    public StatusUpdateDto() {}

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
