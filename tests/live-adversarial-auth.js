import fs from 'fs';
import path from 'path';

function loadEnv(envPath) {
  const env = {};
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
        env[key] = val;
      }
    }
  }
  return env;
}

const env = loadEnv(path.resolve('backend/.env'));

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';
const ADMIN_EMAIL = env.ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'memenoname60@gmail.com';
const ADMIN_PASSWORD = env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || 'Meme@12345';

console.log('================================================================');
console.log('   LIVE ADVERSARIAL AUTH & REFRESH PROTOCOL VERIFICATION       ');
console.log('================================================================\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    failed++;
    console.error(`  ❌ FAIL: ${message}`);
    throw new Error(message);
  } else {
    passed++;
    console.log(`  ✅ PASS: ${message}`);
  }
}

async function run() {
  // 1. Refresh without any cookie
  console.log('1. Testing POST /auth/refresh without cookies:');
  const resNoCookie = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  assert(resNoCookie.status === 401, `Status is 401 (got: ${resNoCookie.status})`);
  const dataNoCookie = await resNoCookie.json();
  assert(dataNoCookie.success === false, 'Body success is false');

  // 2. Refresh with corrupted/forged cookie
  console.log('\n2. Testing POST /auth/refresh with forged cookie:');
  const resForged = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': 'refreshToken=forged.jwt.token'
    }
  });
  assert(resForged.status === 401, `Status is 401 for forged token (got: ${resForged.status})`);

  // 3. Login with credentials
  console.log('\n3. Testing POST /auth/login with valid admin credentials:');
  const resLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
  });
  assert(resLogin.status === 200, `Login status is 200 (got: ${resLogin.status})`);
  const loginData = await resLogin.json();
  assert(loginData.success === true, 'Login body success is true');
  assert(Boolean(loginData.data?.accessToken), 'Access token present in body');

  const setCookieHeader = resLogin.headers.get('set-cookie');
  assert(Boolean(setCookieHeader), 'set-cookie header present in response');
  assert(setCookieHeader.includes('refreshToken='), 'refreshToken cookie is set');
  assert(setCookieHeader.toLowerCase().includes('httponly'), 'refreshToken cookie has HttpOnly flag');

  const cookieMatch = setCookieHeader.match(/refreshToken=([^;]+)/);
  const cookieValue = cookieMatch ? cookieMatch[1] : '';

  // 4. Refresh session using valid cookie
  console.log('\n4. Testing POST /auth/refresh with valid cookie:');
  const resRefresh = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `refreshToken=${cookieValue}`
    }
  });
  assert(resRefresh.status === 200, `Refresh status is 200 (got: ${resRefresh.status})`);
  const refreshData = await resRefresh.json();
  assert(refreshData.success === true, 'Refresh data success is true');
  assert(Boolean(refreshData.data?.accessToken), 'New access token issued upon rotation');

  // 5. Logout
  console.log('\n5. Testing POST /auth/logout:');
  const resLogout = await fetch(`${BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `refreshToken=${cookieValue}`
    }
  });
  assert(resLogout.status === 200, `Logout status is 200 (got: ${resLogout.status})`);
  const logoutSetCookie = resLogout.headers.get('set-cookie');
  assert(Boolean(logoutSetCookie), 'Logout clears refreshToken cookie');

  console.log(`\nAll Live Auth Tests Passed: ${passed} passed, ${failed} failed.`);
}

run().catch((e) => {
  console.error(`Fatal: ${e.message}`);
  process.exit(1);
});
