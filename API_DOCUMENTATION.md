# Growth Console — REST API Documentation

**API Base URL:** `http://localhost:5000/api/v1`  
**API Version:** `v1`  
**Content-Type:** `application/json`  
**CORS Origin Allowed:** `http://localhost:5173`  

---

## Global Security & Header Requirements

### Authentication
- Authentication is governed by an **HTTP-only, SameSite=Lax** cookie named `gc_token`.
- Tokens contain the user's ID, role, and a unique cryptographic session identifier (`jti`).

### CSRF Protection (Mutations)
All state-changing requests (`POST`, `PATCH`, `PUT`, `DELETE`) require:
1. `Origin` or `Referer` header matching an allowed origin (e.g. `http://localhost:5173`).
2. An `X-CSRF-Token` request header.
3. A matching `gc_csrf_token` cookie containing a valid HMAC-SHA256 signature bound to the active session (`sess_<jti>` for authenticated requests, or `anon` for public requests).

---

## 1. System Health

### `GET /health`
Returns the operational health and database connectivity status.
- **Access:** Public
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "System operational",
  "data": {
    "status": "healthy",
    "timestamp": "2026-11-16T15:20:00.000Z",
    "uptime": 1245.5,
    "database": {
      "status": "connected",
      "host": "localhost:27017",
      "name": "growth_console"
    }
  }
}
```

---

## 2. Authentication & Session (`/auth`)

### `GET /auth/csrf-token`
Retrieves a signed CSRF token and seeds the `gc_csrf_token` cookie.
- **Access:** Public
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "CSRF token retrieved",
  "data": {
    "csrfToken": "18f5d0...anon.8a2b..."
  }
}
```

---

### `POST /auth/register`
Creates a new user account with default role `user` and status `active`.
- **Access:** Public (Requires valid anonymous CSRF token)
- **Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password123!"
}
```
- **Validation Rules:**
  - `name`: 2–80 characters, trimmed.
  - `email`: Valid email format, normalized to lowercase, unique.
  - `password`: Minimum 8 characters.
  - Client-supplied `role` and `status` fields are strictly sanitized and ignored.
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": {
      "_id": "6afb1234567890abcdef1234",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "user",
      "status": "active",
      "createdAt": "2026-11-16T15:21:00.000Z",
      "updatedAt": "2026-11-16T15:21:00.000Z"
    },
    "csrfToken": "98a12...sess_uuid...f5c..."
  }
}
```
- **Error Responses:**
  - `409 Conflict`: Account with this email already exists.
  - `422 Unprocessable Entity`: Input validation failure.

---

### `POST /auth/login`
Authenticates user credentials and issues an HTTP-only JWT cookie and session-bound CSRF token.
- **Access:** Public (Requires valid CSRF token)
- **Request Body:**
```json
{
  "email": "jane@example.com",
  "password": "Password123!"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Signed in successfully",
  "data": {
    "user": {
      "_id": "6afb1234567890abcdef1234",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "user",
      "status": "active",
      "lastLogin": "2026-11-16T15:22:00.000Z"
    },
    "accountNotice": null,
    "csrfToken": "98a12...sess_uuid...f5c..."
  }
}
```
- **Inactive Account Response (200 OK):**
  Authentication succeeds, but `accountNotice` contains an advisory message.
- **Suspended Account Response (403 Forbidden):**
  Denied authentication with message: `"Account is suspended — access denied"`.

---

### `GET /auth/me`
Hydrates the authenticated member's session profile.
- **Access:** Authenticated (Any status)
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Authenticated user retrieved",
  "data": {
    "user": {
      "_id": "6afb1234567890abcdef1234",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "user",
      "status": "active"
    },
    "accountNotice": null
  }
}
```

---

### `POST /auth/logout`
Terminates the client session and clears authentication and CSRF cookies.
- **Access:** Authenticated
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Signed out successfully"
}
```

---

## 3. Member Self-Service Profile (`/profile`)

*All `/profile` endpoints require an authenticated user with `status: 'active'`.*

### `GET /profile`
Retrieves the member's personal profile information.
- **Access:** Authenticated Active User
- **Response (200 OK):** Returns user object excluding password hash.

---

### `PATCH /profile`
Updates the authenticated member's display name.
- **Access:** Authenticated Active User (Requires CSRF)
- **Request Body:**
```json
{
  "name": "Jane Smith"
}
```
- **Restrictions:** Attempts to mutate `email`, `role`, or `status` are stripped by validators.
- **Response (200 OK):** Returns updated user object.

