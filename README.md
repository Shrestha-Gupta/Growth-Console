# Growth Console

**Organization:** Growth Tech India  
**Project:** Growth Console — Enterprise User Management & Administration System  
**Version:** 1.0.0  

Growth Console is a secure, high-density administrative console and user management system designed with an editorial Royal Ivory aesthetic and modern full-stack web standards.

---

## Architecture Overview

```
                      ┌────────────────────────────────────────┐
                      │          React 19 SPA (Vite)           │
                      │  Royal Ivory UI / Framer Motion / GSAP │
                      └──────────────────┬─────────────────────┘
                                         │ HTTP-Only Cookie + CSRF Header
                                         ▼
                      ┌────────────────────────────────────────┐
                      │          Node.js / Express API         │
                      │   Helmet / Rate Limit / RBAC / CSRF    │
                      └──────────────────┬─────────────────────┘
                                         │ Mongoose ODM
                                         ▼
                      ┌────────────────────────────────────────┐
                      │                MongoDB                 │
                      │ Users / Metrics / AdminGuard Sentinels │
                      └────────────────────────────────────────┘
```

### Key Pillars
- **Frontend:** React 19, Vite, React Router 6, Framer Motion, GSAP, Lenis Smooth Scroll, Three.js (WebGL auth visual).
- **Backend:** Node.js, Express.js (ES Modules), Helmet, CORS Allowlisting, Express-Validator, Express-Rate-Limit.
- **Database:** MongoDB via Mongoose 8+, native aggregations, index optimizations.
- **Security:** Double-Submit Signed CSRF Tokens bound cryptographically to JWT session (`jti`), HTTP-Only `SameSite=Lax` cookies, bcrypt password hashing (cost factor 12), and atomic Last Active Administrator guards.

---

## Features

### Administrative Console
- **Executive Metrics Dashboard:** Real-time KPI aggregation from live MongoDB records (`totalUsers`, `activeUsers`, `inactiveUsers`, `suspendedUsers`, `adminUsers`), dynamic 30-day enrollment trajectory SVG, and latest registrations feed.
- **User CRUD & Registry:** Complete administrator management with multi-field search (regex-escaped), role filtering (`admin`/`user`), status filtering (`active`/`inactive`/`suspended`), column sorting, and server-side pagination.
- **User Detail Inspection:** Deep telemetry view including enrollment timestamp, last active login, and secure user purging.
- **Last Active Administrator Safeguard:** Atomic concurrency-protected guard preventing deletion, deactivation, or demotion of the sole remaining active administrator across single and multi-instance deployments.

### Member Self-Service Portal
- **Overview & Telemetry:** Account verification status, enrollment date, and dynamic advisory notices for inactive accounts.
- **Profile & Credential Rotation:** Self-service display name updates and secure password rotation with validation rules.
- **Role/Status Immutability:** Strict server-side stripping preventing non-administrators from mutating their role, status, or email.

### Security Architecture
- **Stateless JWT with Cryptographic Session Binding:** Tokens carry a unique session identifier (`jti`) issued per login.
- **Signed Double-Submit CSRF Defense:** Mutations require both a matching `Origin`/`Referer` header and an HMAC-SHA256 signed `X-CSRF-Token` header bound to the current session (`sess_<jti>`).
- **Account State Governance:**
  - *Active:* Full operational privileges according to role.
  - *Inactive:* Authentication succeeds, but protected application access is restricted with an explanatory advisory notice.
  - *Suspended:* Denied at authentication; zero token issuance.

---

## Prerequisites

- **Node.js:** v18.0.0 or higher (v20+ recommended)
- **npm:** v9.0.0 or higher
- **MongoDB:** v6.0 or higher (Running locally on port 27017 or a cloud MongoDB Atlas connection URI)

---

## Installation & Setup

### 1. Repository Setup
Clone the repository and enter the project root:
```bash
git clone <repository-url>
cd "Growth Tech India/Minor Project"
```

### 2. Backend Setup
Navigate to the `backend/` directory, install dependencies, and configure environment variables:
```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env` with your desired configuration (ensure strong secrets are provided):
```ini
NODE_ENV=development
PORT=5000
ALLOWED_ORIGINS=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/growth_console
JWT_SECRET=replace_with_a_long_random_secret_min_64_chars
JWT_EXPIRES_IN=8h
COOKIE_SECRET=replace_with_another_long_random_secret
ADMIN_SEED_NAME=System Administrator
ADMIN_SEED_EMAIL=admin@growthconsole.internal
ADMIN_SEED_PASSWORD=replace_with_a_strong_password
```

Seed the initial administrator account:
```bash
npm run seed:admin
```

Start the backend API server:
```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```
The API server will listen on `http://localhost:5000`.

### 3. Frontend Setup
In a new terminal, navigate to the `frontend/` directory and install dependencies:
```bash
cd frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```
The application will be accessible at `http://localhost:5173`.

---

## Production Build & Deployment

### Build Frontend
```bash
cd frontend
npm run build
```
This produces an optimized production bundle in `frontend/dist/`.

### Run Production Server
```bash
cd backend
NODE_ENV=production npm start
```

---

## Automated Test Suites

The backend includes comprehensive test suites covering model validations, authentication, CSRF hardening, administrative CRUD, and multi-instance concurrency (178 automated assertions total):

```bash
cd backend

# Model schema, indexing, and duplicate email tests
node scripts/validateModel.js
node scripts/testDuplicateEmail.js

# Authentication & RBAC test suite (47 assertions)
node scripts/testAuth.js

# CSRF cryptographic hardening & session-jti binding (44 assertions)
node scripts/testCsrfHardening.js

# User CRUD & dashboard metrics test suite (39 assertions)
node scripts/testCrudAndMetrics.js

# Full end-to-end integration flow (28 assertions)
node scripts/testE2EPhase7.js

# Concurrency & last-admin protection suite (8 assertions)
node scripts/testConcurrencyHardening.js
```

---

## Security Notes & Known Limitations

1. **Stateless JWT Lifecycle:**
   Logout clears the HTTP-only `gc_token` and `gc_csrf_token` cookies on the client browser. The backend does not maintain a server-side token revocation denylist; stateless tokens remain cryptographically valid until expiration (`8h`) if exported outside the browser context.
2. **MongoDB Deployment & Concurrency:**
   The multi-instance last-active-admin guard automatically detects the MongoDB topology:
   - On **Replica Sets / MongoDB Atlas**: It executes multi-document transactions with write conflict generation on `AdminGuard`.
   - On **Standalone MongoDB**: It applies a distributed atomic lock with TTL leasing via `AdminGuard`.
3. **Browser Automation Verification:**
   Headless Chrome visual testing was NOT verified due to the remote debugging port (`DevToolsActivePort`) being inactive on the test host. Full UI verification was validated via Vite production bundle analysis, React component unit assertions, and manual browser checks.

---

## License

Proprietary — Growth Tech India. All rights reserved.
