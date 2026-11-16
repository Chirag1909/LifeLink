-- =====================================================================
-- LifeLink: Blood Donor Finder & Emergency Request Management System
-- Database Schema Definition (Compatible with MySQL 8.0 & H2 Database)
-- =====================================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'requester', -- 'donor', 'requester', 'admin'
    blood_group VARCHAR(10),                      -- 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
    city VARCHAR(80) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    last_donation_date DATE DEFAULT NULL,
    is_verified BOOLEAN DEFAULT TRUE,
    is_blocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast search by role, blood group, and city
CREATE INDEX idx_users_role_city ON users(role, city);
CREATE INDEX idx_users_blood_group ON users(blood_group);

-- 2. BLOOD REQUESTS TABLE
CREATE TABLE IF NOT EXISTS blood_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_name VARCHAR(100) NOT NULL,
    blood_group VARCHAR(10) NOT NULL,
    units_needed INT NOT NULL DEFAULT 1,
    hospital VARCHAR(200) NOT NULL,
    city VARCHAR(80) NOT NULL,
    contact_phone VARCHAR(30) NOT NULL,
    urgency VARCHAR(20) NOT NULL DEFAULT 'Normal', -- 'Critical', 'Urgent', 'Normal'
    needed_by TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Open',    -- 'Open', 'Accepted', 'Fulfilled', 'Closed', 'Expired'
    requested_by_id BIGINT NOT NULL,
    accepted_by_id BIGINT DEFAULT NULL,
    notes VARCHAR(500) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_requests_requested_by FOREIGN KEY (requested_by_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_requests_accepted_by FOREIGN KEY (accepted_by_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_requests_status ON blood_requests(status);
CREATE INDEX idx_requests_city_blood ON blood_requests(city, blood_group);

-- 3. REQUEST RESPONSES (Audit Trail of Donor Accept / Decline)
CREATE TABLE IF NOT EXISTS request_responses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    donor_id BIGINT NOT NULL,
    blood_request_id BIGINT NOT NULL,
    action VARCHAR(20) NOT NULL, -- 'accepted', 'declined'
    responded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_responses_donor FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_responses_request FOREIGN KEY (blood_request_id) REFERENCES blood_requests(id) ON DELETE CASCADE
);

-- 4. DONATIONS TABLE (Fulfilled Historical Records)
CREATE TABLE IF NOT EXISTS donations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    donor_id BIGINT NOT NULL,
    blood_request_id BIGINT NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'Completed', -- 'Completed', 'Cancelled'
    units INT NOT NULL DEFAULT 1,
    hospital VARCHAR(200),
    city VARCHAR(80),
    notes VARCHAR(500) DEFAULT 'Donation fulfilled successfully via LifeLink',
    CONSTRAINT fk_donations_donor FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_donations_request FOREIGN KEY (blood_request_id) REFERENCES blood_requests(id) ON DELETE CASCADE
);

CREATE INDEX idx_donations_donor ON donations(donor_id);
