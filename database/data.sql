-- =====================================================================
-- LifeLink: Seed Data (Admin, Donors, Requesters, Sample Requests)
-- Default Passwords:
-- Admin:    Admin@123    ($2a$10$vI8aWBnW3fID.3GDaH.2q.x2nEepfFf9FjB5X8UfZd1m8OqN0Qx6e)
-- Users:    Password@123 ($2a$10$EIXzaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW)
-- =====================================================================

-- 1. USERS SEED
-- 1 Admin
INSERT INTO users (id, name, email, password, phone, role, blood_group, city, is_available, last_donation_date, is_verified, is_blocked)
VALUES (1, 'LifeLink Administrator', 'admin@lifelink.com', '$2a$10$EIXzaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', '+1 555-0100', 'admin', NULL, 'New York', TRUE, NULL, TRUE, FALSE);

-- 8 Donors
INSERT INTO users (id, name, email, password, phone, role, blood_group, city, is_available, last_donation_date, is_verified, is_blocked) VALUES
(2, 'John Carter (Universal Donor)', 'john.carter@donor.com', '$2a$10$EIXzaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', '+1 555-0201', 'donor', 'O-', 'New York', TRUE, DATEADD('DAY', -110, CURRENT_DATE), TRUE, FALSE),
(3, 'Sarah Connor', 'sarah.connor@donor.com', '$2a$10$EIXzaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', '+1 555-0202', 'donor', 'O+', 'Boston', TRUE, NULL, TRUE, FALSE),
(4, 'Michael Chen', 'michael.chen@donor.com', '$2a$10$EIXzaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', '+1 555-0203', 'donor', 'A+', 'New York', TRUE, DATEADD('DAY', -100, CURRENT_DATE), TRUE, FALSE),
(5, 'Emily Watson', 'emily.watson@donor.com', '$2a$10$EIXzaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', '+1 555-0204', 'donor', 'A-', 'Chicago', TRUE, NULL, TRUE, FALSE),
(6, 'David Miller', 'david.miller@donor.com', '$2a$10$EIXzaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', '+1 555-0205', 'donor', 'B+', 'New York', TRUE, DATEADD('DAY', -130, CURRENT_DATE), TRUE, FALSE),
(7, 'Priya Patel', 'priya.patel@donor.com', '$2a$10$EIXzaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', '+1 555-0206', 'donor', 'B-', 'Boston', TRUE, NULL, TRUE, FALSE),
(8, 'Carlos Rodriguez', 'carlos.rodriguez@donor.com', '$2a$10$EIXzaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', '+1 555-0207', 'donor', 'AB+', 'Chicago', FALSE, DATEADD('DAY', -150, CURRENT_DATE), TRUE, FALSE),
(9, 'Aisha Khan', 'aisha.khan@donor.com', '$2a$10$EIXzaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', '+1 555-0208', 'donor', 'AB-', 'New York', TRUE, DATEADD('DAY', -25, CURRENT_DATE), TRUE, FALSE);

-- 3 Requesters
INSERT INTO users (id, name, email, password, phone, role, blood_group, city, is_available, last_donation_date, is_verified, is_blocked) VALUES
(10, 'Robert Evans', 'robert@requester.com', '$2a$10$EIXzaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', '+1 555-0301', 'requester', NULL, 'New York', TRUE, NULL, TRUE, FALSE),
(11, 'Jennifer Lopez', 'jennifer@requester.com', '$2a$10$EIXzaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', '+1 555-0302', 'requester', NULL, 'Boston', TRUE, NULL, TRUE, FALSE),
(12, 'Marcus Vance', 'marcus@requester.com', '$2a$10$EIXzaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', '+1 555-0303', 'requester', NULL, 'Chicago', TRUE, NULL, TRUE, FALSE);

