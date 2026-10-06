import axios from 'axios';
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '..');

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'memenoname60@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Meme@1234';
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'kjdkjdcjkkcejecjkkerok322';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'oiduky832iodohdxnjknUH0098hHOI';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/portfolio';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m'
};

let totalPassed = 0;
let totalFailed = 0;
const failures = [];

function recordPass(testName) {
  totalPassed++;
  console.log(`${colors.green}  ✅ PASS: ${testName}${colors.reset}`);
}

function recordFail(testName, error) {
  totalFailed++;
  failures.push({ testName, error });
  console.log(`${colors.red}  ❌ FAIL: ${testName} -> ${error}${colors.reset}`);
}

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

function runSeedProcess() {
  return new Promise((resolve) => {
    const proc = spawn('node', ['src/seed.js'], {
      cwd: backendRoot,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (d) => { stdout += d.toString(); });
    proc.stderr.on('data', (d) => { stderr += d.toString(); });

    proc.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });
  });
}

async function runChallengerSuite() {
  console.log(`\n${colors.magenta}${colors.bold}======================================================${colors.reset}`);
  console.log(`${colors.magenta}${colors.bold}   CHALLENGER 2: EMPIRICAL ADVERSARIAL VERIFICATION   ${colors.reset}`);
  console.log(`${colors.magenta}${colors.bold}======================================================${colors.reset}\n`);

  // Step 0: Initial Login to obtain valid tokens
  console.log(`${colors.cyan}[0] Authenticating Admin for Challenge Baseline...${colors.reset}`);
  let initialLoginRes;
  try {
    initialLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
  } catch (err) {
    console.error(`${colors.red}Failed initial login: ${err.message}${colors.reset}`);
    process.exit(1);
  }

  let currentAccessToken = initialLoginRes.data.data.accessToken;
  let currentRefreshToken = extractCookie(initialLoginRes.headers, 'refreshToken');

  if (!currentAccessToken || !currentRefreshToken) {
    console.error(`${colors.red}Missing initial token or cookie!${colors.reset}`);
    process.exit(1);
  }
  console.log(`${colors.green}  Authenticated successfully. Starting challenges...${colors.reset}\n`);

  // =========================================================================
  // TASK 1: TOKEN ROTATION MECHANICS
  // =========================================================================
  console.log(`${colors.yellow}--- TASK 1: Token Rotation Mechanics Verification ---${colors.reset}`);

  // 1.1 Sequential Refresh 1
  try {
    const res1 = await axios.post(
      `${BASE_URL}/auth/refresh`,
      {},
      { headers: { Cookie: `refreshToken=${currentRefreshToken}` } }
    );
    const newAccess1 = res1.data.data?.accessToken;
    const newRefresh1 = extractCookie(res1.headers, 'refreshToken');

    if (res1.status !== 200) throw new Error(`Expected 200, got ${res1.status}`);
    if (!newAccess1) throw new Error('Missing accessToken in response');
    if (!newRefresh1) throw new Error('Missing rotated refreshToken cookie');
    if (newRefresh1 === currentRefreshToken) throw new Error('Refresh token was not rotated');

    // Test access token works on protected route
    const testRes1 = await axios.get(`${BASE_URL}/admin/messages`, {
      headers: { Authorization: `Bearer ${newAccess1}` }
    });
    if (testRes1.status !== 200) throw new Error(`Protected route returned ${testRes1.status}`);

    currentAccessToken = newAccess1;
    currentRefreshToken = newRefresh1;
    recordPass('Token Rotation: Sequential Refresh #1 generates new tokens and allows protected access');
  } catch (err) {
    recordFail('Token Rotation: Sequential Refresh #1', err.message);
  }

  // 1.2 Sequential Refresh 2
  try {
    const res2 = await axios.post(
      `${BASE_URL}/auth/refresh`,
      {},
      { headers: { Cookie: `refreshToken=${currentRefreshToken}` } }
    );
    const newAccess2 = res2.data.data?.accessToken;
    const newRefresh2 = extractCookie(res2.headers, 'refreshToken');

    if (res2.status !== 200) throw new Error(`Expected 200, got ${res2.status}`);
    if (!newAccess2) throw new Error('Missing accessToken in response');
    if (!newRefresh2) throw new Error('Missing rotated refreshToken cookie');

    const testRes2 = await axios.get(`${BASE_URL}/admin/messages`, {
      headers: { Authorization: `Bearer ${newAccess2}` }
    });
    if (testRes2.status !== 200) throw new Error(`Protected route returned ${testRes2.status}`);

    currentAccessToken = newAccess2;
    currentRefreshToken = newRefresh2;
    recordPass('Token Rotation: Sequential Refresh #2 generates new tokens and allows protected access');
  } catch (err) {
    recordFail('Token Rotation: Sequential Refresh #2', err.message);
  }

  // 1.3 Sequential Refresh 3
  try {
    const res3 = await axios.post(
      `${BASE_URL}/auth/refresh`,
      {},
      { headers: { Cookie: `refreshToken=${currentRefreshToken}` } }
    );
    const newAccess3 = res3.data.data?.accessToken;
    const newRefresh3 = extractCookie(res3.headers, 'refreshToken');

    if (res3.status !== 200) throw new Error(`Expected 200, got ${res3.status}`);
    if (!newAccess3) throw new Error('Missing accessToken in response');
    if (!newRefresh3) throw new Error('Missing rotated refreshToken cookie');

    const testRes3 = await axios.get(`${BASE_URL}/admin/messages`, {
      headers: { Authorization: `Bearer ${newAccess3}` }
    });
    if (testRes3.status !== 200) throw new Error(`Protected route returned ${testRes3.status}`);

    currentAccessToken = newAccess3;
    currentRefreshToken = newRefresh3;
    recordPass('Token Rotation: Sequential Refresh #3 generates new tokens and allows protected access');
  } catch (err) {
    recordFail('Token Rotation: Sequential Refresh #3', err.message);
  }

  // 1.4 Refresh without Cookie header
  try {
    const res = await axios.post(`${BASE_URL}/auth/refresh`, {}, { validateStatus: () => true });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
    if (res.data.success !== false || res.data.message !== 'No refresh token.') {
      throw new Error(`Unexpected body: ${JSON.stringify(res.data)}`);
    }
    recordPass('Token Rotation: Missing cookie returns 401 "No refresh token."');
  } catch (err) {
    recordFail('Token Rotation: Missing cookie', err.message);
  }

  // 1.5 Refresh with empty cookie
  try {
    const res = await axios.post(
      `${BASE_URL}/auth/refresh`,
      {},
      { headers: { Cookie: 'refreshToken=' }, validateStatus: () => true }
    );
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
    recordPass('Token Rotation: Empty cookie returns 401');
  } catch (err) {
    recordFail('Token Rotation: Empty cookie', err.message);
  }

  // 1.6 Refresh with malformed JWT string
  try {
    const res = await axios.post(
      `${BASE_URL}/auth/refresh`,
      {},
      { headers: { Cookie: 'refreshToken=definitely-not-a-valid-jwt' }, validateStatus: () => true }
    );
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
    if (res.data.success !== false || res.data.message !== 'Invalid or expired refresh token.') {
      throw new Error(`Unexpected body: ${JSON.stringify(res.data)}`);
    }
    recordPass('Token Rotation: Malformed token string returns 401');
  } catch (err) {
    recordFail('Token Rotation: Malformed token string', err.message);
  }

  // 1.7 Refresh with tampered signature
  try {
    const parts = currentRefreshToken.split('.');
    const tampered = `${parts[0]}.${parts[1]}.tamperedSignature123`;
    const res = await axios.post(
      `${BASE_URL}/auth/refresh`,
      {},
      { headers: { Cookie: `refreshToken=${tampered}` }, validateStatus: () => true }
    );
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
    recordPass('Token Rotation: Tampered signature returns 401');
  } catch (err) {
    recordFail('Token Rotation: Tampered signature', err.message);
  }

  // 1.8 Refresh with token signed by bogus secret
  try {
    const fakeToken = jwt.sign({ id: '507f1f77bcf86cd799439011' }, 'completely_bogus_secret_xyz', { expiresIn: '7d' });
    const res = await axios.post(
      `${BASE_URL}/auth/refresh`,
      {},
      { headers: { Cookie: `refreshToken=${fakeToken}` }, validateStatus: () => true }
    );
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
    recordPass('Token Rotation: Wrong signing secret returns 401');
  } catch (err) {
    recordFail('Token Rotation: Wrong signing secret', err.message);
  }

  // 1.9 Refresh with Access Token (type confusion)
  try {
    const res = await axios.post(
      `${BASE_URL}/auth/refresh`,
      {},
      { headers: { Cookie: `refreshToken=${currentAccessToken}` }, validateStatus: () => true }
    );
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
    recordPass('Token Rotation: Access token used as refresh token returns 401');
  } catch (err) {
    recordFail('Token Rotation: Access token type confusion', err.message);
  }

  // 1.10 Refresh with non-existent user ID
  try {
    const nonExistentUserToken = jwt.sign({ id: '507f1f77bcf86cd799439011' }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
    const res = await axios.post(
      `${BASE_URL}/auth/refresh`,
      {},
      { headers: { Cookie: `refreshToken=${nonExistentUserToken}` }, validateStatus: () => true }
    );
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
    if (res.data.success !== false || res.data.message !== 'Invalid refresh token.') {
      throw new Error(`Unexpected body: ${JSON.stringify(res.data)}`);
    }
    recordPass('Token Rotation: Non-existent user ID returns 401 "Invalid refresh token."');
  } catch (err) {
    recordFail('Token Rotation: Non-existent user ID', err.message);
  }

  // 1.11 Logout & cookie clearance
  try {
    const logoutRes = await axios.post(
      `${BASE_URL}/auth/logout`,
      {},
      { headers: { Cookie: `refreshToken=${currentRefreshToken}` } }
    );
    if (logoutRes.status !== 200) throw new Error(`Expected 200, got ${logoutRes.status}`);
    const setCookie = logoutRes.headers['set-cookie'];
    if (!setCookie) throw new Error('Expected clearCookie Set-Cookie header');
    const cookieStr = Array.isArray(setCookie) ? setCookie.join(';') : setCookie;
    if (!cookieStr.includes('refreshToken=;')) throw new Error(`Cookie was not cleared: ${cookieStr}`);

    // Re-login to have fresh active tokens for remaining tests
    const reLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    currentAccessToken = reLogin.data.data.accessToken;
    currentRefreshToken = extractCookie(reLogin.headers, 'refreshToken');

    recordPass('Token Rotation: Logout successfully clears httpOnly cookie');
  } catch (err) {
    recordFail('Token Rotation: Logout & cookie clearance', err.message);
  }

  // =========================================================================
  // TASK 2: ROUTE ALIAS PARITY VERIFICATION
  // =========================================================================
  console.log(`\n${colors.yellow}--- TASK 2: Route Alias Parity Verification ---${colors.reset}`);

  // Setup: Create 2 messages for parity testing
  let msgDirectId = null;
  let msgAliasId = null;
  try {
    const c1 = await axios.post(`${BASE_URL}/contact`, {
      name: 'Direct Parity Tester',
      email: 'direct.parity@example.com',
      message: 'Direct parity test message content.'
    });
    msgDirectId = c1.data.data?._id;

    const c2 = await axios.post(`${BASE_URL}/contact`, {
      name: 'Alias Parity Tester',
      email: 'alias.parity@example.com',
      message: 'Alias parity test message content.'
    });
    msgAliasId = c2.data.data?._id;

    if (!msgDirectId || !msgAliasId) throw new Error('Failed to create test messages');
    recordPass('Route Alias: Created test messages for direct and alias testing');
  } catch (err) {
    recordFail('Route Alias: Message creation setup', err.message);
  }

  // 2.1 GET Parity
  try {
    const directRes = await axios.get(`${BASE_URL}/admin/messages`, {
      headers: { Authorization: `Bearer ${currentAccessToken}` }
    });
    const aliasRes = await axios.get(`${BASE_URL}/contact/admin/messages`, {
      headers: { Authorization: `Bearer ${currentAccessToken}` }
    });

    if (directRes.status !== 200 || aliasRes.status !== 200) {
      throw new Error(`Status mismatch: direct ${directRes.status}, alias ${aliasRes.status}`);
    }
    if (directRes.data.success !== true || aliasRes.data.success !== true) {
      throw new Error('success property mismatch or not true');
    }
    if (!Array.isArray(directRes.data.data) || !Array.isArray(aliasRes.data.data)) {
      throw new Error('data property is not array on both');
    }
    if (directRes.data.data.length !== aliasRes.data.data.length) {
      throw new Error(`Data length mismatch: direct ${directRes.data.data.length}, alias ${aliasRes.data.data.length}`);
    }
    // Verify first 5 items have matching IDs
    for (let i = 0; i < Math.min(5, directRes.data.data.length); i++) {
      if (directRes.data.data[i]._id !== aliasRes.data.data[i]._id) {
        throw new Error(`ID order mismatch at index ${i}`);
      }
    }
    recordPass('Route Alias: GET /api/admin/messages vs GET /api/contact/admin/messages return identical data and status');
  } catch (err) {
    recordFail('Route Alias: GET parity', err.message);
  }

  // 2.2 GET Unauthenticated Parity
  try {
    const direct401 = await axios.get(`${BASE_URL}/admin/messages`, { validateStatus: () => true });
    const alias401 = await axios.get(`${BASE_URL}/contact/admin/messages`, { validateStatus: () => true });

    if (direct401.status !== 401 || alias401.status !== 401) {
      throw new Error(`Expected 401 on both, got direct ${direct401.status}, alias ${alias401.status}`);
    }
    if (direct401.data.message !== alias401.data.message) {
      throw new Error(`Message mismatch: "${direct401.data.message}" vs "${alias401.data.message}"`);
    }
    recordPass('Route Alias: GET unauthenticated returns identical 401 on both endpoints');
  } catch (err) {
    recordFail('Route Alias: GET unauthenticated parity', err.message);
  }

  // 2.3 PATCH :id/read Parity
  try {
    const directPatch = await axios.patch(
      `${BASE_URL}/admin/messages/${msgDirectId}/read`,
      {},
      { headers: { Authorization: `Bearer ${currentAccessToken}` } }
    );
    const aliasPatch = await axios.patch(
      `${BASE_URL}/contact/admin/messages/${msgAliasId}/read`,
      {},
      { headers: { Authorization: `Bearer ${currentAccessToken}` } }
    );

    if (directPatch.status !== 200 || aliasPatch.status !== 200) {
      throw new Error(`Status mismatch: direct ${directPatch.status}, alias ${aliasPatch.status}`);
    }
    if (directPatch.data.success !== true || aliasPatch.data.success !== true) {
      throw new Error('Success flag mismatch');
    }
    if (directPatch.data.data?.read !== true || aliasPatch.data.data?.read !== true) {
      throw new Error('read flag was not true on both');
    }
    recordPass('Route Alias: PATCH :id/read on direct and alias both mark read: true with status 200');
  } catch (err) {
    recordFail('Route Alias: PATCH :id/read parity', err.message);
  }

  // 2.4 PATCH :id/read Error Parity (Invalid MongoId)
  try {
    const directBad = await axios.patch(
      `${BASE_URL}/admin/messages/bad-id-123/read`,
      {},
      { headers: { Authorization: `Bearer ${currentAccessToken}` }, validateStatus: () => true }
    );
    const aliasBad = await axios.patch(
      `${BASE_URL}/contact/admin/messages/bad-id-123/read`,
      {},
      { headers: { Authorization: `Bearer ${currentAccessToken}` }, validateStatus: () => true }
    );

    if (directBad.status !== 400 || aliasBad.status !== 400) {
      throw new Error(`Expected 400 on both, got direct ${directBad.status}, alias ${aliasBad.status}`);
    }
    if (directBad.data.message !== aliasBad.data.message) {
      throw new Error('Validation message mismatch on invalid ID');
    }
    recordPass('Route Alias: PATCH :id/read invalid ID returns identical 400 on both endpoints');
  } catch (err) {
    recordFail('Route Alias: PATCH :id/read invalid ID parity', err.message);
  }

  // 2.5 PATCH :id/read Non-existent ID Parity
  try {
    const nonExistent = '507f1f77bcf86cd799439011';
    const direct404 = await axios.patch(
      `${BASE_URL}/admin/messages/${nonExistent}/read`,
      {},
      { headers: { Authorization: `Bearer ${currentAccessToken}` }, validateStatus: () => true }
    );
    const alias404 = await axios.patch(
      `${BASE_URL}/contact/admin/messages/${nonExistent}/read`,
      {},
      { headers: { Authorization: `Bearer ${currentAccessToken}` }, validateStatus: () => true }
    );

    if (direct404.status !== 404 || alias404.status !== 404) {
      throw new Error(`Expected 404, got direct ${direct404.status}, alias ${alias404.status}`);
    }
    if (direct404.data.message !== alias404.data.message) {
      throw new Error(`404 message mismatch: "${direct404.data.message}" vs "${alias404.data.message}"`);
    }
    recordPass('Route Alias: PATCH :id/read non-existent ID returns identical 404 on both endpoints');
  } catch (err) {
    recordFail('Route Alias: PATCH :id/read 404 parity', err.message);
  }

  // 2.6 DELETE :id Parity
  try {
    const directDel = await axios.delete(`${BASE_URL}/admin/messages/${msgDirectId}`, {
      headers: { Authorization: `Bearer ${currentAccessToken}` }
    });
    const aliasDel = await axios.delete(`${BASE_URL}/contact/admin/messages/${msgAliasId}`, {
      headers: { Authorization: `Bearer ${currentAccessToken}` }
    });

    if (directDel.status !== 200 || aliasDel.status !== 200) {
      throw new Error(`Status mismatch: direct ${directDel.status}, alias ${aliasDel.status}`);
    }
    if (directDel.data.message !== 'Message deleted.' || aliasDel.data.message !== 'Message deleted.') {
      throw new Error(`Message mismatch: "${directDel.data.message}" vs "${aliasDel.data.message}"`);
    }
    recordPass('Route Alias: DELETE :id on direct and alias both return 200 with identical "Message deleted."');
  } catch (err) {
    recordFail('Route Alias: DELETE :id parity', err.message);
  }

  // 2.7 DELETE :id Error Parity (Invalid MongoId)
  try {
    const directDelBad = await axios.delete(`${BASE_URL}/admin/messages/bad-id-123`, {
      headers: { Authorization: `Bearer ${currentAccessToken}` },
      validateStatus: () => true
    });
    const aliasDelBad = await axios.delete(`${BASE_URL}/contact/admin/messages/bad-id-123`, {
      headers: { Authorization: `Bearer ${currentAccessToken}` },
      validateStatus: () => true
    });

    if (directDelBad.status !== 400 || aliasDelBad.status !== 400) {
      throw new Error(`Expected 400 on both, got direct ${directDelBad.status}, alias ${aliasDelBad.status}`);
    }
    recordPass('Route Alias: DELETE :id invalid ID returns identical 400 on both endpoints');
  } catch (err) {
    recordFail('Route Alias: DELETE :id invalid ID parity', err.message);
  }

  // 2.8 DELETE :id Non-existent ID Parity
  try {
    const nonExistent = '507f1f77bcf86cd799439011';
    const directDel404 = await axios.delete(`${BASE_URL}/admin/messages/${nonExistent}`, {
      headers: { Authorization: `Bearer ${currentAccessToken}` },
      validateStatus: () => true
    });
    const aliasDel404 = await axios.delete(`${BASE_URL}/contact/admin/messages/${nonExistent}`, {
      headers: { Authorization: `Bearer ${currentAccessToken}` },
      validateStatus: () => true
    });

    if (directDel404.status !== 404 || aliasDel404.status !== 404) {
      throw new Error(`Expected 404 on both, got direct ${directDel404.status}, alias ${aliasDel404.status}`);
    }
    recordPass('Route Alias: DELETE :id non-existent ID returns identical 404 on both endpoints');
  } catch (err) {
    recordFail('Route Alias: DELETE :id non-existent ID parity', err.message);
  }

  // =========================================================================
  // TASK 3: SEED SCRIPT IDEMPOTENCY UNDER CONCURRENT OR REPEATED EXECUTION
  // =========================================================================
  console.log(`\n${colors.yellow}--- TASK 3: Seed Script Idempotency Verification ---${colors.reset}`);

  // Connect to DB directly to monitor document counts and IDs
  let adminIdBefore = null;
  let adminPasswordHashBefore = null;
  try {
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;
    const adminUser = await db.collection('adminusers').findOne({ email: ADMIN_EMAIL.toLowerCase() });
    if (!adminUser) throw new Error(`Admin user ${ADMIN_EMAIL} not found in DB`);
    adminIdBefore = adminUser._id.toString();
    adminPasswordHashBefore = adminUser.passwordHash;
    await mongoose.disconnect();
    recordPass(`Seed: Initial DB check verified existing admin ID: ${adminIdBefore}`);
  } catch (err) {
    recordFail('Seed: DB baseline check', err.message);
  }

  // 3.1 Repeated Sequential Execution (3 runs)
  try {
    for (let i = 1; i <= 3; i++) {
      const res = await runSeedProcess();
      if (res.code !== 0) throw new Error(`Run #${i} exited with code ${res.code}. Stderr: ${res.stderr}`);
      if (!res.stdout.includes('Admin user already exists') && !res.stdout.includes('Skipping creation')) {
        throw new Error(`Run #${i} did not report existing user skip. Output: ${res.stdout}`);
      }
    }

    // Verify DB integrity
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;
    const count = await db.collection('adminusers').countDocuments();
    const adminUserAfterSeq = await db.collection('adminusers').findOne({ email: ADMIN_EMAIL.toLowerCase() });
    await mongoose.disconnect();

    if (count !== 1) throw new Error(`Expected exactly 1 admin user, found ${count}`);
    if (adminUserAfterSeq._id.toString() !== adminIdBefore) {
      throw new Error(`Admin user ID changed! Was ${adminIdBefore}, now ${adminUserAfterSeq._id.toString()}`);
    }
    if (adminUserAfterSeq.passwordHash !== adminPasswordHashBefore) {
      throw new Error('Admin password hash was overwritten during seed!');
    }

    recordPass('Seed Idempotency: 3 sequential runs exited with code 0 and preserved exact admin user ID and hash');
  } catch (err) {
    recordFail('Seed Idempotency: Sequential execution', err.message);
  }

  // 3.2 Concurrent Execution (5 simultaneous processes)
  try {
    console.log(`${colors.cyan}  Spawning 5 concurrent seed script processes...${colors.reset}`);
    const results = await Promise.all([
      runSeedProcess(),
      runSeedProcess(),
      runSeedProcess(),
      runSeedProcess(),
      runSeedProcess()
    ]);

    for (let i = 0; i < results.length; i++) {
      if (results[i].code !== 0) {
        throw new Error(`Concurrent process #${i + 1} failed with code ${results[i].code}. Error: ${results[i].stderr}`);
      }
    }

    // Verify DB integrity
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;
    const count = await db.collection('adminusers').countDocuments();
    const adminUserAfterConc = await db.collection('adminusers').findOne({ email: ADMIN_EMAIL.toLowerCase() });
    await mongoose.disconnect();

    if (count !== 1) throw new Error(`Expected exactly 1 admin user after concurrent run, found ${count}`);
    if (adminUserAfterConc._id.toString() !== adminIdBefore) {
      throw new Error(`Admin user ID altered after concurrent run! Was ${adminIdBefore}, now ${adminUserAfterConc._id.toString()}`);
    }

    recordPass('Seed Idempotency: 5 concurrent executions all exited with code 0 without duplicate admins or errors');
  } catch (err) {
    recordFail('Seed Idempotency: Concurrent execution', err.message);
  }

  // =========================================================================
  // TASK 4: WRITE ENDPOINTS ENFORCE DATA CONTRACTS CLEANLY
  // =========================================================================
  console.log(`\n${colors.yellow}--- TASK 4: Write Endpoints Data Contracts Verification ---${colors.reset}`);

  function assertValidationErrorStructure(res, expectedFields = []) {
    if (res.status !== 400) throw new Error(`Expected HTTP 400, got ${res.status}`);
    if (res.data.success !== false) throw new Error(`Expected success: false, got ${res.data.success}`);
    if (res.data.message !== 'Validation failed') {
      throw new Error(`Expected message: "Validation failed", got "${res.data.message}"`);
    }
    if (!Array.isArray(res.data.errors)) throw new Error('Expected errors array');
    for (const err of res.data.errors) {
      if (typeof err.field !== 'string') throw new Error(`Error item missing field string: ${JSON.stringify(err)}`);
      if (typeof err.message !== 'string') throw new Error(`Error item missing message string: ${JSON.stringify(err)}`);
    }
    const returnedFields = res.data.errors.map((e) => e.field);
    for (const reqField of expectedFields) {
      if (!returnedFields.includes(reqField)) {
        throw new Error(`Expected error on field "${reqField}", but got fields: ${returnedFields.join(', ')}`);
      }
    }
  }

  // 4.1 Project Data Contract
  try {
    // Empty POST
    const emptyProj = await axios.post(`${BASE_URL}/admin/projects`, {}, {
      headers: { Authorization: `Bearer ${currentAccessToken}` },
      validateStatus: () => true
    });
    assertValidationErrorStructure(emptyProj, ['title.en', 'title.ar', 'description.en', 'description.ar', 'category']);
    recordPass('Contract: POST /admin/projects empty body rejects required fields cleanly');

    // Invalid category
    const badCat = await axios.post(`${BASE_URL}/admin/projects`, {
      title: { en: 'Test', ar: 'اختبار' },
      description: { en: 'Desc', ar: 'وصف' },
      category: 'invalid_category_xyz'
    }, {
      headers: { Authorization: `Bearer ${currentAccessToken}` },
      validateStatus: () => true
    });
    assertValidationErrorStructure(badCat, ['category']);
    recordPass('Contract: POST /admin/projects invalid category enum rejected');

    // Non-array stack
    const badStack = await axios.post(`${BASE_URL}/admin/projects`, {
      title: { en: 'Test', ar: 'اختبار' },
      description: { en: 'Desc', ar: 'وصف' },
      category: 'fullstack',
      stack: 'React'
    }, {
      headers: { Authorization: `Bearer ${currentAccessToken}` },
      validateStatus: () => true
    });
    assertValidationErrorStructure(badStack, ['stack']);
    recordPass('Contract: POST /admin/projects non-array stack rejected');

    // Non-object links
    const badLinks = await axios.post(`${BASE_URL}/admin/projects`, {
      title: { en: 'Test', ar: 'اختبار' },
      description: { en: 'Desc', ar: 'وصف' },
      category: 'fullstack',
      links: 'https://github.com'
    }, {
      headers: { Authorization: `Bearer ${currentAccessToken}` },
      validateStatus: () => true
    });
    assertValidationErrorStructure(badLinks, ['links']);
    recordPass('Contract: POST /admin/projects non-object links rejected');

    // Non-boolean featured & non-int order
    const badTypes = await axios.post(`${BASE_URL}/admin/projects`, {
      title: { en: 'Test', ar: 'اختبار' },
      description: { en: 'Desc', ar: 'وصف' },
      category: 'fullstack',
      featured: 'yes',
      order: 1.5
    }, {
      headers: { Authorization: `Bearer ${currentAccessToken}` },
      validateStatus: () => true
    });
    assertValidationErrorStructure(badTypes, ['featured', 'order']);
    recordPass('Contract: POST /admin/projects non-boolean featured & non-int order rejected');

    // Create valid project for PUT/DELETE testing
    const createRes = await axios.post(`${BASE_URL}/admin/projects`, {
      title: { en: 'Challenger Project', ar: 'مشروع التحدي' },
      description: { en: 'Challenger description', ar: 'وصف التحدي' },
      category: 'fullstack',
      stack: ['Node.js', 'Express'],
      featured: false,
      order: 1
    }, { headers: { Authorization: `Bearer ${currentAccessToken}` } });
    const projId = createRes.data.data?._id;

    // Test PUT partial update (only changing featured)
    const putRes = await axios.put(`${BASE_URL}/admin/projects/${projId}`, {
      featured: true
    }, { headers: { Authorization: `Bearer ${currentAccessToken}` } });
    if (putRes.status !== 200 || putRes.data.data?.featured !== true) {
      throw new Error(`PUT partial update failed: ${JSON.stringify(putRes.data)}`);
    }
    recordPass('Contract: PUT /admin/projects/:id supports partial update without requiring omitted fields');

    // Test PUT with invalid category
    const putBad = await axios.put(`${BASE_URL}/admin/projects/${projId}`, {
      category: 'bogus_category'
    }, {
      headers: { Authorization: `Bearer ${currentAccessToken}` },
      validateStatus: () => true
    });
    assertValidationErrorStructure(putBad, ['category']);
    recordPass('Contract: PUT /admin/projects/:id validates updated property');

    // Cleanup project
    await axios.delete(`${BASE_URL}/admin/projects/${projId}`, {
      headers: { Authorization: `Bearer ${currentAccessToken}` }
    });
  } catch (err) {
    recordFail('Contract: Project write endpoints', err.message);
  }

  // 4.2 Skill Data Contract
  try {
    const emptySkill = await axios.post(`${BASE_URL}/admin/skills`, {}, {
      headers: { Authorization: `Bearer ${currentAccessToken}` },
      validateStatus: () => true
    });
    assertValidationErrorStructure(emptySkill, ['name', 'category']);
    recordPass('Contract: POST /admin/skills empty body rejects required fields cleanly');

    const badOrderSkill = await axios.post(`${BASE_URL}/admin/skills`, {
      name: 'Jest',
      category: 'Testing',
      order: 'not-an-int'
    }, {
      headers: { Authorization: `Bearer ${currentAccessToken}` },
      validateStatus: () => true
    });
    assertValidationErrorStructure(badOrderSkill, ['order']);
    recordPass('Contract: POST /admin/skills non-int order rejected');

    // Valid create, partial update, delete
    const skillRes = await axios.post(`${BASE_URL}/admin/skills`, {
      name: 'Jest QA',
      category: 'Testing',
      order: 99
    }, { headers: { Authorization: `Bearer ${currentAccessToken}` } });
    const skillId = skillRes.data.data?._id;

    const skillPut = await axios.put(`${BASE_URL}/admin/skills/${skillId}`, {
      order: 100
    }, { headers: { Authorization: `Bearer ${currentAccessToken}` } });
    if (skillPut.status !== 200 || skillPut.data.data?.order !== 100) {
      throw new Error('Partial update on skill order failed');
    }
    recordPass('Contract: PUT /admin/skills/:id supports partial update');

    await axios.delete(`${BASE_URL}/admin/skills/${skillId}`, {
      headers: { Authorization: `Bearer ${currentAccessToken}` }
    });
  } catch (err) {
    recordFail('Contract: Skill write endpoints', err.message);
  }

  // 4.3 Experience Data Contract
  try {
    const emptyExp = await axios.post(`${BASE_URL}/admin/experience`, {}, {
      headers: { Authorization: `Bearer ${currentAccessToken}` },
      validateStatus: () => true
    });
    assertValidationErrorStructure(emptyExp, ['title.en', 'title.ar', 'organization.en', 'organization.ar', 'startDate']);
    recordPass('Contract: POST /admin/experience empty body rejects required fields cleanly');

    const badDateExp = await axios.post(`${BASE_URL}/admin/experience`, {
      title: { en: 'T', ar: 'ع' },
      organization: { en: 'O', ar: 'ش' },
      startDate: 'invalid-date-format',
      endDate: 'also-invalid'
    }, {
      headers: { Authorization: `Bearer ${currentAccessToken}` },
      validateStatus: () => true
    });
    assertValidationErrorStructure(badDateExp, ['startDate', 'endDate']);
    recordPass('Contract: POST /admin/experience non-ISO8601 dates rejected');

    // Valid create with nullable endDate
    const expRes = await axios.post(`${BASE_URL}/admin/experience`, {
      title: { en: 'QA Engineer', ar: 'مهندس جودة' },
      organization: { en: 'QA Labs', ar: 'مختبرات الجودة' },
      startDate: '2023-01-01T00:00:00.000Z',
      endDate: null
    }, { headers: { Authorization: `Bearer ${currentAccessToken}` } });
    const expId = expRes.data.data?._id;
    if (!expId) throw new Error('Experience create failed');

    await axios.delete(`${BASE_URL}/admin/experience/${expId}`, {
      headers: { Authorization: `Bearer ${currentAccessToken}` }
    });
    recordPass('Contract: POST /admin/experience accepts nullable endDate');
  } catch (err) {
    recordFail('Contract: Experience write endpoints', err.message);
  }

  // 4.4 Certificate Data Contract
  try {
    const emptyCert = await axios.post(`${BASE_URL}/admin/certificates`, {}, {
      headers: { Authorization: `Bearer ${currentAccessToken}` },
      validateStatus: () => true
    });
    assertValidationErrorStructure(emptyCert, ['title.en', 'title.ar', 'issuer', 'date']);
    recordPass('Contract: POST /admin/certificates empty body rejects required fields cleanly');

    const badDateCert = await axios.post(`${BASE_URL}/admin/certificates`, {
      title: { en: 'C', ar: 'ش' },
      issuer: 'Issuer',
      date: '2023-99-99'
    }, {
      headers: { Authorization: `Bearer ${currentAccessToken}` },
      validateStatus: () => true
    });
    assertValidationErrorStructure(badDateCert, ['date']);
    recordPass('Contract: POST /admin/certificates invalid date rejected');
  } catch (err) {
    recordFail('Contract: Certificate write endpoints', err.message);
  }

  // 4.5 Blog Post Data Contract
  try {
    const emptyBlog = await axios.post(`${BASE_URL}/admin/blog`, {}, {
      headers: { Authorization: `Bearer ${currentAccessToken}` },
      validateStatus: () => true
    });
    assertValidationErrorStructure(emptyBlog, ['title.en', 'title.ar']);
    recordPass('Contract: POST /admin/blog empty body rejects required fields cleanly');

    const badDateBlog = await axios.post(`${BASE_URL}/admin/blog`, {
      title: { en: 'Post', ar: 'مقال' },
      publishedAt: 'invalid-date',
      tags: 'not-an-array'
    }, {
      headers: { Authorization: `Bearer ${currentAccessToken}` },
      validateStatus: () => true
    });
    assertValidationErrorStructure(badDateBlog, ['publishedAt', 'tags']);
    recordPass('Contract: POST /admin/blog non-ISO publishedAt and non-array tags rejected');
  } catch (err) {
    recordFail('Contract: Blog write endpoints', err.message);
  }

  // 4.6 Contact Submission Contract
  try {
    const badContact = await axios.post(`${BASE_URL}/contact`, {
      name: '',
      email: 'not-an-email',
      message: ''
    }, { validateStatus: () => true });

    if (badContact.status !== 400) throw new Error(`Expected 400, got ${badContact.status}`);
    recordPass('Contract: POST /contact invalid submission rejected with 400');
  } catch (err) {
    recordFail('Contract: Contact write endpoint', err.message);
  }

  // 4.7 Invalid MongoId on PUT / DELETE routes
  try {
    const routesToTest = [
      { method: 'put', url: '/admin/projects/bad-id-123', body: {} },
      { method: 'delete', url: '/admin/projects/bad-id-123' },
      { method: 'put', url: '/admin/skills/bad-id-123', body: {} },
      { method: 'delete', url: '/admin/skills/bad-id-123' },
      { method: 'put', url: '/admin/experience/bad-id-123', body: {} },
      { method: 'delete', url: '/admin/experience/bad-id-123' },
      { method: 'put', url: '/admin/certificates/bad-id-123', body: {} },
      { method: 'delete', url: '/admin/certificates/bad-id-123' },
      { method: 'put', url: '/admin/blog/bad-id-123', body: {} },
      { method: 'delete', url: '/admin/blog/bad-id-123' }
    ];

    for (const r of routesToTest) {
      const res = await axios({
        method: r.method,
        url: `${BASE_URL}${r.url}`,
        data: r.body,
        headers: { Authorization: `Bearer ${currentAccessToken}` },
        validateStatus: () => true
      });
      assertValidationErrorStructure(res, ['id']);
    }
    recordPass('Contract: All PUT & DELETE routes cleanly enforce MongoId param format with 400');
  } catch (err) {
    recordFail('Contract: MongoId param enforcement on write routes', err.message);
  }

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log(`\n${colors.magenta}${colors.bold}======================================================${colors.reset}`);
  console.log(`${colors.magenta}${colors.bold}             CHALLENGER TEST RUN SUMMARY              ${colors.reset}`);
  console.log(`${colors.magenta}${colors.bold}======================================================${colors.reset}`);
  console.log(`${colors.green}Total Passed: ${totalPassed}${colors.reset}`);
  console.log(`${totalFailed === 0 ? colors.green : colors.red}Total Failed: ${totalFailed}${colors.reset}`);

  if (failures.length > 0) {
    console.log(`\n${colors.red}${colors.bold}Failures Breakdown:${colors.reset}`);
    for (const f of failures) {
      console.log(`- ${f.testName}: ${f.error}`);
    }
    process.exit(1);
  } else {
    console.log(`\n${colors.green}${colors.bold}🎯 ALL EMPIRICAL CHALLENGES PASSED (100% Green).${colors.reset}\n`);
    process.exit(0);
  }
}

runChallengerSuite().catch((err) => {
  console.error(`Fatal challenger suite error: ${err.message}`);
  process.exit(1);
});
