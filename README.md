# LifeLink: Blood Donor Finder & Emergency Request Management System

LifeLink is an enterprise-grade full-stack web application developed for college major project evaluation. It connects blood donors with hospitals, patients, and requesters in real time.

Built with **React (Vite) + Tailwind CSS** on the front-end, **Java + Spring Boot + Spring Security** on the back-end, and a **JDBC Database** (with support for both H2 persistent storage and MySQL), LifeLink automates biological compatibility matching, strictly enforces the 90-day medical interval safety cooldown, and guarantees donor privacy.

---

## 📌 Architecture & Tech Stack

- **Front-End:** React 19, Vite 8, React Router v7, Axios, Tailwind CSS v4, Lucide React Icons.
- **Back-End:** Java 21 (LTS), Spring Boot 3.3.5, Spring MVC (REST Controllers), Spring Security (Stateless JWT + BCryptPasswordEncoder), Spring Data JPA / Hibernate.
- **Database (JDBC):**
  - **Embedded File-Based JDBC Database:** `jdbc:h2:file:./data/lifelink_db` (active by default; persists all data between restarts with zero external setup or passwords needed).
  - **MySQL Database Support:** `jdbc:mysql://localhost:3306/lifelink_db` (provided in `application.properties`).
  - **Interactive Database Web Console:** Accessible at `http://localhost:5000/h2-console` for live SQL execution and grading review.
- **Security & Validation:** Jakarta Bean Validation (`@Valid`, `@NotBlank`, `@Min`), stateless HMAC-SHA256 JWT tokens (7-day validity), 10-round salted BCrypt password hashing.

---

## 🩸 Blood Compatibility Reference Matrix

LifeLink implements biological red blood cell compatibility matching:

| Blood Group | Can Donate To (Recipients) | Can Receive From (Donors) | Special Status |
| :---: | :---: | :---: | :---: |
| **O-** | All Groups (O-, O+, A-, A+, B-, B+, AB-, AB+) | **O- only** | **Universal Donor** |
| **O+** | O+, A+, B+, AB+ | O-, O+ | — |
| **A-** | A-, A+, AB-, AB+ | O-, A- | — |
| **A+** | A+, AB+ | O-, O+, A-, A+ | — |
| **B-** | B-, B+, AB-, AB+ | O-, B- | — |
| **B+** | B+, AB+ | O-, O+, B-, B+ | — |
| **AB-**| AB-, AB+ | O-, A-, B-, AB- | — |
| **AB+**| **AB+ only** | All Groups (O-, O+, A-, A+, B-, B+, AB-, AB+) | **Universal Recipient** |

---

## 📁 Project Structure

```
LifeLink/
├── client/                                 # Front-End React (Vite) Application
│   ├── src/
│   │   ├── api/                            # Axios instance & modular service endpoints
│   │   ├── context/                        # Global user auth & profile state (AuthContext.jsx)
│   │   ├── components/                     # Navbar, Footer, Badges, EligibilityBanner, CompatibilityMatrix
│   │   ├── pages/                          # Home, Login, Register, DonorDashboard, RequesterDashboard, CreateRequest, AdminDashboard, NotFound
│   │   ├── App.jsx                         # Route definitions & Role-based guards
│   │   └── index.css                       # Tailwind CSS v4 configuration
│   ├── .env & .env.example
│   ├── package.json
│   └── vite.config.js                      # Vite dev server with proxy to :5000
│
├── server/                                 # Back-End Java + Spring Boot Application
│   ├── src/main/java/com/lifelink/
│   │   ├── LifeLinkApplication.java        # Spring Boot main class
│   │   ├── config/                         # SecurityConfig, JwtAuthenticationFilter, JwtUtils
│   │   ├── controller/                     # AuthController, DonorController, RequestController, AdminController, HealthController
│   │   ├── dto/                            # ApiResponse, LoginRequest, RegisterRequest, CreateBloodRequestDto, etc.
│   │   ├── model/                          # User, BloodRequest, Donation, RequestResponse, EligibilityResult
│   │   ├── repository/                     # UserRepository, BloodRequestRepository, DonationRepository, RequestResponseRepository
│   │   ├── service/                        # DataInitializer (Automated seeding of demo accounts)
│   │   └── util/                           # BloodCompatibility (Transfusion matrix, 90-day cooldown, phone masking)
│   ├── src/main/resources/
│   │   └── application.properties          # Server port (5000), JDBC settings, H2 console, JWT secret
│   ├── pom.xml                             # Maven project configuration (Java 21, Spring Boot 3.3.5)
│   └── test_flow.js                        # Automated 10-step end-to-end integration test
│
├── PROJECT_REPORT.md                       # Comprehensive Academic Major Project Report
├── PROJECT_REPORT.html                     # Styled, printable HTML report with "Print / Save as PDF" button
└── README.md                               # Setup guide, API docs, demo credentials
```

---

## ⚡ Quick Start & Run Instructions