-- 2. BLOOD REQUESTS SEED
INSERT INTO blood_requests (id, patient_name, blood_group, units_needed, hospital, city, contact_phone, urgency, needed_by, status, requested_by_id, accepted_by_id, notes) VALUES
(1, 'Emma Richardson', 'O-', 2, 'Mount Sinai Hospital, Emergency Trauma Unit 4B', 'New York', '+1 555-0301', 'Critical', DATEADD('DAY', 2, CURRENT_TIMESTAMP), 'Open', 10, NULL, 'Urgent accident victim undergoing emergency spinal surgery.'),
(2, 'Liam Johnson', 'A+', 1, 'NewYork-Presbyterian Hospital, Room 312', 'New York', '+1 555-0301', 'Urgent', DATEADD('DAY', 4, CURRENT_TIMESTAMP), 'Open', 10, NULL, 'Severe anemia patient needing scheduled transfusion.'),
(3, 'Sophia Miller', 'O+', 2, 'Massachusetts General Hospital, Ward 6', 'Boston', '+1 555-0302', 'Normal', DATEADD('DAY', 5, CURRENT_TIMESTAMP), 'Open', 11, NULL, 'Preparation for planned orthopedic hip replacement.'),
(4, 'Lucas Scott', 'A-', 3, 'Northwestern Memorial Hospital, ICU Ward 2', 'Chicago', '+1 555-0303', 'Critical', DATEADD('DAY', 1, CURRENT_TIMESTAMP), 'Open', 12, NULL, 'Leukemia patient experiencing acute platelet and red cell drop.'),
(5, 'Noah Davis', 'B+', 1, 'Lenox Hill Hospital, Surgical Wing', 'New York', '+1 555-0301', 'Urgent', DATEADD('DAY', 3, CURRENT_TIMESTAMP), 'Open', 10, NULL, 'Cardiac bypass surgery scheduled for tomorrow morning.'),
(6, 'Hannah Abbott', 'O+', 1, 'Brigham and Womens Hospital, 5th Floor', 'Boston', '+1 555-0302', 'Urgent', DATEADD('DAY', 2, CURRENT_TIMESTAMP), 'Accepted', 11, 3, 'Donor accepted; phone number is now visible to requester.'),
(7, 'Arthur Pendelton', 'O-', 2, 'Mount Sinai Hospital, West Wing', 'New York', '+1 555-0301', 'Critical', DATEADD('DAY', -10, CURRENT_TIMESTAMP), 'Fulfilled', 10, 2, 'Successfully fulfilled. Patient recovered safely.'),
(8, 'Benjamin Clark', 'B+', 1, 'NYU Langone Health, Center 3', 'New York', '+1 555-0301', 'Normal', DATEADD('DAY', -20, CURRENT_TIMESTAMP), 'Fulfilled', 10, 6, 'Transfusion completed successfully.'),
(9, 'Grace Hopper', 'A-', 1, 'Rush University Medical Center', 'Chicago', '+1 555-0303', 'Normal', DATEADD('DAY', -5, CURRENT_TIMESTAMP), 'Closed', 12, NULL, 'Closed by requester: hospital internal blood bank provided units.'),
(10, 'Ethan Wright', 'AB-', 1, 'Bellevue Hospital Center', 'New York', '+1 555-0301', 'Urgent', DATEADD('DAY', -3, CURRENT_TIMESTAMP), 'Expired', 10, NULL, 'Request past needed-by deadline; marked as Expired.');

-- 3. RESPONSES SEED
INSERT INTO request_responses (id, donor_id, blood_request_id, action, responded_at) VALUES
(1, 3, 6, 'accepted', DATEADD('HOUR', -4, CURRENT_TIMESTAMP)),
(2, 2, 7, 'accepted', DATEADD('DAY', -12, CURRENT_TIMESTAMP)),
(3, 6, 8, 'accepted', DATEADD('DAY', -22, CURRENT_TIMESTAMP));

-- 4. DONATIONS SEED
INSERT INTO donations (id, donor_id, blood_request_id, date, status, units, hospital, city, notes) VALUES
(1, 2, 7, DATEADD('DAY', -11, CURRENT_TIMESTAMP), 'Completed', 2, 'Mount Sinai Hospital, West Wing', 'New York', 'Fulfilled for patient Arthur Pendelton (O-)'),
(2, 6, 8, DATEADD('DAY', -21, CURRENT_TIMESTAMP), 'Completed', 1, 'NYU Langone Health, Center 3', 'New York', 'Fulfilled for patient Benjamin Clark (B+)');
