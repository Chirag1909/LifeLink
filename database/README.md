# LifeLink: Database Architecture & Setup

This directory contains the relational database schema, seed data, and configuration scripts for the **LifeLink Blood Donor Finder and Emergency Request Management System**.

---

## 🗄️ Database Tables Overview

| Table Name | Description | Key Relationships |
| :--- | :--- | :--- |
| **`users`** | Donors, requesters, and admins. Stores credentials, blood group, city, verification, and donation cooldown timestamps. | Primary entity for all roles |
| **`blood_requests`** | Emergency hospital requisitions with patient details, blood group, units, hospital, city, needed-by date, and status. | `requested_by_id` &rarr; `users(id)`, `accepted_by_id` &rarr; `users(id)` |
| **`request_responses`** | Audit log tracking each donor's accept or decline decision with timestamps. | `donor_id` &rarr; `users(id)`, `blood_request_id` &rarr; `blood_requests(id)` |
| **`donations`** | Permanent verified records of fulfilled transfusions, recording units, hospital, and fulfillment dates. | `donor_id` &rarr; `users(id)`, `blood_request_id` &rarr; `blood_requests(id)` |

---

## 🚀 Two Supported Database Modes

### Mode 1: H2 Embedded File-Based Database (Active by Default)
- **Zero Installation Required:** Operates out of the box using pure Java.
- **Data Persistence:** Data is stored in `./data/lifelink_db.mv.db` and persists across server restarts.
- **JDBC URL:** `jdbc:h2:file:./data/lifelink_db`
- **Username:** `sa`
- **Password:** *(leave blank)*
- **Interactive Web Console:** Open [http://localhost:5000/h2-console](http://localhost:5000/h2-console) in your browser while the backend is running to execute SQL queries directly.

### Mode 2: MySQL 8.0 Database
To use local MySQL:
1. Create database:
   ```sql
   CREATE DATABASE lifelink_db;
   ```
2. Run `schema.sql` and `data.sql` in MySQL Workbench or CLI.
3. In `backend/src/main/resources/application.properties`, uncomment the MySQL lines:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/lifelink_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
   spring.datasource.driverClassName=com.mysql.cj.jdbc.Driver
   spring.datasource.username=root
   spring.datasource.password=your_password
   spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
   ```

### Mode 3: Dockerized MySQL 8.0
Run MySQL with one command (automatically applies schema and seed data):
```bash
cd database
docker compose up -d
```
