// scripts/testCsrfHardening.js
// Focused validation script for Phase 6 CSRF Hardening with Session-jti Binding:
// - Valid signed token (HMAC-SHA256)
// - Unique JWT jti claim per login
// - CSRF token bound to exact JWT session jti (not just user ID)
// - Same user, two independent login sessions (Session A vs Session B cross-rejection)
// - Tampered token / invalid signature detection
// - Cookie injection / mismatched token detection
// - Anonymous token blocked on authenticated mutations
// - Valid and invalid Origin validation
// - Authenticated vs unauthenticated mutations

import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/models/User.js';

const BASE = 'http://localhost:5000/api/v1';
const VALID_ORIGIN = 'http://localhost:5173';
const EVIL_ORIGIN  = 'http://evil.com';

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
  await User.deleteMany({ email: { $in: ['csrf_test_user@test.internal'] } });

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(' PHASE 6 — CSRF SESSION-JTI BINDING VALIDATION SUITE');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // ─── 1. SIGNED TOKEN GENERATION (ANONYMOUS) ──────────────────────────────
  console.log('── 1. Signed Token Structure & Anonymous Binding ──');

  let r = await req('GET', '/auth/csrf-token');
  check('GET /auth/csrf-token returns 200', r.status === 200);

  const anonToken = r.json.data?.csrfToken;
  check('Anon token exists', !!anonToken);

  const parts = anonToken ? anonToken.split('.') : [];
  check('Token format has exactly 3 segments (<hex>.<session>.<hmac>)', parts.length === 3);
  check('Random hex segment is 64 characters (32 bytes)', parts[0]?.length === 64);
  check('Session binding for visitor is "anon"', parts[1] === 'anon');
  check('HMAC signature segment is 64 characters (sha256 hex)', parts[2]?.length === 64);

  const anonCookie = `gc_csrf_token=${anonToken}`;

  // ─── 2. UNAUTHENTICATED MUTATION CSRF DEFENSES ───────────────────────────
  console.log('\n── 2. Unauthenticated Mutation CSRF Defenses (Login / Register) ──');

  // A. Missing Origin
  r = await req('POST', '/auth/login', {
    body: { email: 'csrf_test_user@test.internal', password: 'Password123!' },
    cookies: [anonCookie],
    csrfToken: anonToken,
    noOrigin: true,
  });
  check('Missing Origin header → 403 Forbidden', r.status === 403);
  check('Error identifies missing origin', r.json.message?.includes('missing request origin'));

  // B. Invalid / Untrusted Origin
  r = await req('POST', '/auth/login', {
    body: { email: 'csrf_test_user@test.internal', password: 'Password123!' },
    cookies: [anonCookie],
    csrfToken: anonToken,
    origin: EVIL_ORIGIN,
  });
  check('Untrusted Origin (evil.com) → 403 Forbidden', r.status === 403);

  // C. Missing Token Header
  r = await req('POST', '/auth/login', {
    body: { email: 'csrf_test_user@test.internal', password: 'Password123!' },
    cookies: [anonCookie],
    csrfToken: null,
  });
  check('Missing X-CSRF-Token header → 403 Forbidden', r.status === 403);
  check('Error identifies missing CSRF token', r.json.message?.includes('missing CSRF token'));

  // D. Missing Cookie
  r = await req('POST', '/auth/login', {
    body: { email: 'csrf_test_user@test.internal', password: 'Password123!' },
    cookies: [],
    csrfToken: anonToken,
  });
  check('Missing gc_csrf_token cookie → 403 Forbidden', r.status === 403);
  check('Error identifies missing CSRF token', r.json.message?.includes('missing CSRF token'));

  // E. Cookie Injection / Mismatched Token
  const injectedCookie = 'gc_csrf_token=injected_attacker_cookie_value';
  r = await req('POST', '/auth/login', {
    body: { email: 'csrf_test_user@test.internal', password: 'Password123!' },
    cookies: [injectedCookie],
    csrfToken: anonToken,
  });
  check('Cookie injection / mismatched token → 403 Forbidden', r.status === 403);
  check('Error identifies mismatched CSRF token', r.json.message?.includes('mismatched CSRF token'));

  // F. Tampered Token Signature
  const tamperedSig = parts[2].substring(0, 63) + (parts[2][63] === 'a' ? 'b' : 'a');
  const tamperedToken = `${parts[0]}.${parts[1]}.${tamperedSig}`;
  r = await req('POST', '/auth/login', {
    body: { email: 'csrf_test_user@test.internal', password: 'Password123!' },
    cookies: [`gc_csrf_token=${tamperedToken}`],
    csrfToken: tamperedToken,
  });
  check('Tampered signature → 403 Forbidden', r.status === 403);
  check('Error identifies invalid/tampered signature', r.json.message?.includes('invalid or tampered CSRF signature'));

  // G. Forged Session Binding without valid HMAC
  const forgedBindingToken = `${parts[0]}.sess_fake_uuid.${parts[2]}`;
  r = await req('POST', '/auth/login', {
    body: { email: 'csrf_test_user@test.internal', password: 'Password123!' },
    cookies: [`gc_csrf_token=${forgedBindingToken}`],
    csrfToken: forgedBindingToken,
  });
  check('Forged session binding without valid HMAC → 403 Forbidden', r.status === 403);
  check('Error identifies invalid/tampered signature', r.json.message?.includes('invalid or tampered CSRF signature'));

  // H. Valid Unauthenticated Mutation (Register with valid anon token)
  r = await req('POST', '/auth/register', {
    body: { name: 'CSRF User', email: 'csrf_test_user@test.internal', password: 'Password123!' },
    cookies: [anonCookie],
    csrfToken: anonToken,
  });
  check('Valid unauthenticated mutation (register) with signed anon token → 201 Created', r.status === 201);

  // ─── 3. TOKEN ROTATION & UNIQUE SESSION JTI BINDING ──────────────────────
  console.log('\n── 3. Token Rotation & Unique JWT Session-jti Binding ──');

  const userCsrfToken = r.json.data?.csrfToken;
  const authCookie = `gc_token=${r.responseCookies['gc_token']}`;
  const userCsrfCookie = `gc_csrf_token=${r.responseCookies['gc_csrf_token']}`;

  check('Registration issues new session-bound CSRF token', !!userCsrfToken);
  check('New token differs from anonymous token', userCsrfToken !== anonToken);

  const userParts = userCsrfToken ? userCsrfToken.split('.') : [];
  check('New token is bound to unique JWT session (`sess_<jti>`)', userParts[1]?.startsWith('sess_'));

  // Authenticated mutation with session-bound token → succeeds
  r = await req('PATCH', '/profile', {
    body: { name: 'CSRF User Renamed' },
    cookies: [authCookie, userCsrfCookie],
    csrfToken: userCsrfToken,
  });
  check('Authenticated PATCH /profile with session-bound token → 200 OK', r.status === 200);

  // Anonymous token on authenticated mutation → rejected
  r = await req('PATCH', '/profile', {
    body: { name: 'Attacker Hack Attempt' },
    cookies: [authCookie, anonCookie],
    csrfToken: anonToken,
  });
  check('Authenticated request with anonymous token → 403 Forbidden', r.status === 403);
  check('Error specifies token not bound to current session', r.json.message?.includes('token not bound to current session'));

  // ─── 4. SAME USER, TWO INDEPENDENT LOGIN SESSIONS (SESSION A vs B) ───────
  console.log('\n── 4. Same User, Two Independent Login Sessions (Session A vs B) ──');

  // Obtain an anonymous token for Session A login
  const anonA = await req('GET', '/auth/csrf-token');
  const anonCookieA = `gc_csrf_token=${anonA.responseCookies['gc_csrf_token']}`;
  const anonTokenA  = anonA.json.data.csrfToken;

  // Session A Login
  const resA = await req('POST', '/auth/login', {
    body: { email: 'csrf_test_user@test.internal', password: 'Password123!' },
    cookies: [anonCookieA],
    csrfToken: anonTokenA,
  });
  check('Session A login → 200 OK', resA.status === 200);

  const authCookieA = `gc_token=${resA.responseCookies['gc_token']}`;
  const csrfCookieA = `gc_csrf_token=${resA.responseCookies['gc_csrf_token']}`;
  const csrfTokenA  = resA.json.data.csrfToken;
  const sessionA_Id = csrfTokenA.split('.')[1];

  check('Session A has unique jti session identifier', sessionA_Id.startsWith('sess_'));

  // Obtain an anonymous token for Session B login
  const anonB = await req('GET', '/auth/csrf-token');
  const anonCookieB = `gc_csrf_token=${anonB.responseCookies['gc_csrf_token']}`;
  const anonTokenB  = anonB.json.data.csrfToken;

  // Session B Login (same user, different login instance)
  const resB = await req('POST', '/auth/login', {
    body: { email: 'csrf_test_user@test.internal', password: 'Password123!' },
    cookies: [anonCookieB],
    csrfToken: anonTokenB,
  });
  check('Session B login (same user) → 200 OK', resB.status === 200);

  const authCookieB = `gc_token=${resB.responseCookies['gc_token']}`;
  const csrfCookieB = `gc_csrf_token=${resB.responseCookies['gc_csrf_token']}`;
  const csrfTokenB  = resB.json.data.csrfToken;
  const sessionB_Id = csrfTokenB.split('.')[1];

  check('Session B has unique jti session identifier', sessionB_Id.startsWith('sess_'));
  check('Session A jti differs from Session B jti', sessionA_Id !== sessionB_Id);

  // 1. Session A token MUST WORK in Session A
  r = await req('PATCH', '/profile', {
    body: { name: 'Updated from Session A' },
    cookies: [authCookieA, csrfCookieA],
    csrfToken: csrfTokenA,
  });
  check('Session A token works in Session A → 200 OK', r.status === 200);
  check('Profile name updated in Session A', r.json.data?.user?.name === 'Updated from Session A');

  // 2. Session A token MUST FAIL in Session B (cross-session rejection for same user)
  r = await req('PATCH', '/profile', {
    body: { name: 'Attempt from Session A on Session B' },
    cookies: [authCookieB, csrfCookieA],
    csrfToken: csrfTokenA,
  });
  check('Session A token FAILS in Session B (same user) → 403 Forbidden', r.status === 403);
  check('Error confirms token not bound to current session', r.json.message?.includes('token not bound to current session'));

  // 3. Session B token MUST WORK in Session B
  r = await req('PATCH', '/profile', {
    body: { name: 'Updated from Session B' },
    cookies: [authCookieB, csrfCookieB],
    csrfToken: csrfTokenB,
  });
  check('Session B token works in Session B → 200 OK', r.status === 200);
  check('Profile name updated in Session B', r.json.data?.user?.name === 'Updated from Session B');

  // 4. Session B token MUST FAIL in Session A
  r = await req('PATCH', '/profile', {
    body: { name: 'Attempt from Session B on Session A' },
    cookies: [authCookieA, csrfCookieB],
    csrfToken: csrfTokenB,
  });
  check('Session B token FAILS in Session A (same user) → 403 Forbidden', r.status === 403);

  // ─── 5. TAMPERED & ORIGIN DEFENSES ON AUTHENTICATED SESSION ──────────────
  console.log('\n── 5. Tampered & Origin Defenses on Authenticated Session ──');

  // Tampered user token
  const tamperedSessionBToken = `${csrfTokenB.split('.')[0]}.${sessionB_Id}.tampered_signature_0000000000000000000000000000000000000000000000`;
  r = await req('PATCH', '/profile', {
    body: { name: 'Tamper Hack' },
    cookies: [authCookieB, `gc_csrf_token=${tamperedSessionBToken}`],
    csrfToken: tamperedSessionBToken,
  });
  check('Tampered session token → 403 Forbidden', r.status === 403);

  // Evil origin
  r = await req('PATCH', '/profile', {
    body: { name: 'Evil Origin Hack' },
    cookies: [authCookieB, csrfCookieB],
    csrfToken: csrfTokenB,
    origin: EVIL_ORIGIN,
  });
  check('Authenticated mutation with evil origin → 403 Forbidden', r.status === 403);

  // Missing CSRF token
  r = await req('PATCH', '/profile', {
    body: { name: 'No Token Hack' },
    cookies: [authCookieB, csrfCookieB],
    csrfToken: null,
  });
  check('Authenticated mutation with missing CSRF header → 403 Forbidden', r.status === 403);

  // ─── 6. LOGOUT AND COOKIE CLEARING ───────────────────────────────────────
  console.log('\n── 6. Logout and Cookie Clearing ──');

  r = await req('POST', '/auth/logout', {
    cookies: [authCookieB, csrfCookieB],
    csrfToken: csrfTokenB,
  });
  check('Logout with valid token → 200 OK', r.status === 200);
  check('Logout clears gc_token cookie', r.rawSetCookie.includes('gc_token=;') || r.rawSetCookie.includes('gc_token= '));
  check('Logout clears gc_csrf_token cookie', r.rawSetCookie.includes('gc_csrf_token=;') || r.rawSetCookie.includes('gc_csrf_token= '));

  // ─── CLEANUP ─────────────────────────────────────────────────────────────
  await User.deleteMany({ email: { $in: ['csrf_test_user@test.internal'] } });
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
