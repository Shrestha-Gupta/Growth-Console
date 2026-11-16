// scripts/testCrudAndMetrics.js
// Verification suite for Phase 7 Backend:
// 1. User CRUD operations (list, get, create, update, delete)
// 2. Listing parameters (search, role, status, sorting, pagination)
// 3. Last Active Administrator protection (demotion, deactivation, deletion)
// 4. Dashboard metrics calculation with actual MongoDB aggregates

import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/models/User.js';

const BASE = 'http://localhost:5000/api/v1';
const VALID_ORIGIN = 'http://localhost:5173';

let pass = 0;
let fail = 0;

const check = (label, ok) => {
  if (ok) { console.log(`  ✅  ${label}`); pass++; }
  else    { console.error(`  ❌  ${label}`); fail++; }
};

async function req(method, path, {
  body = null,
  cookies = [],
  origin = VALID_ORIGIN,
  csrfToken = null,
} = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (origin) headers['Origin'] = origin;
  if (csrfToken) headers['X-CSRF-Token'] = csrfToken;
  if (cookies.length > 0) headers['Cookie'] = cookies.join('; ');

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE}${path}`, opts);
  const rawSetCookie = res.headers.get('set-cookie') || '';
  const json = await res.json().catch(() => ({}));

  const responseCookies = {};
  if (rawSetCookie) {
    const parts = rawSetCookie.split(/,\s*(?=[a-zA-Z0-9_]+=)/);
    for (const p of parts) {
      const match = p.match(/^([a-zA-Z0-9_]+)=([^;]*)/);
      if (match) responseCookies[match[1]] = match[2];
    }
  }

  return { status: res.status, json, responseCookies, headers: res.headers };
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  // Clean test accounts
  await User.deleteMany({
    email: {
      $in: [
        'crud_test_user@test.internal',
        'crud_temp@test.internal',
        'crud_admin2@test.internal',
      ],
    },
  });

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(' PHASE 7 — USER CRUD & DASHBOARD METRICS VALIDATION');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // ─── 1. AUTHENTICATE AS ADMIN ────────────────────────────────────────────
  console.log('── 1. Admin Authentication ──');

  const anonRes = await req('GET', '/auth/csrf-token');
  const anonCookie = `gc_csrf_token=${anonRes.responseCookies['gc_csrf_token']}`;
  const anonToken  = anonRes.json.data?.csrfToken;

  const loginRes = await req('POST', '/auth/login', {
    body: { email: process.env.ADMIN_SEED_EMAIL, password: process.env.ADMIN_SEED_PASSWORD },
    cookies: [anonCookie],
    csrfToken: anonToken,
  });
  check('Admin login succeeded → 200 OK', loginRes.status === 200);

  const adminAuthCookie = `gc_token=${loginRes.responseCookies['gc_token']}`;
  let adminCsrfCookie = `gc_csrf_token=${loginRes.responseCookies['gc_csrf_token']}`;
  let adminCsrfToken = loginRes.json.data?.csrfToken;

  // ─── 2. USER CREATION BY ADMIN (POST /users) ─────────────────────────────
  console.log('\n── 2. User Creation by Admin (POST /users) ──');

  let r = await req('POST', '/users', {
    body: {
      name: 'CRUD Test User',
      email: 'crud_test_user@test.internal',
      password: 'Password123!',
      role: 'user',
      status: 'active',
    },
    cookies: [adminAuthCookie, adminCsrfCookie],
    csrfToken: adminCsrfToken,
  });
  check('Create user by admin → 201 Created', r.status === 201);
  check('Created user does not expose password', !r.json.data?.user?.password);
  check('Created user matches input data', r.json.data?.user?.email === 'crud_test_user@test.internal');

  const createdUserId = r.json.data?.user?._id;

  // Duplicate email creation rejection
  r = await req('POST', '/users', {
    body: {
      name: 'Duplicate',
      email: 'crud_test_user@test.internal',
      password: 'Password123!',
      role: 'user',
      status: 'active',
    },
    cookies: [adminAuthCookie, adminCsrfCookie],
    csrfToken: adminCsrfToken,
  });
  check('Duplicate email on admin create → 409 Conflict', r.status === 409);

  // ─── 3. USER LISTING, SEARCH, FILTERS & SORTING (GET /users) ─────────────
  console.log('\n── 3. User Listing, Filters, Sorting & Pagination (GET /users) ──');

  r = await req('GET', '/users', { cookies: [adminAuthCookie] });
  check('GET /users returns 200 OK', r.status === 200);
  check('Returns users array in data', Array.isArray(r.json.data));
  check('Returns pagination metadata in meta', !!r.json.meta?.total && !!r.json.meta?.page);
  check('Sets X-Total-Count header', !!r.headers.get('x-total-count'));

  // Search by name
  r = await req('GET', '/users?search=CRUD', { cookies: [adminAuthCookie] });
  check('Search by name returns matching user', r.json.data?.some(u => u.name === 'CRUD Test User'));

  // Search by email
  r = await req('GET', '/users?search=crud_test_user', { cookies: [adminAuthCookie] });
  check('Search by email returns matching user', r.json.data?.some(u => u.email === 'crud_test_user@test.internal'));

  // Filter by role
  r = await req('GET', '/users?role=admin', { cookies: [adminAuthCookie] });
  check('Filter role=admin returns only admins', r.json.data?.every(u => u.role === 'admin'));

  // Filter by status
  r = await req('GET', '/users?status=active', { cookies: [adminAuthCookie] });
  check('Filter status=active returns only active users', r.json.data?.every(u => u.status === 'active'));

  // Pagination limit
  r = await req('GET', '/users?limit=1&page=1', { cookies: [adminAuthCookie] });
  check('Pagination limit=1 returns exactly 1 user', r.json.data?.length === 1);
  check('Pagination metadata reports limit=1', r.json.meta?.limit === 1);

  // ─── 4. GET SINGLE USER DETAILS (GET /users/:id) ─────────────────────────
  console.log('\n── 4. Get User Details (GET /users/:id) ──');

  r = await req('GET', `/users/${createdUserId}`, { cookies: [adminAuthCookie] });
  check('GET /users/:id returns 200 OK', r.status === 200);
  check('Returns correct user ID', r.json.data?.user?._id === createdUserId);
  check('Does not return password', !r.json.data?.user?.password);

  // Non-existent ID (valid mongo ID)
  const fakeId = new mongoose.Types.ObjectId().toString();
  r = await req('GET', `/users/${fakeId}`, { cookies: [adminAuthCookie] });
  check('GET nonexistent /users/:id → 404 Not Found', r.status === 404);

  // ─── 5. UPDATE USER (PATCH /users/:id) ───────────────────────────────────
  console.log('\n── 5. Update User (PATCH /users/:id) ──');

  r = await req('PATCH', `/users/${createdUserId}`, {
    body: { name: 'CRUD Updated Name', status: 'inactive' },
    cookies: [adminAuthCookie, adminCsrfCookie],
    csrfToken: adminCsrfToken,
  });
  check('PATCH /users/:id returns 200 OK', r.status === 200);
  check('User name updated', r.json.data?.user?.name === 'CRUD Updated Name');
  check('User status updated to inactive', r.json.data?.user?.status === 'inactive');

  // ─── 6. LAST ACTIVE ADMIN SAFEGUARD ──────────────────────────────────────
  console.log('\n── 6. Last Active Administrator Safeguard ──');

  const mainAdmin = await User.findOne({ email: process.env.ADMIN_SEED_EMAIL });

  // A. Attempt to demote the sole active admin
  r = await req('PATCH', `/users/${mainAdmin._id}`, {
    body: { role: 'user' },
    cookies: [adminAuthCookie, adminCsrfCookie],
    csrfToken: adminCsrfToken,
  });
  check('Demoting sole active admin → 400 Bad Request', r.status === 400);
  check('Error identifies protection safeguard', r.json.message?.includes('Protection Violation'));

  // B. Attempt to deactivate the sole active admin
  r = await req('PATCH', `/users/${mainAdmin._id}`, {
    body: { status: 'suspended' },
    cookies: [adminAuthCookie, adminCsrfCookie],
    csrfToken: adminCsrfToken,
  });
  check('Suspending sole active admin → 400 Bad Request', r.status === 400);
  check('Error identifies protection safeguard', r.json.message?.includes('Protection Violation'));

  // C. Attempt to delete the sole active admin
  r = await req('DELETE', `/users/${mainAdmin._id}`, {
    cookies: [adminAuthCookie, adminCsrfCookie],
    csrfToken: adminCsrfToken,
  });
  check('Deleting sole active admin → 400 Bad Request', r.status === 400);
  check('Error identifies protection safeguard', r.json.message?.includes('Protection Violation'));

  // ─── 7. DELETE USER (DELETE /users/:id) ──────────────────────────────────
  console.log('\n── 7. Delete User (DELETE /users/:id) ──');

  r = await req('DELETE', `/users/${createdUserId}`, {
    cookies: [adminAuthCookie, adminCsrfCookie],
    csrfToken: adminCsrfToken,
  });
  check('DELETE /users/:id returns 200 OK', r.status === 200);

  // Verify deletion
  r = await req('GET', `/users/${createdUserId}`, { cookies: [adminAuthCookie] });
  check('Deleted user no longer accessible → 404', r.status === 404);

  // ─── 8. DASHBOARD METRICS (GET /metrics/dashboard) ───────────────────────
  console.log('\n── 8. Dashboard Metrics (GET /metrics/dashboard) ──');

  r = await req('GET', '/metrics/dashboard', { cookies: [adminAuthCookie] });
  check('GET /metrics/dashboard returns 200 OK', r.status === 200);
  check('Metrics object contains totalUsers', typeof r.json.data?.metrics?.totalUsers === 'number');
  check('Metrics object contains activeUsers', typeof r.json.data?.metrics?.activeUsers === 'number');
  check('Metrics object contains inactiveUsers', typeof r.json.data?.metrics?.inactiveUsers === 'number');
  check('Metrics object contains suspendedUsers', typeof r.json.data?.metrics?.suspendedUsers === 'number');
  check('Metrics object contains adminUsers', typeof r.json.data?.metrics?.adminUsers === 'number');
  check('recentRegistrations is an array', Array.isArray(r.json.data?.recentRegistrations));
  check('recentRegistrations does not expose passwords', !r.json.data?.recentRegistrations?.[0]?.password);
  check('trend is a 30-day array', Array.isArray(r.json.data?.trend) && r.json.data?.trend?.length >= 30);

  // ─── CLEANUP ─────────────────────────────────────────────────────────────
  await User.deleteMany({
    email: {
      $in: [
        'crud_test_user@test.internal',
        'crud_temp@test.internal',
        'crud_admin2@test.internal',
      ],
    },
  });
  await mongoose.connection.close();

  console.log(`\n═══════════════════════════════════════════════════════════════`);
  console.log(` Results: ${pass} passed, ${fail} failed`);
  console.log(`═══════════════════════════════════════════════════════════════\n`);

  process.exit(fail > 0 ? 1 : 0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