### Prerequisites
- **Java 21** (JDK 21 LTS installed)
- **Maven** (included in `C:\Users\Hp\apache-maven-3.9.9\bin`)
- **Node.js** (for React client)

### 1. Start Back-End (Spring Boot)
Open a terminal in `server`:
```bash
cd server

# Compile and run via Maven
mvn spring-boot:run

# Or run the packaged executable JAR
java -jar target/lifelink-server-1.0.0.jar
```
The server will start on **`http://localhost:5000`** and automatically populate demo accounts if the database is empty.
- **REST API Root:** `http://localhost:5000/api`
- **H2 Database Console:** `http://localhost:5000/h2-console` (JDBC URL: `jdbc:h2:file:./data/lifelink_db`, User: `sa`, Password: empty)

### 2. Start Front-End (React + Vite)
Open a new terminal in `client`:
```bash
cd client
npm run dev
```
Visit **`http://localhost:5173`** in your browser.

---

## 🔑 Demo Accounts & Credentials

For academic project presentations, **1-Click Quick Fill Buttons** are provided directly on the `/login` page:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@lifelink.com` | `Admin@123` | Full admin console, SVG charts, and security controls |
| **Donor (O-)** | `john.carter@donor.com` | `Password@123` | Universal donor in New York, eligible |
| **Donor (O+)** | `sarah.connor@donor.com` | `Password@123` | Eligible donor in Boston |
| **Donor (A+)** | `michael.chen@donor.com` | `Password@123` | Eligible donor in New York |
| **Donor (A-)** | `emily.watson@donor.com` | `Password@123` | Eligible donor in Chicago |
| **Donor (B+)** | `david.miller@donor.com` | `Password@123` | Eligible donor in New York |
| **Donor (B-)** | `priya.patel@donor.com` | `Password@123` | Eligible donor in Boston |
| **Donor (AB+)** | `carlos.rodriguez@donor.com` | `Password@123` | Availability OFF (to demonstrate pause toggle) |
| **Donor (AB-)** | `aisha.khan@donor.com` | `Password@123` | In 90-day cooldown (to demonstrate rest interval) |
| **Requester 1** | `robert@requester.com` | `Password@123` | Hospital requester in New York |
| **Requester 2** | `jennifer@requester.com` | `Password@123` | Hospital requester in Boston |
| **Requester 3** | `marcus@requester.com` | `Password@123` | Hospital requester in Chicago |

---

## 📡 REST API Documentation

All API endpoints are prefixed with `/api`.

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user as donor or requester |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT token |
| `GET` | `/api/auth/me` | Private | Fetch profile & calculated eligibility for current session |

### Donors (`/api/donors`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/donors?bloodGroup=&city=&matchMode=` | Public | Search eligible donors (phone numbers masked) |
| `PUT` | `/api/donors/profile` | Donor | Update donor contact, city, or blood group |
| `PATCH`| `/api/donors/availability` | Donor | Toggle donor availability (ON / OFF) |
| `GET` | `/api/donors/history` | Donor | View donor's completed donation records |

### Requests (`/api/requests`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/requests` | Requester | Create new emergency blood request |
| `GET` | `/api/requests` | Private | Role-scoped list (Admin: all; Requester: own; Donor: matching open) |
| `GET` | `/api/requests/:id` | Private | View request details, status & matched donors |
| `PUT` | `/api/requests/:id` | Requester | Edit request details (only while in `Open` status) |
| `DELETE`| `/api/requests/:id`| Requester/Admin | Delete request (only while `Open` or by admin) |
| `POST` | `/api/requests/:id/accept` | Donor | Donor accepts request; unlocks donor phone to requester |
| `POST` | `/api/requests/:id/decline`| Donor | Donor declines request |
| `PATCH`| `/api/requests/:id/status` | Requester/Admin | Mark request as `Fulfilled` or `Closed` |

### Administration (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/stats` | Admin | Aggregate counts, charts data, and activity feed |
| `GET` | `/api/admin/users?role=&search=` | Admin | Query system users with pagination and search |
| `PATCH`| `/api/admin/users/:id/verify` | Admin | Toggle or set user verification status |
| `PATCH`| `/api/admin/users/:id/block` | Admin | Toggle or set user blocked status |

---

## 🧪 Automated End-to-End Verification Test

To verify the complete integration between the database, Spring Boot API, and business rules:
```bash
cd server
node test_flow.js
```
The test verifies:
1. Requester login via Spring Security + JWT.
2. Requester creates a Critical blood request.
3. Donor logs in and verifies initial eligibility.
4. Donor's dashboard automatically queries and finds the matching request.
5. Donor accepts the request.
6. Requester verifies the donor's contact phone number is unlocked.
7. Requester marks request as **Fulfilled**.
8. System writes a completed `Donation` record and updates donor's `lastDonationDate`.
9. Donor's 90-day cooldown is confirmed active with countdown days remaining.
10. Public donor search confirms phone numbers remain masked for privacy.
