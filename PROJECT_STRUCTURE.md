# Growth Console — Project Structure & Module Directory

**Organization:** Growth Tech India  
**Architecture:** Monorepo (Node.js/Express Backend + React/Vite Frontend)

---

## Directory Overview

```
.
├── .env.example                     # Global environment reference
├── .gitignore                       # Root Git ignore rules
├── API_DOCUMENTATION.md             # Complete REST API reference
├── FINAL_TEST_REPORT.md             # Security audit & test verification report
├── PROJECT_STRUCTURE.md             # Repository layout and module guide
├── README.md                        # Project onboarding and operation manual
│
├── backend/                         # Node.js + Express REST API Server
│   ├── .env.example                 # Backend environment variable template
│   ├── .gitignore                   # Backend local ignore
│   ├── package.json                 # Backend dependencies & npm scripts
│   ├── scripts/                     # Automation & testing test suites
│   │   ├── seedAdmin.js             # Initial administrator provisioning
│   │   ├── testAuth.js              # Authentication & RBAC test suite (47 tests)
│   │   ├── testConcurrencyHardening.js # Concurrency & multi-instance tests (8 tests)
│   │   ├── testCrudAndMetrics.js    # CRUD, search, filter, metrics tests (39 tests)
│   │   ├── testCsrfHardening.js     # Signed CSRF & session binding tests (44 tests)
│   │   ├── testDuplicateEmail.js    # Unique email constraint validation (1 test)
│   │   ├── testE2EPhase7.js         # Full lifecycle end-to-end flow tests (28 tests)
│   │   └── validateModel.js         # Mongoose User model validations (11 tests)
│   └── src/
│       ├── app.js                   # Express application factory & middleware stack
│       ├── server.js                # Server entry point & graceful shutdown hooks
│       ├── config/
│       │   ├── db.js                # Mongoose database connection & event listeners
│       │   └── env.js               # Typed environment variable loader & validator
│       ├── controllers/
│       │   ├── authController.js    # Authentication, login, register, logout handlers
│       │   ├── healthController.js  # Operational status & database ping
│       │   ├── metricsController.js # Dashboard metrics telemetry handler
│       │   ├── profileController.js # Self-service profile & credential handlers
│       │   └── userController.js    # Admin user management CRUD handlers
│       ├── middleware/
│       │   ├── authenticate.js      # JWT cookie extractor & signature validator
│       │   ├── authorize.js         # RBAC (requireRole, requireAdmin, requireActive)
│       │   ├── csrfProtection.js    # Origin check & signed HMAC session-bound CSRF
│       │   ├── errorHandler.js      # Centralized error handler & AppError class
│       │   ├── notFound.js          # Unhandled route 404 handler
│       │   ├── rateLimiter.js       # Express-rate-limit authentication limiter
│       │   └── requestLogger.js     # Morgan HTTP request logging
│       ├── models/
│       │   ├── AdminGuard.js        # MongoDB sentinel guard for concurrency locks
│       │   └── User.js              # Mongoose User schema with pre-save bcrypt hook
│       ├── routes/
│       │   ├── authRoutes.js        # /api/v1/auth route declarations
│       │   ├── healthRoutes.js      # /api/v1/health route declarations
│       │   ├── metricsRoutes.js     # /api/v1/metrics route declarations
│       │   ├── profileRoutes.js     # /api/v1/profile route declarations
│       │   └── userRoutes.js        # /api/v1/users route declarations
│       ├── services/
│       │   ├── authService.js       # User registration and credential verification
│       │   ├── metricsService.js    # Native MongoDB aggregation metrics calculator
│       │   └── userService.js       # Admin CRUD & multi-instance concurrency guards
│       ├── utils/
│       │   ├── ApiResponse.js       # Standardized JSON response envelope helpers
│       │   ├── asyncHandler.js      # Async controller wrapper for unhandled promises
│       │   └── jwt.js               # JWT signing, cookie configuration, jti extraction
│       └── validators/
│           ├── authValidator.js     # Registration and login body validation
│           ├── profileValidator.js  # Profile update & password change validation
│           └── userValidator.js     # Admin listing, query operator & CRUD validation
│
└── frontend/                        # React 19 + Vite Single Page Application
    ├── index.html                   # HTML entry point with Royal Ivory typography
    ├── package.json                 # Frontend dependencies & build scripts
    ├── vite.config.js               # Vite bundler configuration & React plugin
    └── src/
        ├── App.jsx                  # Main routing tree wrapped in Auth & Toast providers
        ├── main.jsx                 # React root mount
        ├── components/
        │   ├── animation/
        │   │   ├── AuthVisual.jsx   # Three.js antique gold polyhedron (30 FPS cap)
        │   │   └── SmoothScrollProvider.jsx # Lenis inertial scroller & boundary guard
        │   ├── common/
        │   │   ├── BrandLogo.jsx    # Royal Ivory seal & typography logo
        │   │   ├── Buttons.jsx      # PrimaryButton, SecondaryButton, DestructiveButton
        │   │   ├── ConfirmDialog.jsx# Destructive confirmation modal with typing check
        │   │   ├── DataTable.jsx    # Architectural data table with column sorting
        │   │   ├── Inputs.jsx       # TextInput & PasswordInput with visible focus rings
        │   │   ├── Modal.jsx        # Framer Motion accessible dialog container
        │   │   ├── SelectDropdown.jsx # Custom accessible select dropdown
        │   │   └── StatusPill.jsx   # Role and status badge components
        │   ├── feedback/
        │   │   ├── FeedbackStates.jsx # LoadingState, EmptyState, and ErrorState views
        │   │   └── ToastContext.jsx # Toast notification provider & animated toasts
        │   └── layout/
        │       ├── AdminLayout.jsx  # Editorial sidebar, header & admin navigation
        │       ├── AuthSplitLayout.jsx # 50/50 split canvas for Login and Register
        │       └── UserLayout.jsx   # Topbar layout for member portal
        ├── context/
        │   └── AuthContext.jsx      # Session hydration, login, register, logout state
        ├── hooks/
        │   └── usePageEntrance.js   # GSAP coordinated entrance animation hook
        ├── pages/
        │   ├── admin/
        │   │   ├── AdminDashboard.jsx # KPI counters, 30-day SVG trajectory, recent list
        │   │   ├── UserDetails.jsx  # User telemetry view & purge handler
        │   │   └── UserManagement.jsx # Registry table, search, filters, modals
        │   ├── auth/
        │   │   ├── Login.jsx        # Authentication form with error handling
        │   │   └── Register.jsx     # Self-service account registration form
        │   ├── fallback/
        │   │   ├── NotFound.jsx     # 404 editorial error view
        │   │   └── Unauthorized.jsx # 403 access restricted view
        │   └── user/
        │       ├── UserOverview.jsx # Welcome dashboard with account status notice
        │       └── UserProfile.jsx  # Display name mutation & password rotation
        ├── routes/
        │   ├── ProtectedRoute.jsx   # Route guard enforcing active authenticated session
        │   └── RoleGuard.jsx        # Route guard enforcing admin role authorization
        ├── services/
        │   └── api.js               # Centralized fetch client with automatic CSRF management
        └── styles/
            ├── global.css           # Global resets, scrollbars, focus rings, media queries
            ├── tokens.css           # Royal Ivory CSS variables (palette, elevation, radii)
            └── typography.css       # Helvetica Neue typographic hierarchy & scale
```

---

## Architectural Separation of Concerns

1. **Presentation Layer (`frontend/src/pages`, `components`):**
   Stateless and view-driven; consumes state via React Context (`AuthContext`, `ToastContext`); interacts with backend exclusively through the centralized HTTP client (`api.js`).
2. **Controller Layer (`backend/src/controllers`):**
   Parses HTTP requests, invokes business logic services, and returns formatted JSON envelopes using `ApiResponse`. Never queries database models directly.
3. **Service Layer (`backend/src/services`):**
   Encapsulates all domain business rules, password verification, database aggregations, and concurrency safeguards (`userService`, `authService`, `metricsService`).
4. **Data Layer (`backend/src/models`):**
   Mongoose schemas and models enforcing database-level integrity, pre-save hooks (bcrypt hashing), unique indexes, and projection guards (`select: false`).
