package com.lifelink.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;

public class EligibilityResult {
    private boolean isEligible;
    private String reason;
    private long daysRemaining;
    private LocalDate nextEligibleDate;

    public EligibilityResult() {}

    public EligibilityResult(boolean isEligible, String reason, long daysRemaining, LocalDate nextEligibleDate) {
        this.isEligible = isEligible;
        this.reason = reason;
        this.daysRemaining = daysRemaining;
        this.nextEligibleDate = nextEligibleDate;
    }

    @JsonProperty("isEligible")
    public boolean isEligible() {
        return isEligible;
    }

    public void setEligible(boolean eligible) {
        isEligible = eligible;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public long getDaysRemaining() {
        return daysRemaining;
    }

    public void setDaysRemaining(long daysRemaining) {
        this.daysRemaining = daysRemaining;
    }

    public LocalDate getNextEligibleDate() {
        return nextEligibleDate;
    }

    public void setNextEligibleDate(LocalDate nextEligibleDate) {
        this.nextEligibleDate = nextEligibleDate;
    }
}
