// scripts/testAuth.js
// Comprehensive test suite for Phase 6 + Security Corrections:
// 1. CSRF Protection (Origin validation, Double-Submit token, cross-origin defense)
// 2. Account Status Restrictions (Active, Inactive, Suspended)
// 3. Authentication & RBAC

import 'dotenv/config';
import mongoose from 'mongoose';
import User     from '../src/models/User.js';

const BASE = 'http://localhost:5000/api/v1';
const VALID_ORIGIN = 'http://localhost:5173';
const EVIL_ORIGIN  = 'http://evil.com';

let pass = 0;
let fail = 0;

const check = (label, ok) => {
  if (ok) { console.log(`  ✅  ${label}`); pass++; }
  else    { console.error(`  ❌  ${label}`); fail++; }
};

/**
 * Helper to make HTTP requests with full cookie, origin, and header control.
 */
async function req(method, path, {
  body = null,
  cookies = [],
  origin = VALID_ORIGIN,
  csrfToken = null,
  noOrigin = false,
} = {}) {
  const headers = { 'Content-Type': 'application/json' };

  if (!noOrigin && origin) {
    headers['Origin'] = origin;
  }
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }
  if (cookies.length > 0) {
    headers['Cookie'] = cookies.join('; ');
  }

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE}${path}`, opts);
  const rawSetCookie = res.headers.get('set-cookie') || '';
  const json = await res.json().catch(() => ({}));

  // Parse set-cookie into a dictionary of cookieName -> cookieValue
  const responseCookies = {};
  if (rawSetCookie) {
    const parts = rawSetCookie.split(/,\s*(?=[a-zA-Z0-9_]+=)/);
    for (const p of parts) {
      const match = p.match(/^([a-zA-Z0-9_]+)=([^;]*)/);
      if (match) {
        responseCookies[match[1]] = match[2];
      }
    }
  }

  return { status: res.status, json, responseCookies, rawSetCookie };
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  await User.deleteMany({
    email: {
      $in: [
        'csrftest@test.internal',
        'active@test.internal',
        'inactive@test.internal',
        'suspended@test.internal',
      ],
    },
  });

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(' PHASE 6 SECURITY CORRECTIONS — VALIDATION SUITE');
  console.log('═══════════════════════════════════════════════════════════\n');

  // ─── 1. CSRF TOKEN RETRIEVAL & COOKIE SEEDING ────────────────────────────
  console.log('── 1. CSRF Token Generation & Cookie Seeding ──');

  let r = await req('GET', '/auth/csrf-token');
  check('GET /auth/csrf-token returns 200', r.status === 200);
  check('Returns signed csrfToken string in body (<hex>.<session>.<hmac>)', typeof r.json.data?.csrfToken === 'string' && r.json.data.csrfToken.split('.').length === 3);
  check('Sets gc_csrf_token cookie', !!r.responseCookies['gc_csrf_token']);
  check('gc_csrf_token cookie matches body token', r.responseCookies['gc_csrf_token'] === r.json.data?.csrfToken);

  let csrfCookie = `gc_csrf_token=${r.responseCookies['gc_csrf_token']}`;
  let csrfToken  = r.json.data.csrfToken;

  // ─── 2. CSRF ORIGIN & TOKEN ENFORCEMENT ON MUTATIONS ─────────────────────
  console.log('\n── 2. CSRF Defense on State-Changing Requests (POST/PATCH) ──');

  // Missing Origin header
  r = await req('POST', '/auth/register', {
    body: { name: 'CSRF Test', email: 'csrftest@test.internal', password: 'TestPassword123' },
    cookies: [csrfCookie],
    csrfToken,
    noOrigin: true,
  });
  check('Missing Origin header on POST → 403 Forbidden', r.status === 403);
  check('Error notes missing request origin', r.json.message?.includes('missing request origin'));

  // Untrusted Origin (cross-origin attack)
  r = await req('POST', '/auth/register', {
    body: { name: 'CSRF Test', email: 'csrftest@test.internal', password: 'TestPassword123' },
    cookies: [csrfCookie],
    csrfToken,
    origin: EVIL_ORIGIN,
  });
  check('Untrusted Origin (evil.com) on POST → 403 Forbidden', r.status === 403);
  check('Error notes untrusted or unpermitted origin', r.json.message?.includes('untrusted request origin') || r.json.message?.includes('not permitted'));

  // Missing X-CSRF-Token header
  r = await req('POST', '/auth/register', {
    body: { name: 'CSRF Test', email: 'csrftest@test.internal', password: 'TestPassword123' },
    cookies: [csrfCookie],
    csrfToken: null, // missing header
  });
  check('Missing X-CSRF-Token header → 403 Forbidden', r.status === 403);

  // Missing gc_csrf_token cookie
  r = await req('POST', '/auth/register', {
    body: { name: 'CSRF Test', email: 'csrftest@test.internal', password: 'TestPassword123' },
    cookies: [], // missing cookie
    csrfToken,
  });
  check('Missing gc_csrf_token cookie → 403 Forbidden', r.status === 403);

  // Mismatched token (header != cookie)
  r = await req('POST', '/auth/register', {
    body: { name: 'CSRF Test', email: 'csrftest@test.internal', password: 'TestPassword123' },
    cookies: [csrfCookie],
    csrfToken: 'wrong_csrf_token_000000000000000000000000000000000000000000000000',
  });
  check('Mismatched CSRF token → 403 Forbidden', r.status === 403);

  // Valid Origin + Valid CSRF Token → succeeds
  r = await req('POST', '/auth/register', {
    body: { name: 'Active User', email: 'active@test.internal', password: 'Password123!' },
    cookies: [csrfCookie],
    csrfToken,
  });
  check('Valid Origin + Valid CSRF Token → 201 Created', r.status === 201);
  check('Registration issues new gc_token HTTP-only cookie', !!r.responseCookies['gc_token']);
  check('Registration issues new gc_csrf_token cookie', !!r.responseCookies['gc_csrf_token']);

  let activeAuthCookie = `gc_token=${r.responseCookies['gc_token']}`;
  csrfCookie = `gc_csrf_token=${r.responseCookies['gc_csrf_token']}`;
  csrfToken = r.json.data.csrfToken;

  // ─── 3. ACTIVE USER WORKFLOW & RBAC ──────────────────────────────────────
  console.log('\n── 3. Active User Access & Profile Mutation ──');

  // GET /auth/me
  r = await req('GET', '/auth/me', { cookies: [activeAuthCookie] });
  check('Active user GET /auth/me → 200 OK', r.status === 200);
  check('Active user accountNotice is null', r.json.data?.accountNotice === null);

  // GET /profile
  r = await req('GET', '/profile', { cookies: [activeAuthCookie] });
  check('Active user GET /profile → 200 OK', r.status === 200);

  // PATCH /profile with CSRF
  r = await req('PATCH', '/profile', {
    body: { name: 'Active User Updated' },
    cookies: [activeAuthCookie, csrfCookie],
    csrfToken,
  });
  check('Active user PATCH /profile with CSRF → 200 OK', r.status === 200);
  check('Active user name was updated', r.json.data?.user?.name === 'Active User Updated');

  // PATCH /profile with evil origin (CSRF attempt)
  r = await req('PATCH', '/profile', {
    body: { name: 'Hacked Name' },
    cookies: [activeAuthCookie, csrfCookie],
    csrfToken,
    origin: EVIL_ORIGIN,
  });
  check('Cross-origin PATCH /profile → 403 Forbidden', r.status === 403);

  // Regular user accessing admin routes
  r = await req('GET', '/users', { cookies: [activeAuthCookie] });
  check('Regular user accessing /api/v1/users → 403 Forbidden', r.status === 403);

  r = await req('GET', '/metrics/dashboard', { cookies: [activeAuthCookie] });
  check('Regular user accessing /api/v1/metrics/dashboard → 403 Forbidden', r.status === 403);

  // ─── 4. INACTIVE USER RESTRICTIONS ───────────────────────────────────────
  console.log('\n── 4. Inactive Account Restrictions ──');

  // Create an inactive user directly in DB
  await User.create({
    name: 'Inactive Member',
    email: 'inactive@test.internal',
    password: 'Password123!',
    role: 'user',
    status: 'inactive',
  });

  // Get an unauthenticated visitor CSRF token for login
  const anonLogin = await req('GET', '/auth/csrf-token');
  const anonLoginCsrfCookie = `gc_csrf_token=${anonLogin.responseCookies['gc_csrf_token']}`;
  const anonLoginCsrfToken  = anonLogin.json.data.csrfToken;

  // Inactive user login: authentication succeeds, but restricted notice returned
  r = await req('POST', '/auth/login', {
    body: { email: 'inactive@test.internal', password: 'Password123!' },
    cookies: [anonLoginCsrfCookie],
    csrfToken: anonLoginCsrfToken,
  });
  check('Inactive user login → 200 OK (authentication succeeds)', r.status === 200);
  check('Login message communicates restricted access', r.json.message?.includes('restricted access'));
  check('Login returns accountNotice for inactive user', typeof r.json.data?.accountNotice === 'string');
  check('Login issues auth cookie for inactive user', !!r.responseCookies['gc_token']);

  const inactiveAuthCookie = `gc_token=${r.responseCookies['gc_token']}`;
  csrfCookie = `gc_csrf_token=${r.responseCookies['gc_csrf_token']}`;
  csrfToken = r.json.data.csrfToken;

  // Inactive user GET /auth/me: allowed so user/frontend can see status and notice
  r = await req('GET', '/auth/me', { cookies: [inactiveAuthCookie] });
  check('Inactive user GET /auth/me → 200 OK', r.status === 200);
  check('/auth/me returns status: inactive', r.json.data?.user?.status === 'inactive');
  check('/auth/me returns accountNotice', typeof r.json.data?.accountNotice === 'string');

  // Inactive user GET /profile: BLOCKED by requireActive
  r = await req('GET', '/profile', { cookies: [inactiveAuthCookie] });
  check('Inactive user GET /profile → 403 Forbidden (access restricted)', r.status === 403);
  check('403 response includes accountStatus inactive', r.json.data?.accountStatus === 'inactive');
  check('403 response includes account notice', typeof r.json.data?.notice === 'string');

  // Inactive user direct PATCH /profile: BLOCKED by requireActive
  r = await req('PATCH', '/profile', {
    body: { name: 'Bypass Attempt' },
    cookies: [inactiveAuthCookie, csrfCookie],
    csrfToken,
  });
  check('Inactive user direct PATCH /profile → 403 Forbidden', r.status === 403);

  // Inactive user direct PATCH /profile/password: BLOCKED by requireActive
  r = await req('PATCH', '/profile/password', {
    body: { currentPassword: 'Password123!', newPassword: 'NewPassword123!' },
    cookies: [inactiveAuthCookie, csrfCookie],
    csrfToken,
  });
  check('Inactive user direct password change → 403 Forbidden', r.status === 403);

  // Inactive user accessing admin routes: BLOCKED by requireActive + authorize
  r = await req('GET', '/users', { cookies: [inactiveAuthCookie] });
  check('Inactive user accessing /users → 403 Forbidden', r.status === 403);

  // Inactive user can logout
  r = await req('POST', '/auth/logout', {
    cookies: [inactiveAuthCookie, csrfCookie],
    csrfToken,
  });
  check('Inactive user can logout → 200 OK', r.status === 200);

  // ─── 5. SUSPENDED USER DENIAL ────────────────────────────────────────────
  console.log('\n── 5. Suspended Account Denial ──');

  await User.create({
    name: 'Suspended Member',
    email: 'suspended@test.internal',
    password: 'Password123!',
    role: 'user',
    status: 'suspended',
  });

  // Get an unauthenticated visitor CSRF token for suspended login attempt
  const anonSuspended = await req('GET', '/auth/csrf-token');
  const anonSuspendedCookie = `gc_csrf_token=${anonSuspended.responseCookies['gc_csrf_token']}`;
  const anonSuspendedToken  = anonSuspended.json.data.csrfToken;

  // Suspended user login: REJECTED with 403
  r = await req('POST', '/auth/login', {
    body: { email: 'suspended@test.internal', password: 'Password123!' },
    cookies: [anonSuspendedCookie],
    csrfToken: anonSuspendedToken,
  });
  check('Suspended user login → 403 Forbidden (denied)', r.status === 403);
  check('Error message specifies suspended', r.json.message?.toLowerCase().includes('suspended'));

  // Now simulate an active user getting suspended mid-session
  await User.updateOne({ email: 'active@test.internal' }, { status: 'suspended' });

  // Suspended user GET /auth/me with existing cookie: REJECTED with 403
  r = await req('GET', '/auth/me', { cookies: [activeAuthCookie] });
  check('Suspended user GET /auth/me → 403 Forbidden', r.status === 403);

  // Suspended user GET /profile: REJECTED with 403
  r = await req('GET', '/profile', { cookies: [activeAuthCookie] });
  check('Suspended user GET /profile → 403 Forbidden', r.status === 403);

  // ─── 6. ADMIN RBAC & LOGOUT WITH CSRF ────────────────────────────────────
  console.log('\n── 6. Admin RBAC & Logout with CSRF ──');

  // Get an unauthenticated visitor CSRF token for admin login
  const anonAdmin = await req('GET', '/auth/csrf-token');
  const anonAdminCookie = `gc_csrf_token=${anonAdmin.responseCookies['gc_csrf_token']}`;
  const anonAdminToken  = anonAdmin.json.data.csrfToken;

  // Admin login
  r = await req('POST', '/auth/login', {
    body: { email: process.env.ADMIN_SEED_EMAIL, password: process.env.ADMIN_SEED_PASSWORD },
    cookies: [anonAdminCookie],
    csrfToken: anonAdminToken,
  });
  check('Admin login with CSRF → 200 OK', r.status === 200);
  check('Admin role confirmed', r.json.data?.user?.role === 'admin');

  const adminAuthCookie = `gc_token=${r.responseCookies['gc_token']}`;
  csrfCookie = `gc_csrf_token=${r.responseCookies['gc_csrf_token']}`;
  csrfToken = r.json.data.csrfToken;

  // Admin accesses /users (returns 200 — passed RBAC guards & returns users)
  r = await req('GET', '/users', { cookies: [adminAuthCookie] });
  check('Admin accessing /users → 200 (passed RBAC guards)', r.status === 200);

  // Admin accesses /metrics/dashboard (returns 200 — passed RBAC guards & returns metrics)
  r = await req('GET', '/metrics/dashboard', { cookies: [adminAuthCookie] });
  check('Admin accessing /metrics/dashboard → 200 (passed RBAC guards)', r.status === 200);

  // Admin logout with CSRF
  r = await req('POST', '/auth/logout', {
    cookies: [adminAuthCookie, csrfCookie],
    csrfToken,
  });
  check('Admin logout with CSRF → 200 OK', r.status === 200);
  check('Logout clears gc_token cookie', r.rawSetCookie.includes('gc_token=;') || r.rawSetCookie.includes('gc_token= '));
  check('Logout clears gc_csrf_token cookie', r.rawSetCookie.includes('gc_csrf_token=;') || r.rawSetCookie.includes('gc_csrf_token= '));

  // ─── CLEANUP ─────────────────────────────────────────────────────────────
  await User.deleteMany({
    email: {
      $in: [
        'csrftest@test.internal',
        'active@test.internal',
        'inactive@test.internal',
        'suspended@test.internal',
      ],
    },
  });
  await mongoose.connection.close();

  console.log(`\n═══════════════════════════════════════════════════════════`);
  console.log(` Results: ${pass} passed, ${fail} failed`);
  console.log(`═══════════════════════════════════════════════════════════\n`);

  process.exit(fail > 0 ? 1 : 0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
