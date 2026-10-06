/**
 * Empirical Adversarial Stress Test Suite: Milestone 5 Iteration 2
 * Agent: Challenger 1 (challenger_tier5_it2_1)
 *
 * Covers:
 * 1. Auth & Session Security Concurrency & Cryptographic Tampering
 * 2. Contact Submission Extreme Inputs & Injection Attacks
 * 3. Content Resilience, Empty Arrays, Nulls & ObjectID Boundaries
 * 4. Date Formatter Extreme Inputs, Symbols, Circular Structures & Missing Locales
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import jwt from '../backend/node_modules/jsonwebtoken/index.js';

// Environment loader
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
const PORT = process.env.PORT || env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;
const ADMIN_EMAIL = env.ADMIN_EMAIL || 'memenoname60@gmail.com';
const ADMIN_PASSWORD = env.ADMIN_PASSWORD || 'Meme@1234';
const JWT_ACCESS_SECRET = env.JWT_ACCESS_SECRET || 'kjdkjdcjkkcejecjkkerok322';
const JWT_REFRESH_SECRET = env.JWT_REFRESH_SECRET || 'oiduky832iodohdxnjknUH0098hHOI';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failedTests++;
    failures.push({ testName, details });
    console.error(`  ✗ FAIL: ${testName}${details ? ` -> ${details}` : ''}`);
  }
}

function parseCookie(setCookieHeader, cookieName) {
  if (!setCookieHeader) return null;
  const match = setCookieHeader.match(new RegExp(`${cookieName}=([^;]+)`));
  return match ? match[1] : null;
}

async function apiRequest(endpoint, { method = 'GET', body = null, token = null, cookie = null } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (cookie) headers['Cookie'] = cookie;

  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers,
    body: body !== null ? JSON.stringify(body) : undefined,
  };

  const res = await fetch(url, options);
  let json = null;
  try {
    json = await res.json();
  } catch {
    // Non-JSON response
  }
  return {
    status: res.status,
    headers: res.headers,
    setCookie: res.headers.get('set-cookie'),
    data: json,
  };
}

async function getAdminSession() {
  const res = await apiRequest('/auth/login', {
    method: 'POST',
    body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  if (res.status !== 200 || !res.data?.success) {
    throw new Error(`Admin login failed: ${JSON.stringify(res.data)}`);
  }
  const accessToken = res.data.data.accessToken;
  const refreshToken = parseCookie(res.setCookie, 'refreshToken');
  return { accessToken, refreshToken, setCookie: res.setCookie };
}

// ============================================================================
// 1. AUTH & SESSION SECURITY CONCURRENCY & CRYPTOGRAPHIC TAMPERING
// ============================================================================
async function testAuthSecurity() {
  console.log('\n============================================================');
  console.log('1. AUTH & SESSION SECURITY CONCURRENCY & CRYPTOGRAPHIC TAMPERING');
  console.log('============================================================');

  const { accessToken: token0, refreshToken: cookie0 } = await getAdminSession();
  assert(Boolean(token0) && Boolean(cookie0), 'Auth: Admin login succeeds with token and httpOnly cookie');

  // Concurrent refresh requests (20 parallel requests with identical refresh cookie)
  console.log('  Testing 20 concurrent token refresh requests...');
  const concurrentRefreshes = await Promise.all(
    Array.from({ length: 20 }).map(() =>
      apiRequest('/auth/refresh', {
        method: 'POST',
        cookie: `refreshToken=${cookie0}`,
      })
    )
  );
  const allRefreshed = concurrentRefreshes.every(
    (r) => r.status === 200 && r.data?.success && r.data?.data?.accessToken
  );
  assert(allRefreshed, 'Auth: 20 rapid concurrent refresh requests all return 200 OK without race crash');

  // Concurrent login attempts (15 valid logins)
  console.log('  Testing 15 concurrent valid logins...');
  const concurrentLogins = await Promise.all(
    Array.from({ length: 15 }).map(() =>
      apiRequest('/auth/login', {
        method: 'POST',
        body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
      })
    )
  );
  const allLoginsOk = concurrentLogins.every((r) => r.status === 200 && r.data?.success);
  assert(allLoginsOk, 'Auth: 15 concurrent valid logins all succeed with 200 OK');

  // Concurrent invalid logins (15 attempts with bad password)
  console.log('  Testing 15 concurrent invalid logins...');
  const concurrentBadLogins = await Promise.all(
    Array.from({ length: 15 }).map(() =>
      apiRequest('/auth/login', {
        method: 'POST',
        body: { email: ADMIN_EMAIL, password: 'WrongPassword!123' },
      })
    )
  );
  const allBadLoginsRejected = concurrentBadLogins.every((r) => r.status === 400 && !r.data?.success);
  assert(allBadLoginsRejected, 'Auth: 15 concurrent invalid logins all cleanly rejected with 400');

  // Missing cookies
  const noCookie = await apiRequest('/auth/refresh', { method: 'POST' });
  assert(noCookie.status === 401 && !noCookie.data?.success, 'Auth: Refresh with missing cookie returns 401');

  const emptyCookie = await apiRequest('/auth/refresh', { method: 'POST', cookie: '' });
  assert(emptyCookie.status === 401 && !emptyCookie.data?.success, 'Auth: Refresh with empty cookie returns 401');

  const wrongCookieName = await apiRequest('/auth/refresh', { method: 'POST', cookie: 'otherToken=xyz' });
  assert(wrongCookieName.status === 401 && !wrongCookieName.data?.success, 'Auth: Refresh with unrelated cookie name returns 401');

  // Tampered tokens
  const tamperedCookie = await apiRequest('/auth/refresh', {
    method: 'POST',
    cookie: 'refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tampered.signature',
  });
  assert(tamperedCookie.status === 401, 'Auth: Refresh with tampered signature returns 401');

  // Expired refresh token
  const expiredRefreshToken = jwt.sign(
    { id: '6a498d2a11255470e23dab1b', jti: crypto.randomUUID() },
    JWT_REFRESH_SECRET,
    { expiresIn: '-30s' }
  );
  const expiredRefreshRes = await apiRequest('/auth/refresh', {
    method: 'POST',
    cookie: `refreshToken=${expiredRefreshToken}`,
  });
  assert(expiredRefreshRes.status === 401, 'Auth: Refresh with expired refreshToken returns 401');

  // Non-existent user in validly signed refresh token
  const ghostUserRefreshToken = jwt.sign(
    { id: '600000000000000000000000', jti: crypto.randomUUID() },
    JWT_REFRESH_SECRET,
    { expiresIn: '1h' }
  );
  const ghostRefreshRes = await apiRequest('/auth/refresh', {
    method: 'POST',
    cookie: `refreshToken=${ghostUserRefreshToken}`,
  });
  assert(ghostRefreshRes.status === 401, 'Auth: Refresh with non-existent user ID returns 401');

  // Protected endpoint with tampered access token
  const tamperedAccessToken = token0.slice(0, -8) + 'ABCDEFGH';
  const tamperedAccessRes = await apiRequest('/admin/messages', { token: tamperedAccessToken });
  assert(tamperedAccessRes.status === 401, 'Auth: Access protected endpoint with tampered access token returns 401');

  // Protected endpoint with expired access token
  const expiredAccessToken = jwt.sign({ id: '6a498d2a11255470e23dab1b' }, JWT_ACCESS_SECRET, { expiresIn: '-10s' });
  const expiredAccessRes = await apiRequest('/admin/messages', { token: expiredAccessToken });
  assert(expiredAccessRes.status === 401, 'Auth: Access protected endpoint with expired access token returns 401');

  // Protected endpoint with wrong secret
  const wrongSecretToken = jwt.sign({ id: '6a498d2a11255470e23dab1b' }, 'wrong_secret_for_test', { expiresIn: '15m' });
  const wrongSecretRes = await apiRequest('/admin/messages', { token: wrongSecretToken });
  assert(wrongSecretRes.status === 401, 'Auth: Access protected endpoint with wrong secret token returns 401');

  // Protected endpoint with alg none token
  const noneToken = jwt.sign({ id: '6a498d2a11255470e23dab1b' }, '', { algorithm: 'none' });
  const noneTokenRes = await apiRequest('/admin/messages', { token: noneToken });
  assert(noneTokenRes.status === 401, 'Auth: Access protected endpoint with alg:none token returns 401');

  // Malformed auth header values
  const badHeaders = ['Bearer', 'Bearer ', 'Token xyz', 'Basic 1234', 'null', ''];
  for (const hdr of badHeaders) {
    const res = await fetch(`${BASE_URL}/admin/messages`, { headers: { Authorization: hdr } });
    assert(res.status === 401, `Auth: Authorization header "${hdr}" returns 401`);
  }

  // Multi-step token rotation chaining & logout
  const rot1 = await apiRequest('/auth/refresh', { method: 'POST', cookie: `refreshToken=${cookie0}` });
  const rot1Token = rot1.data?.data?.accessToken;
  const rot1Cookie = parseCookie(rot1.setCookie, 'refreshToken');
  assert(Boolean(rot1Token) && Boolean(rot1Cookie), 'Auth: Token rotation step 1 produces new accessToken and cookie');

  const rot2 = await apiRequest('/auth/refresh', { method: 'POST', cookie: `refreshToken=${rot1Cookie}` });
  const rot2Token = rot2.data?.data?.accessToken;
  const rot2Cookie = parseCookie(rot2.setCookie, 'refreshToken');
  assert(Boolean(rot2Token) && Boolean(rot2Cookie), 'Auth: Token rotation step 2 produces second generation token and cookie');

  const authorizedOp = await apiRequest('/admin/messages', { token: rot2Token });
  assert(authorizedOp.status === 200, 'Auth: Generation 2 access token authorizes protected /admin/messages');

  const logoutRes = await apiRequest('/auth/logout', { method: 'POST', cookie: `refreshToken=${rot2Cookie}` });
  assert(logoutRes.status === 200 && logoutRes.data?.success, 'Auth: Logout returns 200 OK');
  assert(Boolean(logoutRes.setCookie), 'Auth: Logout issues Set-Cookie clearing refreshToken');
}

// ============================================================================
// 2. CONTACT SUBMISSION EXTREME PAYLOADS, UNICODE, EMOJIS, RTL & INJECTIONS
// ============================================================================
async function testContactAdversarial() {
  console.log('\n============================================================');
  console.log('2. CONTACT SUBMISSION EXTREME PAYLOADS, UNICODE & INJECTIONS');
  console.log('============================================================');

  const { accessToken } = await getAdminSession();
  const createdIds = [];

  async function sendContact(body) {
    const res = await apiRequest('/contact', { method: 'POST', body });
    if (res.data?.data?._id) createdIds.push(res.data.data._id);
    return res;
  }

  // 1. Extreme 10KB payload
  const payload10KB = 'A'.repeat(5000) + ' ' + 'نص تجريبي للتحمل '.repeat(300);
  const res10KB = await sendContact({
    name: '10KB Stress Tester',
    email: 'stress10kb@test.com',
    message: payload10KB,
  });
  assert(res10KB.status === 201 && res10KB.data?.success, 'Contact: 10KB mixed-language message successfully accepted (201)');

  // 2. Extreme 50KB payload
  const payload50KB = 'X'.repeat(50000);
  const res50KB = await sendContact({
    name: '50KB Stress Tester',
    email: 'stress50kb@test.com',
    message: payload50KB,
  });
  assert(res50KB.status === 201 && res50KB.data?.success, 'Contact: 50KB large message accepted and saved (201)');

  // 3. Multi-byte Unicode & Emojis
  const unicodeName = 'محمود أحمد 🧑‍💻🚀';
  const unicodeMessage = 'رسالة باللغة العربية مع إيموجي: 🛡️✨💡🔥⚡ ورموز يابانية: こんにちは ورموز صينية: 你好';
  const resUnicode = await sendContact({
    name: unicodeName,
    email: 'unicode@test.com',
    message: unicodeMessage,
  });
  assert(
    resUnicode.status === 201 &&
      resUnicode.data?.data?.name === unicodeName &&
      resUnicode.data?.data?.message === unicodeMessage,
    'Contact: Multi-byte Unicode, Arabic, Japanese, Chinese, and complex Emojis preserved verbatim'
  );

  // 4. RTL Bidirectional Override Characters
  const bidiName = 'User\u202Efdp.exe\u202D';
  const bidiMessage = '\u200Fهذا نص عربي مع اتجاه عكسي \u200E(LTR inside RTL)\u200F';
  const resBidi = await sendContact({
    name: bidiName,
    email: 'bidi@test.com',
    message: bidiMessage,
  });
  assert(
    resBidi.status === 201 && resBidi.data?.data?.name === bidiName,
    'Contact: RTL bidirectional override characters (\u202E, \u202D, \u200E, \u200F) stored safely'
  );

  // 5. Script / XSS Payloads
  const xssList = [
    '<script>alert("xss")</script>',
    '<img src="x" onerror="alert(1)">',
    '"><script>window.location="http://attacker.com"</script>',
    'javascript:alert(document.cookie)',
    '<svg onload=alert(1)>',
    '"><iframe src="javascript:alert(1)"></iframe>',
  ];
  for (let i = 0; i < xssList.length; i++) {
    const xss = xssList[i];
    const res = await sendContact({
      name: `XSS User ${i}`,
      email: `xss${i}@test.com`,
      message: xss,
    });
    assert(
      res.status === 201 && res.data?.data?.message === xss,
      `Contact: XSS payload ${i + 1} safely ingested as benign raw string without execution or corruption`
    );
  }

  // 6. NoSQL Operator Injections
  const nosqlTests = [
    { name: { $ne: null }, email: 'nosql@test.com', message: 'Hello' },
    { name: 'User', email: { $gt: '' }, message: 'Hello' },
    { name: 'User', email: 'nosql@test.com', message: { $where: 'sleep(100)' } },
    { name: 'User', email: 'nosql@test.com', message: { $regex: '.*' } },
    { name: ['array', 'as', 'name'], email: 'arr@test.com', message: 'Hello' },
    { name: 'User', email: 'arr@test.com', message: [1, 2, 3] },
  ];
  for (let i = 0; i < nosqlTests.length; i++) {
    const t = nosqlTests[i];
    const res = await sendContact(t);
    assert(res.status === 400 && !res.data?.success, `Contact: NoSQL operator payload ${i + 1} rejected with 400`);
  }

  // 7. Whitespace-Only & Boundary Form Validation
  const whitespaceTests = [
    { name: '   ', email: 'valid@test.com', message: 'Valid message' },
    { name: 'Valid Name', email: 'valid@test.com', message: '   \n\t  ' },
    { name: '\t\n', email: 'valid@test.com', message: 'Valid message' },
  ];
  for (let i = 0; i < whitespaceTests.length; i++) {
    const res = await sendContact(whitespaceTests[i]);
    assert(res.status === 400, `Contact: Whitespace-only field test ${i + 1} rejected with 400`);
  }

  // Clean up all test messages
  console.log(`  Cleaning up ${createdIds.length} contact messages via admin DELETE...`);
  for (const id of createdIds) {
    await apiRequest(`/admin/messages/${id}`, { method: 'DELETE', token: accessToken });
  }
}

// ============================================================================
// 3. CONTENT RESILIENCE, EMPTY ARRAYS, NULL FIELDS & OBJECTID BOUNDARIES
// ============================================================================
async function testContentResilience() {
  console.log('\n============================================================');
  console.log('3. CONTENT RESILIENCE, EMPTY ARRAYS, NULL FIELDS & OBJECTIDS');
  console.log('============================================================');

  const { accessToken } = await getAdminSession();
  const createdProjectIds = [];

  // 1. Create project with empty array `stack: []`
  const emptyStackRes = await apiRequest('/admin/projects', {
    method: 'POST',
    token: accessToken,
    body: {
      title: { en: 'Empty Stack Project', ar: 'مشروع مصفوفة فارغة' },
      description: { en: 'Testing empty tech stack array', ar: 'اختبار مصفوفة تقنيات فارغة' },
      category: 'backend',
      stack: [],
    },
  });
  if (emptyStackRes.data?.data?._id) createdProjectIds.push(emptyStackRes.data.data._id);
  assert(
    emptyStackRes.status === 201 &&
      Array.isArray(emptyStackRes.data?.data?.stack) &&
      emptyStackRes.data.data.stack.length === 0,
    'Content: Project created with empty tech stack array [] (201)'
  );

  // 2. Create project with omitted optional fields (image empty string, links default)
  const minimalRes = await apiRequest('/admin/projects', {
    method: 'POST',
    token: accessToken,
    body: {
      title: { en: 'Minimal Project', ar: 'مشروع مصغر' },
      description: { en: 'Minimal fields description', ar: 'وصف الحقول المصغرة' },
      category: 'fullstack',
    },
  });
  if (minimalRes.data?.data?._id) createdProjectIds.push(minimalRes.data.data._id);
  assert(
    minimalRes.status === 201 && minimalRes.data?.data?.image === '',
    'Content: Project created with omitted optional fields (image defaults to empty string)'
  );

  // 3. Non-existent 24-Hex ObjectIDs return 404 across all content endpoints
  const nonExistentHexId = '670000000000000000000999';
  const endpoints = ['projects', 'skills', 'experience', 'certificates', 'blog'];
  for (const ep of endpoints) {
    const resHex = await apiRequest(`/${ep}/${nonExistentHexId}`);
    assert(resHex.status === 404 && !resHex.data?.success, `Content: GET /${ep}/:id with non-existent 24-hex ID returns 404`);

    const resBadHex = await apiRequest(`/${ep}/not-a-valid-hex-id-12345`);
    assert(resBadHex.status === 400 && !resBadHex.data?.success, `Content: GET /${ep}/:id with malformed ID returns 400`);
  }

  // 4. Protected admin operations with non-existent ID return 404
  const put404 = await apiRequest(`/admin/projects/${nonExistentHexId}`, {
    method: 'PUT',
    token: accessToken,
    body: { title: { en: 'Updated', ar: 'محدث' } },
  });
  assert(put404.status === 404, 'Content: Protected PUT /admin/projects/:id with non-existent ID returns 404');

  const del404 = await apiRequest(`/admin/projects/${nonExistentHexId}`, {
    method: 'DELETE',
    token: accessToken,
  });
  assert(del404.status === 404, 'Content: Protected DELETE /admin/projects/:id with non-existent ID returns 404');

  // 5. Query Filters
  const catFilterRes = await apiRequest('/projects?category=backend');
  assert(catFilterRes.status === 200 && Array.isArray(catFilterRes.data?.data), 'Content: GET /projects?category=backend returns 200 array');

  const ghostCatRes = await apiRequest('/projects?category=totally_non_existent_category_12345');
  assert(
    ghostCatRes.status === 200 && Array.isArray(ghostCatRes.data?.data) && ghostCatRes.data.data.length === 0,
    'Content: GET /projects?category=nonexistent returns 200 empty array []'
  );

  // Query parameter with object operator
  const queryObjRes = await fetch(`${BASE_URL}/projects?category[$ne]=none`);
  assert(queryObjRes.status === 200, 'Content: Query filter with object operator ?category[$ne]=none handles safely (200)');

  // Clean up created projects
  console.log(`  Cleaning up ${createdProjectIds.length} test projects via admin DELETE...`);
  for (const id of createdProjectIds) {
    await apiRequest(`/admin/projects/${id}`, { method: 'DELETE', token: accessToken });
  }
}

// ============================================================================
// 4. DATE FORMATTER EXTREME INPUTS, SYMBOLS, CIRCULAR STRUCTURES & LOCALES
// ============================================================================
async function testDateFormattersAdversarial() {
  console.log('\n============================================================');
  console.log('4. DATE FORMATTER EXTREME INPUTS, SYMBOLS & CIRCULAR STRUCTURES');
  console.log('============================================================');

  const dateFileContent = fs.readFileSync(path.resolve('frontend/src/utils/date.js'), 'utf-8');

  // Build clean runtime harness that wraps date.js functions
  const harnessCode = dateFileContent
    .replace("import i18n from '../i18n/config.js';", "const i18n = { language: 'en' };")
    .replace(/export function /g, 'function ')
    .replace(/export default [^;]+;/, '') +
    `\nreturn { formatDate, formatMonthYear, formatFullDate, formatDateTime };\n`;

  const { formatDate, formatMonthYear, formatFullDate, formatDateTime } = new Function(harnessCode)();

  // 1. Symbol inputs (dateInput, options, langOrI18n)
  let threwSymbol = false;
  try {
    const r1 = formatDate(Symbol('date-symbol'));
    const r2 = formatMonthYear(Symbol('month-year-symbol'));
    const r3 = formatFullDate(Symbol('full-date-symbol'));
    const r4 = formatDateTime(Symbol('date-time-symbol'));
    const r5 = formatDate(new Date(), {}, Symbol('lang-symbol'));
    const r6 = formatDate(new Date(), {}, { language: Symbol('lang-prop') });
    assert(r1 === '' && r2 === '' && r3 === '' && r4 === '', 'Date: All formatters return empty string on Symbol dateInput');
    assert(typeof r5 === 'string' && typeof r6 === 'string', 'Date: Symbol passed as lang does not throw');
  } catch (err) {
    threwSymbol = true;
    console.error('Symbol error:', err);
  }
  assert(!threwSymbol, 'Date: Symbol inputs handled without throwing unhandled exceptions');

  // 2. Circular structure inputs
  const circularObj = {};
  circularObj.self = circularObj;
  let threwCircular = false;
  try {
    const r1 = formatDate(circularObj);
    const r2 = formatMonthYear(circularObj);
    const r3 = formatFullDate(circularObj);
    const r4 = formatDateTime(circularObj);
    const r5 = formatDate(new Date(), {}, circularObj);
    assert(r1 === '' && r2 === '' && r3 === '' && r4 === '', 'Date: All formatters return empty string on circular dateInput');
    assert(typeof r5 === 'string', 'Date: Circular structure passed as langOrI18n handles safely');
  } catch (err) {
    threwCircular = true;
    console.error('Circular error:', err);
  }
  assert(!threwCircular, 'Date: Circular structure inputs handled without throwing');

  // 3. Corrupted / invalid dates & extreme numbers
  const corruptedInputs = [
    null,
    undefined,
    '',
    '    ',
    'not-a-date',
    '2026-99-99',
    '2024-02-31T99:99:99Z',
    '<script>alert(1)</script>',
    NaN,
    Infinity,
    -Infinity,
    1e50,
    -1e50,
    {},
    [],
    false,
    () => {},
  ];
  for (const input of corruptedInputs) {
    let r1, r2, r3, r4;
    let threw = false;
    try {
      r1 = formatDate(input);
      r2 = formatMonthYear(input);
      r3 = formatFullDate(input);
      r4 = formatDateTime(input);
    } catch {
      threw = true;
    }
    const label = typeof input === 'symbol' ? 'Symbol' : typeof input === 'function' ? 'function' : JSON.stringify(input);
    assert(!threw, `Date: Corrupted input (${label}) executed safely without throwing exception`);
    assert(
      r1 === '' && r2 === '' && r3 === '' && r4 === '',
      `Date: Corrupted input (${label}) returns empty string across all 4 formatters`
    );
  }

  // 3b. Non-standard primitives (true, arrays) - verify non-crashing safe execution
  let threwQuirks = false;
  try {
    const resTrue = formatDate(true);
    const resArr = formatDate([1, 2, 3]);
    assert(typeof resTrue === 'string', 'Date: Boolean true handled safely without crashing (returns coerced string)');
    assert(typeof resArr === 'string', 'Date: Array [1,2,3] handled safely without crashing (returns coerced string)');
  } catch {
    threwQuirks = true;
  }
  assert(!threwQuirks, 'Date: Non-standard inputs (boolean, array) execute without throwing exceptions');

  // 4. Missing / undefined / empty locales
  const validSampleDate = new Date('2024-06-15T12:00:00Z');
  const missingLocaleCases = [
    null,
    undefined,
    '',
    {},
    { language: null },
    { language: undefined },
    { language: '' },
    { language: 'unknown-lang-xyz' },
  ];
  for (const loc of missingLocaleCases) {
    const formatted = formatDate(validSampleDate, { year: 'numeric' }, loc);
    assert(
      formatted.includes('2024'),
      `Date: Missing/malformed locale (${JSON.stringify(loc)}) gracefully defaults to English (en-US)`
    );
  }

  // 5. Invalid Intl options
  const invalidOptions = [
    { timeZone: 'Invalid/NonExistent_Zone' },
    { calendar: 'totally_fake_calendar' },
    { numberingSystem: 'unknown_num_sys' },
  ];
  for (const opt of invalidOptions) {
    const res = formatDate(validSampleDate, opt, 'en');
    assert(res === '', `Date: Invalid Intl options ${JSON.stringify(opt)} caught safely by try/catch, returning empty string`);
  }

  // 6. Valid English vs Arabic Localization Verification
  const testIso = '2024-03-15T14:30:00.000Z';
  const enMY = formatMonthYear(testIso, 'en');
  const arMY = formatMonthYear(testIso, 'ar');
  assert(enMY === 'Mar 2024', `Date: formatMonthYear English returns "Mar 2024" (got "${enMY}")`);
  assert(arMY === 'مارس ٢٠٢٤', `Date: formatMonthYear Arabic returns "مارس ٢٠٢٤" (got "${arMY}")`);

  const enFull = formatFullDate(testIso, 'en');
  const arFull = formatFullDate(testIso, 'ar');
  assert(enFull === 'Mar 15, 2024', `Date: formatFullDate English returns "Mar 15, 2024" (got "${enFull}")`);
  assert(arFull === '١٥ مارس ٢٠٢٤', `Date: formatFullDate Arabic returns "١٥ مارس ٢٠٢٤" (got "${arFull}")`);

  const enDT = formatDateTime(testIso, 'en');
  const arDT = formatDateTime(testIso, 'ar');
  assert(enDT.includes('2024') && enDT.includes('Mar'), `Date: formatDateTime English localized properly ("${enDT}")`);
  assert(/[\u0600-\u06FF]/.test(arDT) || /[\u0660-\u0669]/.test(arDT), `Date: formatDateTime Arabic localized properly ("${arDT}")`);
}

// ============================================================================
// MAIN RUNNER
// ============================================================================
async function runAll() {
  console.log('====================================================================');
  console.log(' EMPIRICAL ADVERSARIAL STRESS TEST HARNESS (CHALLENGER 1 - IT 2)   ');
  console.log('====================================================================');
  console.log(`Base URL:  ${BASE_URL}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);

  const startTime = Date.now();
  try {
    await testAuthSecurity();
    await testContactAdversarial();
    await testContentResilience();
    await testDateFormattersAdversarial();
  } catch (err) {
    console.error('\nFATAL EXCEPTION DURING ADVERSARIAL TEST RUN:', err);
    process.exit(1);
  }

  const duration = Date.now() - startTime;
  console.log('\n====================================================================');
  console.log('               ADVERSARIAL EMPIRICAL HARNESS SUMMARY                ');
  console.log('====================================================================');
  console.log(`Total Assertions Run: ${totalTests}`);
  console.log(`✓ Passed:             ${passedTests}`);
  console.log(`✗ Failed:             ${failedTests}`);
  console.log(`Duration:             ${duration}ms`);
  console.log('====================================================================');

  if (failedTests > 0) {
    console.error(`\nFAILURES (${failedTests}):`);
    for (const f of failures) {
      console.error(`- ${f.testName} ${f.details ? `(${f.details})` : ''}`);
    }
    process.exit(1);
  } else {
    console.log('\n🎯 ALL ADVERSARIAL EMPIRICAL TESTS PASSED WITH 100% SUCCESS!');
    process.exit(0);
  }
}

runAll();
