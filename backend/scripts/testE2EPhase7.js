// backend/scripts/testE2EPhase7.js
// End-to-End full flow verification for Phase 7:
// User CRUD, Dashboard Metrics, Profile Management, Password Rotation, and Last-Admin Safety

import 'dotenv/config';

const BASE = 'http://localhost:5000/api/v1';
const ORIGIN = 'http://localhost:5173';

const ADMIN_EMAIL = process.env.ADMIN_SEED_EMAIL || 'admin@growthconsole.internal';
const ADMIN_PASSWORD = process.env.ADMIN_SEED_PASSWORD || 'Admin@GrowthConsole2026';

let pass = 0;
let fail = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅  ${message}`);
    pass++;
  } else {
    console.error(`  ❌  FAILED: ${message}`);
    fail++;
  }
}

async function req(method, path, {
  body = null,
  cookies = [],
  origin = ORIGIN,
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
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(' PHASE 7 — FULL END-TO-END FLOW VERIFICATION');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Step 1: CSRF Seeding
  console.log('── Step 1: Anonymous CSRF Seeding ──');
  const anonRes = await req('GET', '/auth/csrf-token');
  assert(anonRes.status === 200, 'GET /auth/csrf-token returns 200');
  const anonCookie = `gc_csrf_token=${anonRes.responseCookies['gc_csrf_token']}`;
  const anonToken = anonRes.json.data?.csrfToken;
  assert(!!anonToken, 'Acquired anonymous CSRF token');

  // Step 2: Admin Login
  console.log('\n── Step 2: Administrator Login & Session Binding ──');
  const loginRes = await req('POST', '/auth/login', {
    body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    cookies: [anonCookie],
    csrfToken: anonToken,
  });
  assert(loginRes.status === 200, 'Admin login succeeded → 200 OK');
  assert(loginRes.json.data?.user?.role === 'admin', 'Authenticated as admin');

  const adminAuthCookie = `gc_token=${loginRes.responseCookies['gc_token']}`;
  let adminCsrfCookie = `gc_csrf_token=${loginRes.responseCookies['gc_csrf_token']}`;
  let adminCsrfToken = loginRes.json.data?.csrfToken;
  assert(!!adminCsrfToken, 'Received session-bound CSRF token for admin');

  // Step 3: Fetch Dashboard Metrics
  console.log('\n── Step 3: Metrics Dashboard Aggregation ──');
  const metricsRes = await req('GET', '/metrics/dashboard', {
    cookies: [adminAuthCookie, adminCsrfCookie],
  });
  assert(metricsRes.status === 200, 'GET /metrics/dashboard returns 200 OK');
  assert(typeof metricsRes.json.data?.metrics?.totalUsers === 'number', 'totalUsers is a number');
  assert(typeof metricsRes.json.data?.metrics?.activeUsers === 'number', 'activeUsers is a number');
  assert(Array.isArray(metricsRes.json.data?.recentRegistrations), 'recentRegistrations is an array');
  assert(Array.isArray(metricsRes.json.data?.trend), 'trend is a 30-day array');

  // Step 4: Admin creates a regular user
  console.log('\n── Step 4: Admin Creates a Regular User ──');
  const testUserEmail = `member_${Date.now()}@test.internal`;
  const createUserRes = await req('POST', '/users', {
    body: {
      name: 'E2E Member',
      email: testUserEmail,
      password: 'InitialPassword123!',
      role: 'user',
      status: 'active',
    },
    cookies: [adminAuthCookie, adminCsrfCookie],
    csrfToken: adminCsrfToken,
  });
  assert(createUserRes.status === 201, 'POST /users creates user → 201 Created');
  const createdUserId = createUserRes.json.data?.user?._id;
  assert(!!createdUserId, 'Created user has ID');
  assert(!createUserRes.json.data?.user?.password, 'Password hash is NOT exposed');

  // Step 5: Admin Lists Users with Filters & Pagination
  console.log('\n── Step 5: User Listing, Filtering & Pagination ──');
  const listUsersRes = await req('GET', '/users?search=E2E&role=user&page=1&limit=10&sortBy=createdAt&order=desc', {
    cookies: [adminAuthCookie, adminCsrfCookie],
  });
  assert(listUsersRes.status === 200, 'GET /users returns 200 OK');
  assert(listUsersRes.json.data?.some((u) => u._id === createdUserId), 'Created user found in list');
  assert(listUsersRes.json.meta?.page === 1, 'Pagination page = 1');

  // Step 6: Admin Updates Created User
  console.log('\n── Step 6: Admin Updates User Profile ──');
  const updateRes = await req('PATCH', `/users/${createdUserId}`, {
    body: { name: 'E2E Member Updated' },
    cookies: [adminAuthCookie, adminCsrfCookie],
    csrfToken: adminCsrfToken,
  });
  assert(updateRes.status === 200, 'PATCH /users/:id updates user → 200 OK');
  assert(updateRes.json.data?.user?.name === 'E2E Member Updated', 'Name successfully modified');

  // Step 7: Last Administrator Demotion Guard
  console.log('\n── Step 7: Last Active Administrator Safety Guard ──');
  const adminId = loginRes.json.data?.user?._id;
  const demoteAdminRes = await req('PATCH', `/users/${adminId}`, {
    body: { role: 'user' },
    cookies: [adminAuthCookie, adminCsrfCookie],
    csrfToken: adminCsrfToken,
  });
  assert(demoteAdminRes.status === 400, 'Demoting sole active admin fails → 400 Bad Request');
  assert(
    demoteAdminRes.json.message?.toLowerCase().includes('administrator'),
    'Safeguard message returned'
  );

  // Step 8: Admin Logs Out
  console.log('\n── Step 8: Administrator Logout ──');
  const adminLogoutRes = await req('POST', '/auth/logout', {
    cookies: [adminAuthCookie, adminCsrfCookie],
    csrfToken: adminCsrfToken,
  });
  assert(adminLogoutRes.status === 200, 'Admin logout → 200 OK');

  // Step 9: Created User Logs In
  console.log('\n── Step 9: Created User Logs In & Self-Service Flow ──');
  const memberAnonRes = await req('GET', '/auth/csrf-token');
  const memberAnonCookie = `gc_csrf_token=${memberAnonRes.responseCookies['gc_csrf_token']}`;
  const memberAnonToken = memberAnonRes.json.data?.csrfToken;

  const memberLoginRes = await req('POST', '/auth/login', {
    body: { email: testUserEmail, password: 'InitialPassword123!' },
    cookies: [memberAnonCookie],
    csrfToken: memberAnonToken,
  });
  assert(memberLoginRes.status === 200, 'Member login → 200 OK');

  const memberAuthCookie = `gc_token=${memberLoginRes.responseCookies['gc_token']}`;
  let memberCsrfCookie = `gc_csrf_token=${memberLoginRes.responseCookies['gc_csrf_token']}`;
  let memberCsrfToken = memberLoginRes.json.data?.csrfToken;

  // Step 10: Member Self-Service Updates Profile Name
  console.log('\n── Step 10: Member Self-Service Updates Profile Name ──');
  const memberProfileRes = await req('PATCH', '/profile', {
    body: { name: 'Self Renamed Member' },
    cookies: [memberAuthCookie, memberCsrfCookie],
    csrfToken: memberCsrfToken,
  });
  assert(memberProfileRes.status === 200, 'PATCH /profile updates name → 200 OK');
  assert(memberProfileRes.json.data?.user?.name === 'Self Renamed Member', 'Profile name updated');

  // Step 11: Member Rotates Password
  console.log('\n── Step 11: Member Rotates Password ──');
  const passwordChangeRes = await req('PATCH', '/profile/password', {
    body: { currentPassword: 'InitialPassword123!', newPassword: 'NewSecurePassword123!' },
    cookies: [memberAuthCookie, memberCsrfCookie],
    csrfToken: memberCsrfToken,
  });
  assert(passwordChangeRes.status === 200, 'PATCH /profile/password succeeds → 200 OK');

  // Step 12: Member Verifies Re-login with New Password
  console.log('\n── Step 12: Member Re-logins with New Password ──');
  const reloginAnonRes = await req('GET', '/auth/csrf-token');
  const reloginAnonCookie = `gc_csrf_token=${reloginAnonRes.responseCookies['gc_csrf_token']}`;
  const reloginAnonToken = reloginAnonRes.json.data?.csrfToken;

  const memberReloginRes = await req('POST', '/auth/login', {
    body: { email: testUserEmail, password: 'NewSecurePassword123!' },
    cookies: [reloginAnonCookie],
    csrfToken: reloginAnonToken,
  });
  assert(memberReloginRes.status === 200, 'Member login with new password succeeds → 200 OK');

  // Step 13: Clean up - Admin logs back in and deletes the created user
  console.log('\n── Step 13: Admin Cleans Up / Deletes Test User ──');
  const adminReCsrfRes = await req('GET', '/auth/csrf-token');
  const adminReAnonCookie = `gc_csrf_token=${adminReCsrfRes.responseCookies['gc_csrf_token']}`;
  const adminReAnonToken = adminReCsrfRes.json.data?.csrfToken;

  const adminRelogin = await req('POST', '/auth/login', {
    body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    cookies: [adminReAnonCookie],
    csrfToken: adminReAnonToken,
  });

  const adminReAuthCookie = `gc_token=${adminRelogin.responseCookies['gc_token']}`;
  const adminReCsrfCookie = `gc_csrf_token=${adminRelogin.responseCookies['gc_csrf_token']}`;
  const adminReCsrfToken = adminRelogin.json.data?.csrfToken;

  const deleteRes = await req('DELETE', `/users/${createdUserId}`, {
    cookies: [adminReAuthCookie, adminReCsrfCookie],
    csrfToken: adminReCsrfToken,
  });
  assert(deleteRes.status === 200, 'DELETE /users/:id deletes user → 200 OK');

  // Verify deletion
  const getDeletedRes = await req('GET', `/users/${createdUserId}`, {
    cookies: [adminReAuthCookie, adminReCsrfCookie],
  });
  assert(getDeletedRes.status === 404, 'Deleted user is 404 Not Found');

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(` Results: ${pass} passed, ${fail} failed`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (fail > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Fatal error during E2E test:', err);
  process.exit(1);
});