---

### `PATCH /profile/password`
Performs credential rotation for the authenticated member.
- **Access:** Authenticated Active User (Requires CSRF)
- **Request Body:**
```json
{
  "currentPassword": "Password123!",
  "newPassword": "NewSecurePassword456!"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```
- **Error Responses:**
  - `401 Unauthorized`: Current password is incorrect.
  - `422 Unprocessable Entity`: Validation failure (new password under 8 characters).

---

## 4. Admin User Management (`/users`)

*All `/users` endpoints require an active administrator (`role: 'admin'`, `status: 'active'`).*

### `GET /users`
Lists users with server-side pagination, regex search, filtering, and sorting.
- **Access:** Authenticated Active Admin
- **Query Parameters:**
  - `page` (integer, default: 1)
  - `limit` (integer, min: 1, max: 100, default: 10)
  - `search` (string, max 100 chars, regex-escaped, searches `name` and `email`)
  - `role` (enum: `'admin'`, `'user'`, `'all'`, default: `'all'`)
  - `status` (enum: `'active'`, `'inactive'`, `'suspended'`, `'all'`, default: `'all'`)
  - `sortBy` (enum: `'name'`, `'email'`, `'role'`, `'status'`, `'createdAt'`, default: `'createdAt'`)
  - `order` (enum: `'asc'`, `'desc'`, default: `'desc'`)
- **Headers:** Sets `X-Total-Count` response header.
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "_id": "6afb1234567890abcdef1234",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "user",
      "status": "active",
      "createdAt": "2026-11-16T15:21:00.000Z"
    }
  ],
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasPrevPage": false,
    "hasNextPage": true
  }
}
```

---

### `POST /users`
Provisions a new user account through administrative controls.
- **Access:** Authenticated Active Admin (Requires CSRF)
- **Request Body:**
```json
{
  "name": "Alex Mercer",
  "email": "alex@example.com",
  "password": "InitialPassword123!",
  "role": "user",
  "status": "active"
}
```
- **Response (201 Created):** Returns created user object excluding password hash.
- **Error Responses:** `409 Conflict` (duplicate email), `422 Unprocessable Entity`.

---

### `GET /users/:id`
Retrieves a specific user record by MongoDB Object ID.
- **Access:** Authenticated Active Admin
- **Response (200 OK):** Returns single user object.
- **Error Response:** `404 Not Found` if user does not exist.

---

### `PATCH /users/:id`
Updates user details, role, or status with Last Active Administrator safeguard.
- **Access:** Authenticated Active Admin (Requires CSRF)
- **Request Body:**
```json
{
  "name": "Alex Mercer Updated",
  "role": "admin",
  "status": "active"
}
```
- **Safeguard Rule:** Rejects demotion or deactivation targeting the sole remaining active administrator with `400 Bad Request`.
- **Response (200 OK):** Returns updated user object.

---

### `DELETE /users/:id`
Permanently purges a user account with Last Active Administrator safeguard.
- **Access:** Authenticated Active Admin (Requires CSRF)
- **Safeguard Rule:** Rejects deletion of the sole remaining active administrator with `400 Bad Request`.
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": {
    "id": "6afb1234567890abcdef1234",
    "email": "alex@example.com"
  }
}
```

---

## 5. Executive Metrics (`/metrics`)

### `GET /metrics/dashboard`
Aggregates live KPI counters and a 30-day enrollment timeline directly from MongoDB collections.
- **Access:** Authenticated Active Admin
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Executive metrics retrieved",
  "data": {
    "metrics": {
      "totalUsers": 48,
      "activeUsers": 42,
      "inactiveUsers": 4,
      "suspendedUsers": 2,
      "adminUsers": 3
    },
    "recentRegistrations": [
      {
        "_id": "6afb1234567890abcdef1234",
        "name": "Alex Mercer",
        "email": "alex@example.com",
        "role": "user",
        "status": "active",
        "createdAt": "2026-11-16T15:25:00.000Z"
      }
    ],
    "trend": [
      { "date": "2026-10-17", "count": 1 },
      { "date": "2026-11-16", "count": 4 }
    ]
  }
}
```

---

## Standard Error Response Format

All error responses adhere to a consistent contract:
```json
{
  "success": false,
  "message": "Human-readable error description"
}
```
When validation fails (`422 Unprocessable Entity`), the response includes an `errors` array:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "value": "",
      "msg": "Name must be 2–80 characters",
      "path": "name",
      "location": "body"
    }
  ]
}
```
