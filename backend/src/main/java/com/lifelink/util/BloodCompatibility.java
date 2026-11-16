package com.lifelink.util;

import com.lifelink.model.EligibilityResult;
import com.lifelink.model.User;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

public class BloodCompatibility {

    public static final List<String> BLOOD_GROUPS = List.of("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-");
    public static final long DONATION_COOLDOWN_DAYS = 90;

    // What groups each donor can DONATE TO
    public static final Map<String, List<String>> CAN_DONATE_TO = Map.of(
            "O-", List.of("O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"),
            "O+", List.of("O+", "A+", "B+", "AB+"),
            "A-", List.of("A-", "A+", "AB-", "AB+"),
            "A+", List.of("A+", "AB+"),
            "B-", List.of("B-", "B+", "AB-", "AB+"),
            "B+", List.of("B+", "AB+"),
            "AB-", List.of("AB-", "AB+"),
            "AB+", List.of("AB+")
    );

    // What groups each recipient can RECEIVE FROM
    public static final Map<String, List<String>> CAN_RECEIVE_FROM = Map.of(
            "O-", List.of("O-"),
            "O+", List.of("O-", "O+"),
            "A-", List.of("O-", "A-"),
            "A+", List.of("O-", "O+", "A-", "A+"),
            "B-", List.of("O-", "B-"),
            "B+", List.of("O-", "O+", "B-", "B+"),
            "AB-", List.of("O-", "A-", "B-", "AB-"),
            "AB+", List.of("O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+")
    );

    public static boolean isCompatible(String donorBloodGroup, String patientBloodGroup) {
        if (donorBloodGroup == null || patientBloodGroup == null) return false;
        List<String> compatible = CAN_DONATE_TO.get(donorBloodGroup.trim());
        return compatible != null && compatible.contains(patientBloodGroup.trim());
    }

    public static List<String> getCompatibleDonorGroups(String neededBloodGroup) {
        if (neededBloodGroup == null) return Collections.emptyList();
        List<String> list = CAN_RECEIVE_FROM.get(neededBloodGroup.trim());
        return list != null ? list : List.of(neededBloodGroup.trim());
    }

    public static String maskPhoneNumber(String phone) {
        if (phone == null || phone.trim().isEmpty()) return "Hidden";
        String str = phone.trim();
        if (str.length() <= 4) return "****";
        int visibleCount = 4;
        int maskCount = Math.max(str.length() - visibleCount, 4);
        return str.substring(0, visibleCount) + "*".repeat(maskCount);
    }

    public static EligibilityResult calculateDonorEligibility(User donor) {
        if (donor == null) {
            return new EligibilityResult(false, "Invalid donor record", 0, null);
        }

        if (Boolean.TRUE.equals(donor.getIsBlocked())) {
            return new EligibilityResult(false, "Account is blocked by administrator", 0, null);
        }
        if (Boolean.FALSE.equals(donor.getIsVerified())) {
            return new EligibilityResult(false, "Donor account is pending admin verification", 0, null);
        }
        if (Boolean.FALSE.equals(donor.getIsAvailable())) {
            return new EligibilityResult(false, "Donor availability toggle is turned OFF", 0, null);
        }

        if (donor.getLastDonationDate() != null) {
            LocalDate lastDate = donor.getLastDonationDate();
            LocalDate now = LocalDate.now();
            long diffDays = ChronoUnit.DAYS.between(lastDate, now);

            if (diffDays < DONATION_COOLDOWN_DAYS) {
                long daysRemaining = DONATION_COOLDOWN_DAYS - diffDays;
                LocalDate nextEligibleDate = lastDate.plusDays(DONATION_COOLDOWN_DAYS);
                return new EligibilityResult(
                        false,
                        "Donation cooldown in effect. " + daysRemaining + " day(s) remaining until next eligible donation.",
                        daysRemaining,
                        nextEligibleDate
                );
            }
        }

        return new EligibilityResult(true, "Donor is eligible and ready for donation", 0, null);
    }
}
