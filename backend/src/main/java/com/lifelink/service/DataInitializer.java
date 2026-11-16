package com.lifelink.service;

import com.lifelink.model.BloodRequest;
import com.lifelink.model.Donation;
import com.lifelink.model.RequestResponse;
import com.lifelink.model.User;
import com.lifelink.repository.BloodRequestRepository;
import com.lifelink.repository.DonationRepository;
import com.lifelink.repository.RequestResponseRepository;
import com.lifelink.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BloodRequestRepository bloodRequestRepository;
    private final DonationRepository donationRepository;
    private final RequestResponseRepository requestResponseRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           BloodRequestRepository bloodRequestRepository,
                           DonationRepository donationRepository,
                           RequestResponseRepository requestResponseRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.bloodRequestRepository = bloodRequestRepository;
        this.donationRepository = donationRepository;
        this.requestResponseRepository = requestResponseRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            System.out.println("[LifeLink DB] Existing database records found. Skipping initial seeding.");
            return;
        }

        System.out.println("[LifeLink Seeder] Seeding database with Admin, 8 Donors, 3 Requesters, and 10 Sample Requests...");

        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();

        // 1. Admin
        User admin = new User();
        admin.setName("LifeLink Administrator");
        admin.setEmail("admin@lifelink.com");
        admin.setPassword(passwordEncoder.encode("Admin@123"));
        admin.setPhone("+1 555-0100");
        admin.setRole("admin");
        admin.setCity("New York");
        admin.setIsVerified(true);
        admin.setIsBlocked(false);
        userRepository.save(admin);

        // 2. 8 Donors
        // Donor 1: John Carter (O-, New York) - Eligible (>90 days ago)
        User d1 = new User();
        d1.setName("John Carter (Universal Donor)");
        d1.setEmail("john.carter@donor.com");
        d1.setPassword(passwordEncoder.encode("Password@123"));
        d1.setPhone("+1 555-0201");
        d1.setRole("donor");
        d1.setBloodGroup("O-");
        d1.setCity("New York");
        d1.setIsAvailable(true);
        d1.setIsVerified(true);
        d1.setIsBlocked(false);
        d1.setLastDonationDate(today.minusDays(110));
        userRepository.save(d1);

        // Donor 2: Sarah Connor (O+, Boston) - Eligible (null last donation)
        User d2 = new User();
        d2.setName("Sarah Connor");
        d2.setEmail("sarah.connor@donor.com");
        d2.setPassword(passwordEncoder.encode("Password@123"));
        d2.setPhone("+1 555-0202");
        d2.setRole("donor");
        d2.setBloodGroup("O+");
        d2.setCity("Boston");
        d2.setIsAvailable(true);
        d2.setIsVerified(true);
        d2.setIsBlocked(false);
        userRepository.save(d2);

        // Donor 3: Michael Chen (A+, New York) - Eligible
        User d3 = new User();
        d3.setName("Michael Chen");
        d3.setEmail("michael.chen@donor.com");
        d3.setPassword(passwordEncoder.encode("Password@123"));
        d3.setPhone("+1 555-0203");
        d3.setRole("donor");
        d3.setBloodGroup("A+");
        d3.setCity("New York");
        d3.setIsAvailable(true);
        d3.setIsVerified(true);
        d3.setIsBlocked(false);
        d3.setLastDonationDate(today.minusDays(100));
        userRepository.save(d3);

        // Donor 4: Emily Watson (A-, Chicago) - Eligible
        User d4 = new User();
        d4.setName("Emily Watson");
        d4.setEmail("emily.watson@donor.com");
        d4.setPassword(passwordEncoder.encode("Password@123"));
        d4.setPhone("+1 555-0204");
        d4.setRole("donor");
        d4.setBloodGroup("A-");
        d4.setCity("Chicago");
        d4.setIsAvailable(true);
        d4.setIsVerified(true);
        d4.setIsBlocked(false);
        userRepository.save(d4);

        // Donor 5: David Miller (B+, New York) - Eligible
        User d5 = new User();
        d5.setName("David Miller");
        d5.setEmail("david.miller@donor.com");
        d5.setPassword(passwordEncoder.encode("Password@123"));
        d5.setPhone("+1 555-0205");
        d5.setRole("donor");
        d5.setBloodGroup("B+");
        d5.setCity("New York");
        d5.setIsAvailable(true);
        d5.setIsVerified(true);
        d5.setIsBlocked(false);
        d5.setLastDonationDate(today.minusDays(130));
        userRepository.save(d5);

        // Donor 6: Priya Patel (B-, Boston) - Eligible
        User d6 = new User();
        d6.setName("Priya Patel");
        d6.setEmail("priya.patel@donor.com");
        d6.setPassword(passwordEncoder.encode("Password@123"));
        d6.setPhone("+1 555-0206");
        d6.setRole("donor");
        d6.setBloodGroup("B-");
        d6.setCity("Boston");
        d6.setIsAvailable(true);
        d6.setIsVerified(true);
        d6.setIsBlocked(false);
        userRepository.save(d6);

        // Donor 7: Carlos Rodriguez (AB+, Chicago) - Unavailable toggle test
        User d7 = new User();
        d7.setName("Carlos Rodriguez");
        d7.setEmail("carlos.rodriguez@donor.com");
        d7.setPassword(passwordEncoder.encode("Password@123"));
        d7.setPhone("+1 555-0207");
        d7.setRole("donor");
        d7.setBloodGroup("AB+");
        d7.setCity("Chicago");
        d7.setIsAvailable(false); // Availability OFF
        d7.setIsVerified(true);
        d7.setIsBlocked(false);
        d7.setLastDonationDate(today.minusDays(150));
        userRepository.save(d7);

        // Donor 8: Aisha Khan (AB-, New York) - In Cooldown test
        User d8 = new User();
        d8.setName("Aisha Khan");
        d8.setEmail("aisha.khan@donor.com");
        d8.setPassword(passwordEncoder.encode("Password@123"));
        d8.setPhone("+1 555-0208");
        d8.setRole("donor");
        d8.setBloodGroup("AB-");
        d8.setCity("New York");
        d8.setIsAvailable(true);
        d8.setIsVerified(true);
        d8.setIsBlocked(false);
        d8.setLastDonationDate(today.minusDays(25)); // 25 days ago (<90 days cooldown)
        userRepository.save(d8);

        // 3. 3 Requesters
        User r1 = new User();
        r1.setName("Robert Evans");
        r1.setEmail("robert@requester.com");
        r1.setPassword(passwordEncoder.encode("Password@123"));
        r1.setPhone("+1 555-0301");
        r1.setRole("requester");
        r1.setCity("New York");
        r1.setIsVerified(true);
        userRepository.save(r1);

        User r2 = new User();
        r2.setName("Jennifer Lopez");
        r2.setEmail("jennifer@requester.com");
        r2.setPassword(passwordEncoder.encode("Password@123"));
        r2.setPhone("+1 555-0302");
        r2.setRole("requester");
        r2.setCity("Boston");
        r2.setIsVerified(true);
        userRepository.save(r2);

        User r3 = new User();
        r3.setName("Marcus Vance");
        r3.setEmail("marcus@requester.com");
        r3.setPassword(passwordEncoder.encode("Password@123"));
        r3.setPhone("+1 555-0303");
        r3.setRole("requester");
        r3.setCity("Chicago");
        r3.setIsVerified(true);
        userRepository.save(r3);

        // 4. 10 Sample Blood Requests in various statuses
        // Req 1: Critical Open in New York for O-
        BloodRequest req1 = new BloodRequest();
        req1.setPatientName("Emma Richardson");
        req1.setBloodGroup("O-");
        req1.setUnitsNeeded(2);
        req1.setHospital("Mount Sinai Hospital, Emergency Trauma Unit 4B");
        req1.setCity("New York");
        req1.setContactPhone("+1 555-0301");
        req1.setUrgency("Critical");
        req1.setNeededBy(now.plusDays(2));
        req1.setStatus("Open");
        req1.setRequestedBy(r1);
        req1.setNotes("Urgent accident victim undergoing emergency spinal surgery.");
        bloodRequestRepository.save(req1);

        // Req 2: Urgent Open in New York for A+
        BloodRequest req2 = new BloodRequest();
        req2.setPatientName("Liam Johnson");
        req2.setBloodGroup("A+");
        req2.setUnitsNeeded(1);
        req2.setHospital("NewYork-Presbyterian Hospital, Room 312");
        req2.setCity("New York");
        req2.setContactPhone("+1 555-0301");
        req2.setUrgency("Urgent");
        req2.setNeededBy(now.plusDays(4));
        req2.setStatus("Open");
        req2.setRequestedBy(r1);
        req2.setNotes("Severe anemia patient needing scheduled transfusion.");
        bloodRequestRepository.save(req2);

        // Req 3: Normal Open in Boston for O+
        BloodRequest req3 = new BloodRequest();
        req3.setPatientName("Sophia Miller");
        req3.setBloodGroup("O+");
        req3.setUnitsNeeded(2);
        req3.setHospital("Massachusetts General Hospital, Ward 6");
        req3.setCity("Boston");
        req3.setContactPhone("+1 555-0302");
        req3.setUrgency("Normal");
        req3.setNeededBy(now.plusDays(5));
        req3.setStatus("Open");
        req3.setRequestedBy(r2);
        req3.setNotes("Preparation for planned orthopedic hip replacement.");
        bloodRequestRepository.save(req3);

        // Req 4: Critical Open in Chicago for A-
        BloodRequest req4 = new BloodRequest();
        req4.setPatientName("Lucas Scott");
        req4.setBloodGroup("A-");
        req4.setUnitsNeeded(3);
        req4.setHospital("Northwestern Memorial Hospital, ICU Ward 2");
        req4.setCity("Chicago");
        req4.setContactPhone("+1 555-0303");
        req4.setUrgency("Critical");
        req4.setNeededBy(now.plusDays(1));
        req4.setStatus("Open");
        req4.setRequestedBy(r3);
        req4.setNotes("Leukemia patient experiencing acute platelet and red cell drop.");
        bloodRequestRepository.save(req4);

        // Req 5: Urgent Open in New York for B+
        BloodRequest req5 = new BloodRequest();
        req5.setPatientName("Noah Davis");
        req5.setBloodGroup("B+");
        req5.setUnitsNeeded(1);
        req5.setHospital("Lenox Hill Hospital, Surgical Wing");
        req5.setCity("New York");
        req5.setContactPhone("+1 555-0301");
        req5.setUrgency("Urgent");
        req5.setNeededBy(now.plusDays(3));
        req5.setStatus("Open");
        req5.setRequestedBy(r1);
        req5.setNotes("Cardiac bypass surgery scheduled for tomorrow morning.");
        bloodRequestRepository.save(req5);

        // Req 6: Accepted in Boston (Sarah Connor accepted)
        BloodRequest req6 = new BloodRequest();
        req6.setPatientName("Hannah Abbott");
        req6.setBloodGroup("O+");
        req6.setUnitsNeeded(1);
        req6.setHospital("Brigham and Womens Hospital, 5th Floor");
        req6.setCity("Boston");
        req6.setContactPhone("+1 555-0302");
        req6.setUrgency("Urgent");
        req6.setNeededBy(now.plusDays(2));
        req6.setStatus("Accepted");
        req6.setRequestedBy(r2);
        req6.setAcceptedBy(d2);
        req6.setNotes("Donor accepted; phone number is now visible to requester.");
        BloodRequest savedReq6 = bloodRequestRepository.save(req6);

        RequestResponse resp6 = new RequestResponse(d2, savedReq6, "accepted");
        requestResponseRepository.save(resp6);

        // Req 7: Fulfilled in New York (John Carter donated)
        BloodRequest req7 = new BloodRequest();
        req7.setPatientName("Arthur Pendelton");
        req7.setBloodGroup("O-");
        req7.setUnitsNeeded(2);
        req7.setHospital("Mount Sinai Hospital, West Wing");
        req7.setCity("New York");
        req7.setContactPhone("+1 555-0301");
        req7.setUrgency("Critical");
        req7.setNeededBy(now.minusDays(10));
        req7.setStatus("Fulfilled");
        req7.setRequestedBy(r1);
        req7.setAcceptedBy(d1);
        req7.setNotes("Successfully fulfilled. Patient recovered safely.");
        BloodRequest savedReq7 = bloodRequestRepository.save(req7);

        Donation don1 = new Donation(d1, savedReq7, 2, "Mount Sinai Hospital, West Wing", "New York", "Fulfilled for patient Arthur Pendelton (O-)");
        don1.setDate(now.minusDays(11));
        donationRepository.save(don1);

        // Req 8: Fulfilled in New York (David Miller donated)
        BloodRequest req8 = new BloodRequest();
        req8.setPatientName("Benjamin Clark");
        req8.setBloodGroup("B+");
        req8.setUnitsNeeded(1);
        req8.setHospital("NYU Langone Health, Center 3");
        req8.setCity("New York");
        req8.setContactPhone("+1 555-0301");
        req8.setUrgency("Normal");
        req8.setNeededBy(now.minusDays(20));
        req8.setStatus("Fulfilled");
        req8.setRequestedBy(r1);
        req8.setAcceptedBy(d5);
        req8.setNotes("Transfusion completed successfully.");
        BloodRequest savedReq8 = bloodRequestRepository.save(req8);

        Donation don2 = new Donation(d5, savedReq8, 1, "NYU Langone Health, Center 3", "New York", "Fulfilled for patient Benjamin Clark (B+)");
        don2.setDate(now.minusDays(21));
        donationRepository.save(don2);

        // Req 9: Closed in Chicago
        BloodRequest req9 = new BloodRequest();
        req9.setPatientName("Grace Hopper");
        req9.setBloodGroup("A-");
        req9.setUnitsNeeded(1);
        req9.setHospital("Rush University Medical Center");
        req9.setCity("Chicago");
        req9.setContactPhone("+1 555-0303");
        req9.setUrgency("Normal");
        req9.setNeededBy(now.minusDays(5));
        req9.setStatus("Closed");
        req9.setRequestedBy(r3);
        req9.setNotes("Closed by requester: hospital internal blood bank provided units.");
        bloodRequestRepository.save(req9);

        // Req 10: Expired in New York
        BloodRequest req10 = new BloodRequest();
        req10.setPatientName("Ethan Wright");
        req10.setBloodGroup("AB-");
        req10.setUnitsNeeded(1);
        req10.setHospital("Bellevue Hospital Center");
        req10.setCity("New York");
        req10.setContactPhone("+1 555-0301");
        req10.setUrgency("Urgent");
        req10.setNeededBy(now.minusDays(3));
        req10.setStatus("Expired");
        req10.setRequestedBy(r1);
        req10.setNotes("Request past needed-by deadline; marked as Expired.");
        bloodRequestRepository.save(req10);

        System.out.println("[LifeLink Seeder] Successfully populated database with Demo accounts & requests!");
    }
}
