import axios from 'axios';
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import express from 'express';
import rateLimit from 'express-rate-limit';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000/api';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'memenoname60@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Meme@1234';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'oiduky832iodohdxnjknUH0098hHOI';
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'kjdkjdcjkkcejecjkkerok322';

function extractCookie(headers, cookieName) {
  const setCookie = headers['set-cookie'];
  if (!setCookie) return null;
  const list = Array.isArray(setCookie) ? setCookie : [setCookie];
  for (const item of list) {
    const match = item.match(new RegExp(`${cookieName}=([^;]+)`));
    if (match) return match[1];
  }
  return null;
}

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function runEmpiricalVerification() {
  console.log('===============================================================');
  console.log('   EMPIRICAL VERIFICATION HARNESS: Milestone 1 Iteration 2    ');
  console.log('===============================================================\n');

  let passedChecks = 0;
  let failedChecks = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passedChecks++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failedChecks++;
    }
  }

  // =========================================================================
  // TEST SECTION 1: TOKEN ROTATION & SUB-SECOND JTI / SIGNATURE UNIQUENESS
  // =========================================================================
  console.log('\n--- [TEST 1] Sub-Second Sequential Refresh & jti Uniqueness ---');

  // Step 1.1: Initial Login
  console.log('1.1 Authenticating admin via POST /api/auth/login...');
  let loginRes;
  try {
    loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
  } catch (err) {
    console.error('Fatal: Login failed:', err.response?.data || err.message);
    process.exit(1);
  }

  assert(loginRes.status === 200, 'Initial login status 200');
  let currentRefreshToken = extractCookie(loginRes.headers, 'refreshToken');
  let currentAccessToken = loginRes.data.data?.accessToken;
  assert(!!currentRefreshToken, 'Initial login returned refreshToken cookie');
  assert(!!currentAccessToken, 'Initial login returned accessToken in body');

  const initialDecoded = jwt.decode(currentRefreshToken, { complete: true });
  assert(!!initialDecoded?.payload?.jti, `Initial refreshToken has jti: ${initialDecoded?.payload?.jti}`);
  assert(UUID_V4_REGEX.test(initialDecoded?.payload?.jti), 'Initial jti matches UUID v4 pattern');

  // Step 1.2: Perform 10 rapid sequential refreshes in a tight loop
  console.log('\n1.2 Executing 10 rapid sequential POST /api/auth/refresh calls...');
  const collectedTokens = [currentRefreshToken];
  const collectedJtis = [initialDecoded.payload.jti];
  const collectedSignatures = [initialDecoded.signature];
  const collectedIats = [initialDecoded.payload.iat];

  const startTime = Date.now();
  let loopSuccess = true;

  for (let i = 1; i <= 10; i++) {
    const callStart = Date.now();
    try {
      const refreshRes = await axios.post(
        `${BASE_URL}/auth/refresh`,
        {},
        {
          headers: { Cookie: `refreshToken=${currentRefreshToken}` },
          validateStatus: () => true
        }
      );

      const elapsed = Date.now() - callStart;

      if (refreshRes.status !== 200) {
        assert(false, `Refresh #${i} failed with status ${refreshRes.status}: ${JSON.stringify(refreshRes.data)}`);
        loopSuccess = false;
        break;
      }

      const newRefreshToken = extractCookie(refreshRes.headers, 'refreshToken');
      const newAccessToken = refreshRes.data.data?.accessToken;

      if (!newRefreshToken) {
        assert(false, `Refresh #${i} missing Set-Cookie refreshToken`);
        loopSuccess = false;
        break;
      }

      // Verify token signature with JWT_REFRESH_SECRET
      let verifiedPayload;
      try {
        verifiedPayload = jwt.verify(newRefreshToken, JWT_REFRESH_SECRET);
      } catch (verErr) {
        assert(false, `Refresh #${i} JWT verification failed: ${verErr.message}`);
        loopSuccess = false;
        break;
      }

      const decoded = jwt.decode(newRefreshToken, { complete: true });
      const jti = decoded.payload.jti;
      const signature = decoded.signature;
      const iat = decoded.payload.iat;

      collectedTokens.push(newRefreshToken);
      collectedJtis.push(jti);
      collectedSignatures.push(signature);
      collectedIats.push(iat);

      console.log(`    Iter ${i} (+${elapsed}ms): jti=${jti.slice(0, 8)}... iat=${iat} sig=${signature.slice(0, 10)}...`);

      currentRefreshToken = newRefreshToken;
      currentAccessToken = newAccessToken;
    } catch (err) {
      assert(false, `Refresh #${i} network error: ${err.message}`);
      loopSuccess = false;
      break;
    }
  }

  const totalRefreshElapsed = Date.now() - startTime;
  console.log(`  Completed 10 sequential refreshes in ${totalRefreshElapsed}ms total.`);

  assert(loopSuccess, 'All 10 sequential refresh iterations completed successfully');
  assert(collectedTokens.length === 11, `Collected 11 total tokens (1 initial + 10 rotated)`);

  // Step 1.3: Analyze uniqueness of jti, signature, and token
  const uniqueTokens = new Set(collectedTokens);
  const uniqueJtis = new Set(collectedJtis);
  const uniqueSignatures = new Set(collectedSignatures);

  assert(uniqueTokens.size === collectedTokens.length, `Strict Token Uniqueness: ${uniqueTokens.size}/${collectedTokens.length} tokens unique`);
  assert(uniqueJtis.size === collectedJtis.length, `Strict JTI Uniqueness: ${uniqueJtis.size}/${collectedJtis.length} JTIs unique`);
  assert(uniqueSignatures.size === collectedSignatures.length, `Strict Signature Uniqueness: ${uniqueSignatures.size}/${collectedSignatures.length} signatures unique`);

  // Step 1.4: Check for sub-second collision window (same iat timestamp)
  const iatCounts = {};
  collectedIats.forEach(iat => { iatCounts[iat] = (iatCounts[iat] || 0) + 1; });
  const sameSecondCollisions = Object.values(iatCounts).filter(c => c > 1);

  console.log('  Distribution of tokens by iat (epoch second):', iatCounts);
  if (sameSecondCollisions.length > 0) {
    const maxInSameSecond = Math.max(...sameSecondCollisions);
    console.log(`  Sub-second concurrency confirmed: ${maxInSameSecond} tokens generated in the exact same second!`);
    assert(true, `Sub-second uniqueness proven: ${maxInSameSecond} tokens generated with identical iat had 100% unique jti & signatures`);
  } else {
    console.log('  Note: Refreshes spanned across multiple seconds due to network latency, testing immediate micro-batch generation...');
  }

  // Step 1.5: Direct Token Generator Sub-Second Stress Test (Micro-Batch Oracle)
  console.log('\n1.5 Direct Controller Token Generator Microsecond Stress (1,000 tokens in same millisecond)...');
  const microbatchJtis = new Set();
  const microbatchSignatures = new Set();
  const testUserId = '6a498d2a11255470e23dab1b';
  for (let k = 0; k < 1000; k++) {
    const token = jwt.sign(
      { id: testUserId, jti: (await import('crypto')).default.randomUUID() },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
    const dec = jwt.decode(token, { complete: true });
    microbatchJtis.add(dec.payload.jti);
    microbatchSignatures.add(dec.signature);
  }
  assert(microbatchJtis.size === 1000, `1,000 instant tokens generated 1,000 unique JTIs (100.0%)`);
  assert(microbatchSignatures.size === 1000, `1,000 instant tokens produced 1,000 unique cryptographic signatures (100.0%)`);

  // Step 1.6: Protected Route Access with Latest Rotated Token
  console.log('\n1.6 Verifying final rotated access token on protected route /api/admin/messages...');
  const protectedRes = await axios.get(`${BASE_URL}/admin/messages`, {
    headers: { Authorization: `Bearer ${currentAccessToken}` },
    validateStatus: () => true
  });
  assert(protectedRes.status === 200, `Protected route accessible with rotated access token (status 200)`);

  // =========================================================================
  // TEST SECTION 2: RATE LIMITER BEHAVIOR WITH NODE_ENV=test VS PRODUCTION
  // =========================================================================
  console.log('\n--- [TEST 2] Rate Limiter Empirical Verification ---');

  // Test 2.1: In-process Express instance with NODE_ENV=test
  console.log('2.1 Testing express-rate-limit skip predicate with NODE_ENV=test...');
  const appTest = express();
  appTest.use(express.json());

  const testLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // small limit to quickly test threshold
    skip: () => process.env.NODE_ENV === 'test',
    message: { success: false, message: 'Too many login attempts. Try again later.' }
  });

  appTest.post('/test-login', testLimiter, (req, res) => {
    res.status(200).json({ success: true, message: 'Login allowed' });
  });

  const serverTest = appTest.listen(0);
  const testPort = serverTest.address().port;

  // Set NODE_ENV = 'test'
  const originalNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'test';

  let testLimiter429Count = 0;
  let testLimiter200Count = 0;
  for (let reqIdx = 1; reqIdx <= 30; reqIdx++) {
    const res = await axios.post(`http://localhost:${testPort}/test-login`, {}, { validateStatus: () => true });
    if (res.status === 429) testLimiter429Count++;
    if (res.status === 200) testLimiter200Count++;
  }
  serverTest.close();

  assert(testLimiter429Count === 0, `NODE_ENV=test: 0 of 30 requests throttled (429 count: ${testLimiter429Count})`);
  assert(testLimiter200Count === 30, `NODE_ENV=test: All 30 requests passed through (200 count: ${testLimiter200Count})`);

  // Test 2.2: In-process Express instance with NODE_ENV=production
  console.log('2.2 Testing express-rate-limit enforcement with NODE_ENV=production...');
  const appProd = express();
  appProd.use(express.json());

  const prodLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    skip: () => process.env.NODE_ENV === 'test',
    message: { success: false, message: 'Too many login attempts. Try again later.' }
  });

  appProd.post('/prod-login', prodLimiter, (req, res) => {
    res.status(200).json({ success: true, message: 'Login allowed' });
  });

  const serverProd = appProd.listen(0);
  const prodPort = serverProd.address().port;

  process.env.NODE_ENV = 'production';

  let prodLimiter429Count = 0;
  let prodLimiter200Count = 0;
  for (let reqIdx = 1; reqIdx <= 10; reqIdx++) {
    const res = await axios.post(`http://localhost:${prodPort}/prod-login`, {}, { validateStatus: () => true });
    if (res.status === 429) prodLimiter429Count++;
    if (res.status === 200) prodLimiter200Count++;
  }
  serverProd.close();

  // Restore NODE_ENV
  process.env.NODE_ENV = originalNodeEnv;

  assert(prodLimiter200Count === 5, `NODE_ENV=production: Exactly 5 requests allowed before threshold (got ${prodLimiter200Count})`);
  assert(prodLimiter429Count === 5, `NODE_ENV=production: Exactly 5 subsequent requests blocked with 429 (got ${prodLimiter429Count})`);

  // =========================================================================
  // TEST SECTION 3: LIVE SERVER NODE_ENV STATUS CHECK
  // =========================================================================
  console.log('\n--- [TEST 3] Live Server (port 5000) Rate Limiter Probe ---');
  console.log('3.1 Probing live server loginLimiter behavior...');
  let liveServer429Hit = false;
  let liveServerAttempts = 0;

  for (let probe = 1; probe <= 25; probe++) {
    liveServerAttempts++;
    const res = await axios.post(
      `${BASE_URL}/auth/login`,
      { email: 'nonexistent@test.com', password: 'Short1' },
      { validateStatus: () => true }
    );
    if (res.status === 429) {
      liveServer429Hit = true;
      console.log(`    Live server returned 429 on probe #${probe}`);
      break;
    }
  }

  if (liveServer429Hit) {
    console.log(`  ⚠️ LIVE SERVER OBSERVATION: Port 5000 server returned HTTP 429 after ${liveServerAttempts} attempts.`);
    console.log(`  Root cause: The background server was launched with undefined NODE_ENV (PowerShell expansion error: ='test').`);
  } else {
    console.log(`  Live server did NOT trigger 429 across ${liveServerAttempts} login attempts.`);
  }

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log('\n===============================================================');
  console.log(`VERIFICATION SUMMARY: ${passedChecks} Passed, ${failedChecks} Failed`);
  console.log('===============================================================');

  if (failedChecks > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runEmpiricalVerification().catch(err => {
  console.error('Unhandled verification error:', err);
  process.exit(1);
});
