# MeeSeva DQMS — Telangana State Digital Queue Management System
**మీసేవ డిజిటల్ క్యూ నిర్వహణ వ్యవస్థ • Government of Telangana**

---

## 🏛️ Project Overview
**MeeSeva DQMS** is a next-generation government digital platform engineered to eliminate physical wait lines across all **33 Telangana Districts**. It replaces legacy manual queues with a virtual, transparent, and deterministic digital queue system.

The system features:
- **Cinematic 3D Telangana Intro**: Interactive WebGL scene built with Three.js & React Three Fiber representing live data flows across all 33 districts.
- **Dual Authentication Pathways**:
  - **Citizen Login**: Mobile Number $\to$ 6-digit OTP $\to$ Citizen Portal.
  - **Government Official Login**: Official Email (`*.gov.in`) $\to$ Secure OTP $\to$ Operations Command Center.
  - **Zero UI Role Selector**: Official identity, jurisdiction, department, and counter privileges are derived strictly server-side from the database.
- **Deterministic Queue Engine**:
  - Replaces all random numbers (`Math.random()`) and frontend timers (`setInterval()`) with transactional relational database operations.
  - Full state machine: `WAITING` $\to$ `CALLED` $\to$ `SERVING` $\to$ `COMPLETED` / `CANCELLED` / `NO_SHOW` / `HOLD`.
  - Exact mathematical calculations for token sequencing, people ahead, and estimated wait times based on active desks and historical service durations.
- **Enterprise Java Spring Boot Backend**: Built with Spring Boot 3.3, Spring Data JPA, Spring Security, Oracle JDBC, and Bean Validation.
- **Normalized Oracle Database 23ai**: Normalized relational schema managed via SQL*Plus.
- **FreeLLMAPI AI Integration**: Contextual AI assistant ("MeeSeva Digital Sahayak") guiding citizens through document requirements in English & Telugu, and providing officers with operational load analytics.

---

## 🚀 Quickstart Guide

### 1. Frontend Web Application (React 19 + Vite + Three.js)
```bash
cd frontend
# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle
npm run build
```
- Development server URL: `http://localhost:8080/`
- Keyboard shortcuts: Press `ENTER` or `SPACE` on the landing screen to instantly skip the 3D cinematic intro.

### 2. Oracle Database Setup (SQL*Plus)
Ensure Oracle Database 23ai / 26ai service is active:
```bash
# Connect to your Oracle instance via SQL*Plus and execute the setup wrapper:
sqlplus system/oracle@localhost:1521/FREE @src/main/resources/setup-oracle.sql
```
This automatically runs:
1. `src/main/resources/schema-oracle.sql`: DDL for all 12 tables, primary keys, foreign keys, and indexes.
2. `src/main/resources/seed-oracle.sql`: Seeds all 33 Telangana districts, 5 departments (`REV`, `REG`, `RTA`, `CIVIL`, `ELEC`), services, offices, counters, official test accounts, and active tickets.

### 3. Java Spring Boot Backend

Before startup, set `JWT_SECRET` to a unique, long random value in the backend process environment. In PowerShell, for example:

```powershell
$env:JWT_SECRET = 'replace-with-a-generated-secret'
```

```bash
mvn spring-boot:run
```
- Backend REST API starts on: `http://localhost:8081`
- SSE Live Queue Stream: `http://localhost:8081/api/queue/stream`


---

## 👥 Demo Test Profiles (One-Click Testing)

### Citizen Access
- **Mobile Number**: `9876543210` (or any 10-digit number)
- **OTP Code**: `123456`

### Government Official Access (Strictly Server-Determined Role)
| Official Email | Department | District | Jurisdiction & Desk |
|---|---|---|---|
| `officer.rev@telangana.gov.in` | Revenue (`REV-`) | Hyderabad | MeeSeva Sanath Nagar (Counter 01) |
| `officer.rta@telangana.gov.in` | Transport (`RTA-`) | Hyderabad | District RTO Office (Counter 04) |
| `officer.reg@telangana.gov.in` | Municipal (`CR-`) | Hanamkonda | Municipal Complex (Counter 03) |
| `officer.civil@telangana.gov.in` | Civil Supplies (`CS-`) | Nizamabad | Civil Supplies Hub (Counter 06) |
| `director.dqms@telangana.gov.in` | State Command | All 33 Districts | Commissioner of e-Governance |
- **Official OTP Code**: `123456`

---

## 📂 Project Structure
```
MeeSeva-DQMS/
├── database/
│   └── supabase/schema.sql
├── docs/
│   ├── diagrams/
│   ├── prototype/
│   ├── reports/
│   └── test-cases/
├── frontend/
│   ├── src/
│   ├── test/
│   ├── index.html
│   └── package.json
├── scripts/
│   └── reports/
├── src/main/
│   ├── java/gov/telangana/meeseva/dqms/
│   └── resources/
│       ├── application.properties
│       ├── schema-oracle.sql
│       ├── seed-oracle.sql
│       └── setup-oracle.sql
├── .gitignore
├── README.md
└── pom.xml
```

---

## 🔒 Security & Standards Compliance
- **Content Security Policy (CSP)**: Hardened headers with strict origin control.
- **Role Isolation**: Zero client-side role picking. Privileges are derived from authenticated credentials.
- **Deterministic State**: No random timer generation. Every token is sequenced and auditable.
