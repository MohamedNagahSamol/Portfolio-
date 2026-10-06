import axios from 'axios';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'memenoname60@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Meme@1234';
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'kjdkjdcjkkcejecjkkerok322';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m'
};

let passed = 0;
let failed = 0;
const failures = [];

function checkStackLeak(data) {
  if (!data) return false;
  if (typeof data === 'object') {
    if ('stack' in data) return true;
    const str = JSON.stringify(data);
    if (str.includes('node_modules') || str.includes('Error:') || str.includes('at async')) {
      return true;
    }
  }
  return false;
}

async function testAdversarialCase({
  category,
  name,
  method,
  url,
  data = null,
  headers = {},
  expectedStatus = [400],
  allowStatuses = null
}) {
  const allowed = allowStatuses || (Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus]);
  process.stdout.write(`  [${category}] ${name}... `);

  try {
    const res = await axios({
      method,
      url: `${BASE_URL}${url}`,
      data,
      headers,
      validateStatus: () => true,
      timeout: 5000
    });

    const hasStack = checkStackLeak(res.data);
    const statusOk = allowed.includes(res.status);

    if (statusOk && !hasStack) {
      passed++;
      console.log(`${colors.green}PASS (Status ${res.status})${colors.reset}`);
      return { success: true, res };
    } else {
      failed++;
      let reason = '';
      if (!statusOk) reason += `Expected status [${allowed.join(',')}], got ${res.status}. `;
      if (hasStack) reason += `LEAKED STACK TRACE in response body! `;
      console.log(`${colors.red}FAIL: ${reason}${colors.reset}`);
      failures.push({ category, name, method, url, status: res.status, reason, data: res.data });
      return { success: false, res };
    }
  } catch (err) {
    failed++;
    console.log(`${colors.red}EXCEPTION: ${err.message}${colors.reset}`);
    failures.push({ category, name, method, url, reason: `Request exception: ${err.message}` });
    return { success: false, error: err };
  }
}

async function runAdversarialSuite() {
  console.log(`\n${colors.bold}${colors.magenta}====================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.magenta}    Empirical Backend Adversarial Stress Test Suite  ${colors.reset}`);
  console.log(`${colors.bold}${colors.magenta}====================================================${colors.reset}\n`);

  // First obtain valid auth token for protected endpoint testing
  let validToken = null;
  try {
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    validToken = loginRes.data?.data?.accessToken;
    console.log(`${colors.green}✓ Obtained authentic admin Bearer token for authorized adversarial payloads.${colors.reset}\n`);
  } catch (e) {
    console.error(`${colors.red}Failed to obtain admin token: ${e.message}${colors.reset}`);
    process.exit(1);
  }

  const authHeader = { Authorization: `Bearer ${validToken}` };
  const forgedToken = jwt.sign({ id: '6ac24efda98da0602b40786a' }, 'wrong-secret-key-123456');
  const forgedHeader = { Authorization: `Bearer ${forgedToken}` };

  // =========================================================================
  // 1. UNAUTHORIZED / FORGED AUTHENTICATION ATTACKS
  // =========================================================================
  console.log(`\n${colors.yellow}${colors.bold}--- Category 1: Unauthorized & Forged Authentication Attacks ---${colors.reset}`);

  const protectedEndpoints = [
    { method: 'GET', url: '/admin/messages' },
    { method: 'PATCH', url: '/admin/messages/6ac24efda98da0602b40786a/read' },
    { method: 'DELETE', url: '/admin/messages/6ac24efda98da0602b40786a' },
    { method: 'POST', url: '/admin/projects' },
    { method: 'PUT', url: '/admin/projects/6ac24efda98da0602b40786a' },
    { method: 'DELETE', url: '/admin/projects/6ac24efda98da0602b40786a' },
    { method: 'POST', url: '/admin/skills' },
    { method: 'PUT', url: '/admin/skills/6ac24efda98da0602b40786a' },
    { method: 'DELETE', url: '/admin/skills/6ac24efda98da0602b40786a' },
    { method: 'POST', url: '/admin/experience' },
    { method: 'PUT', url: '/admin/experience/6ac24efda98da0602b40786a' },
    { method: 'DELETE', url: '/admin/experience/6ac24efda98da0602b40786a' },
    { method: 'POST', url: '/admin/certificates' },
    { method: 'PUT', url: '/admin/certificates/6ac24efda98da0602b40786a' },
    { method: 'DELETE', url: '/admin/certificates/6ac24efda98da0602b40786a' },
    { method: 'POST', url: '/admin/blog' },
    { method: 'PUT', url: '/admin/blog/6ac24efda98da0602b40786a' },
    { method: 'DELETE', url: '/admin/blog/6ac24efda98da0602b40786a' }
  ];

  for (const ep of protectedEndpoints) {
    await testAdversarialCase({
      category: 'AUTH-MISSING',
      name: `${ep.method} ${ep.url} without token`,
      method: ep.method,
      url: ep.url,
      expectedStatus: [401]
    });
  }

  const tokenTamperingVariants = [
    { name: 'Empty Bearer header', header: { Authorization: '' } },
    { name: 'Bearer with whitespace only', header: { Authorization: 'Bearer ' } },
    { name: 'Bearer without space', header: { Authorization: 'Bearer' } },
    { name: 'Malformed garbage token string', header: { Authorization: 'Bearer not-a-valid-jwt-token' } },
    { name: 'Forged token signed with incorrect secret', header: forgedHeader },
    { name: 'Basic authentication instead of Bearer', header: { Authorization: 'Basic dXNlcjpwYXNz' } }
  ];

  for (const t of tokenTamperingVariants) {
    await testAdversarialCase({
      category: 'AUTH-TAMPER',
      name: `GET /admin/messages with ${t.name}`,
      method: 'GET',
      url: '/admin/messages',
      headers: t.header,
      expectedStatus: [401]
    });
  }

  // Refresh token attacks
  await testAdversarialCase({
    category: 'AUTH-REFRESH',
    name: 'POST /auth/refresh with missing cookie',
    method: 'POST',
    url: '/auth/refresh',
    expectedStatus: [401]
  });

  await testAdversarialCase({
    category: 'AUTH-REFRESH',
    name: 'POST /auth/refresh with garbage cookie',
    method: 'POST',
    url: '/auth/refresh',
    headers: { Cookie: 'refreshToken=garbage_invalid_token_12345' },
    expectedStatus: [401]
  });

  await testAdversarialCase({
    category: 'AUTH-REFRESH',
    name: 'POST /auth/refresh with token signed with wrong secret',
    method: 'POST',
    url: '/auth/refresh',
    headers: { Cookie: `refreshToken=${forgedToken}` },
    expectedStatus: [401]
  });

  // =========================================================================
  // 2. SQL / NOSQL INJECTION & INVALID MONGOIDS (PARAMS)
  // =========================================================================
  console.log(`\n${colors.yellow}${colors.bold}--- Category 2: SQL/NoSQL Injection & Invalid MongoIds (Route Params) ---${colors.reset}`);

  const adversarialIdParams = [
    'not-an-id',
    '123',
    '6ac24efda98da0602b40786z',       // 24 chars but 'z' is illegal
    '6ac24efda98da0602b40786',        // 23 chars (short)
    '6ac24efda98da0602b40786dd',      // 25 chars (long)
    "' OR 1=1 --",                    // SQL injection
    'admin\'--',                      // SQL injection
    '<script>alert(1)</script>',      // XSS vector
    '{"$gt":""}',                     // NoSQL object literal in string
    '../../etc/passwd',               // Path traversal
    'null',
    'undefined',
    '00000000000000000000000g'        // 24 chars with 'g'
  ];

  // Test against public ID endpoints
  for (const badId of adversarialIdParams) {
    await testAdversarialCase({
      category: 'PARAM-ID-PUBLIC',
      name: `GET /projects/${encodeURIComponent(badId)}`,
      method: 'GET',
      url: `/projects/${encodeURIComponent(badId)}`,
      expectedStatus: [400]
    });
  }

  // Test against admin ID endpoints
  for (const badId of ['not-an-id', '123', "' OR 1=1 --", '{"$gt":""}']) {
    await testAdversarialCase({
      category: 'PARAM-ID-ADMIN',
      name: `PATCH /admin/messages/${encodeURIComponent(badId)}/read`,
      method: 'PATCH',
      url: `/admin/messages/${encodeURIComponent(badId)}/read`,
      headers: authHeader,
      expectedStatus: [400]
    });

    await testAdversarialCase({
      category: 'PARAM-ID-ADMIN',
      name: `DELETE /admin/messages/${encodeURIComponent(badId)}`,
      method: 'DELETE',
      url: `/admin/messages/${encodeURIComponent(badId)}`,
      headers: authHeader,
      expectedStatus: [400]
    });

    await testAdversarialCase({
      category: 'PARAM-ID-ADMIN',
      name: `PUT /admin/projects/${encodeURIComponent(badId)}`,
      method: 'PUT',
      url: `/admin/projects/${encodeURIComponent(badId)}`,
      data: { title: { en: 'Updated', ar: 'محدث' } },
      headers: authHeader,
      expectedStatus: [400]
    });

    await testAdversarialCase({
      category: 'PARAM-ID-ADMIN',
      name: `DELETE /admin/projects/${encodeURIComponent(badId)}`,
      method: 'DELETE',
      url: `/admin/projects/${encodeURIComponent(badId)}`,
      headers: authHeader,
      expectedStatus: [400]
    });

    await testAdversarialCase({
      category: 'PARAM-ID-ADMIN',
      name: `PUT /admin/skills/${encodeURIComponent(badId)}`,
      method: 'PUT',
      url: `/admin/skills/${encodeURIComponent(badId)}`,
      data: { name: 'Updated' },
      headers: authHeader,
      expectedStatus: [400]
    });

    await testAdversarialCase({
      category: 'PARAM-ID-ADMIN',
      name: `PUT /admin/experience/${encodeURIComponent(badId)}`,
      method: 'PUT',
      url: `/admin/experience/${encodeURIComponent(badId)}`,
      data: { title: { en: 'Updated', ar: 'محدث' } },
      headers: authHeader,
      expectedStatus: [400]
    });

    await testAdversarialCase({
      category: 'PARAM-ID-ADMIN',
      name: `PUT /admin/certificates/${encodeURIComponent(badId)}`,
      method: 'PUT',
      url: `/admin/certificates/${encodeURIComponent(badId)}`,
      data: { issuer: 'Updated' },
      headers: authHeader,
      expectedStatus: [400]
    });

    await testAdversarialCase({
      category: 'PARAM-ID-ADMIN',
      name: `PUT /admin/blog/${encodeURIComponent(badId)}`,
      method: 'PUT',
      url: `/admin/blog/${encodeURIComponent(badId)}`,
      data: { tags: ['Test'] },
      headers: authHeader,
      expectedStatus: [400]
    });
  }

  // =========================================================================
  // 3. MALFORMED PAYLOADS (NULLS, EMPTY, MISSING NESTED KEYS)
  // =========================================================================
  console.log(`\n${colors.yellow}${colors.bold}--- Category 3: Malformed Payloads (Nulls, Missing Keys) ---${colors.reset}`);

  // Contact endpoint malformed payloads
  await testAdversarialCase({
    category: 'MALFORMED-CONTACT',
    name: 'POST /contact with all null values',
    method: 'POST',
    url: '/contact',
    data: { name: null, email: null, message: null },
    expectedStatus: [400]
  });

  await testAdversarialCase({
    category: 'MALFORMED-CONTACT',
    name: 'POST /contact with empty object',
    method: 'POST',
    url: '/contact',
    data: {},
    expectedStatus: [400]
  });

  await testAdversarialCase({
    category: 'MALFORMED-CONTACT',
    name: 'POST /contact with missing message',
    method: 'POST',
    url: '/contact',
    data: { name: 'Alice', email: 'alice@example.com' },
    expectedStatus: [400]
  });

  await testAdversarialCase({
    category: 'MALFORMED-CONTACT',
    name: 'POST /contact with invalid email string',
    method: 'POST',
    url: '/contact',
    data: { name: 'Alice', email: 'alice-at-example', message: 'Hello' },
    expectedStatus: [400]
  });

  // Projects malformed payloads
  await testAdversarialCase({
    category: 'MALFORMED-PROJECT',
    name: 'POST /admin/projects with all null fields',
    method: 'POST',
    url: '/admin/projects',
    data: { title: null, description: null, category: null },
    headers: authHeader,
    expectedStatus: [400]
  });

  await testAdversarialCase({
    category: 'MALFORMED-PROJECT',
    name: 'POST /admin/projects with empty nested title & description',
    method: 'POST',
    url: '/admin/projects',
    data: { title: {}, description: {}, category: 'backend' },
    headers: authHeader,
    expectedStatus: [400]
  });

  await testAdversarialCase({
    category: 'MALFORMED-PROJECT',
    name: 'POST /admin/projects missing title.ar and description.en',
    method: 'POST',
    url: '/admin/projects',
    data: { title: { en: 'Only En' }, description: { ar: 'فقط عربي' }, category: 'fullstack' },
    headers: authHeader,
    expectedStatus: [400]
  });

  await testAdversarialCase({
    category: 'MALFORMED-PROJECT',
    name: 'POST /admin/projects with title as flat string instead of object',
    method: 'POST',
    url: '/admin/projects',
    data: { title: 'Flat Title String', description: { en: 'Desc', ar: 'وصف' }, category: 'fullstack' },
    headers: authHeader,
    expectedStatus: [400]
  });

  // Skills malformed payloads
  await testAdversarialCase({
    category: 'MALFORMED-SKILL',
    name: 'POST /admin/skills with all nulls',
    method: 'POST',
    url: '/admin/skills',
    data: { name: null, category: null },
    headers: authHeader,
    expectedStatus: [400]
  });

  await testAdversarialCase({
    category: 'MALFORMED-SKILL',
    name: 'POST /admin/skills missing category',
    method: 'POST',
    url: '/admin/skills',
    data: { name: 'Docker' },
    headers: authHeader,
    expectedStatus: [400]
  });

  // Experience malformed payloads
  await testAdversarialCase({
    category: 'MALFORMED-EXP',
    name: 'POST /admin/experience with all nulls',
    method: 'POST',
    url: '/admin/experience',
    data: { title: null, organization: null, startDate: null },
    headers: authHeader,
    expectedStatus: [400]
  });

  await testAdversarialCase({
    category: 'MALFORMED-EXP',
    name: 'POST /admin/experience missing organization and startDate',
    method: 'POST',
    url: '/admin/experience',
    data: { title: { en: 'Engineer', ar: 'مهندس' } },
    headers: authHeader,
    expectedStatus: [400]
  });

  // Certificates malformed payloads
  await testAdversarialCase({
    category: 'MALFORMED-CERT',
    name: 'POST /admin/certificates missing issuer and date',
    method: 'POST',
    url: '/admin/certificates',
    data: { title: { en: 'Cert', ar: 'شهادة' } },
    headers: authHeader,
    expectedStatus: [400]
  });

  // Blog malformed payloads
  await testAdversarialCase({
    category: 'MALFORMED-BLOG',
    name: 'POST /admin/blog missing title.ar',
    method: 'POST',
    url: '/admin/blog',
    data: { title: { en: 'My Post' } },
    headers: authHeader,
    expectedStatus: [400]
  });

  // =========================================================================
  // 4. INVALID CATEGORIES & NON-ARRAY STACK
  // =========================================================================
  console.log(`\n${colors.yellow}${colors.bold}--- Category 4: Type Mismatches, Non-Array Stack & Invalid Categories ---${colors.reset}`);

  const baseProject = {
    title: { en: 'Valid Title', ar: 'عنوان صحيح' },
    description: { en: 'Valid Desc', ar: 'وصف صحيح' }
  };

  await testAdversarialCase({
    category: 'TYPE-PROJECT',
    name: 'POST /admin/projects with category: "invalid-category"',
    method: 'POST',
    url: '/admin/projects',
    data: { ...baseProject, category: 'invalid-category' },
    headers: authHeader,
    expectedStatus: [400]
  });

  await testAdversarialCase({
    category: 'TYPE-PROJECT',
    name: 'POST /admin/projects with category: 9999 (number)',
    method: 'POST',
    url: '/admin/projects',
    data: { ...baseProject, category: 9999 },
    headers: authHeader,
    expectedStatus: [400]
  });

  await testAdversarialCase({
    category: 'TYPE-PROJECT',
    name: 'POST /admin/projects with category: ["fullstack"] (array)',
    method: 'POST',
    url: '/admin/projects',
    data: { ...baseProject, category: ['fullstack'] },
    headers: authHeader,
    expectedStatus: [400]
  });

  await testAdversarialCase({
    category: 'TYPE-PROJECT',
    name: 'POST /admin/projects with stack: "React, Node" (string instead of array)',
    method: 'POST',
    url: '/admin/projects',
    data: { ...baseProject, category: 'fullstack', stack: 'React, Node' },
    headers: authHeader,
    expectedStatus: [400]
  });

  await testAdversarialCase({
    category: 'TYPE-PROJECT',
    name: 'POST /admin/projects with stack: 12345 (number instead of array)',
    method: 'POST',
    url: '/admin/projects',
    data: { ...baseProject, category: 'fullstack', stack: 12345 },
    headers: authHeader,
    expectedStatus: [400]
  });

  await testAdversarialCase({
    category: 'TYPE-PROJECT',
    name: 'POST /admin/projects with stack containing non-strings: ["React", 123, null]',
    method: 'POST',
    url: '/admin/projects',
    data: { ...baseProject, category: 'fullstack', stack: ['React', 123, null] },
    headers: authHeader,
    expectedStatus: [400]
  });

  await testAdversarialCase({
    category: 'TYPE-PROJECT',
    name: 'POST /admin/projects with links: "https://example.com" (string instead of object)',
    method: 'POST',
    url: '/admin/projects',
    data: { ...baseProject, category: 'fullstack', links: 'https://example.com' },
    headers: authHeader,
    expectedStatus: [400]
  });

  await testAdversarialCase({
    category: 'TYPE-PROJECT',
    name: 'POST /admin/projects with featured: "not-a-boolean"',
    method: 'POST',
    url: '/admin/projects',
    data: { ...baseProject, category: 'fullstack', featured: 'not-a-boolean' },
    headers: authHeader,
    expectedStatus: [400]
  });

  await testAdversarialCase({
    category: 'TYPE-PROJECT',
    name: 'POST /admin/projects with order: "ten" (string instead of int)',
    method: 'POST',
    url: '/admin/projects',
    data: { ...baseProject, category: 'fullstack', order: 'ten' },
    headers: authHeader,
    expectedStatus: [400]
  });

  // =========================================================================
  // 5. DATE VALIDATION & BOUNDARY TESTS
  // =========================================================================
  console.log(`\n${colors.yellow}${colors.bold}--- Category 5: Date Validation & Boundary Tests ---${colors.reset}`);

  const baseExp = {
    title: { en: 'Lead Engineer', ar: 'مهندس رئيسي' },
    organization: { en: 'Corp', ar: 'شركة' }
  };

  await testAdversarialCase({
    category: 'DATE-EXP',
    name: 'POST /admin/experience with startDate: "not-a-date"',
    method: 'POST',
    url: '/admin/experience',
    data: { ...baseExp, startDate: 'not-a-date' },
    headers: authHeader,
    expectedStatus: [400]
  });

  await testAdversarialCase({
    category: 'DATE-EXP',
    name: 'POST /admin/experience with startDate: "2024/05/10" (slash format instead of ISO8601)',
    method: 'POST',
    url: '/admin/experience',
    data: { ...baseExp, startDate: '2024/05/10' },
    headers: authHeader,
    expectedStatus: [400]
  });

  await testAdversarialCase({
    category: 'DATE-EXP',
    name: 'POST /admin/experience with endDate: "invalid-end-date"',
    method: 'POST',
    url: '/admin/experience',
    data: { ...baseExp, startDate: '2024-01-01T00:00:00.000Z', endDate: 'invalid-end-date' },
    headers: authHeader,
    expectedStatus: [400]
  });

  await testAdversarialCase({
    category: 'DATE-CERT',
    name: 'POST /admin/certificates with date: "invalid-cert-date"',
    method: 'POST',
    url: '/admin/certificates',
    data: { title: { en: 'C', ar: 'ش' }, issuer: 'Org', date: 'invalid-cert-date' },
    headers: authHeader,
    expectedStatus: [400]
  });

  await testAdversarialCase({
    category: 'DATE-BLOG',
    name: 'POST /admin/blog with publishedAt: "invalid-published-date"',
    method: 'POST',
    url: '/admin/blog',
    data: { title: { en: 'T', ar: 'ع' }, publishedAt: 'invalid-published-date' },
    headers: authHeader,
    expectedStatus: [400]
  });

  // Boundary: Whitespace-only strings
  await testAdversarialCase({
    category: 'BOUNDARY-WHITESPACE',
    name: 'POST /contact with whitespace-only strings',
    method: 'POST',
    url: '/contact',
    data: { name: '   ', email: '   ', message: '   ' },
    expectedStatus: [400]
  });

  await testAdversarialCase({
    category: 'BOUNDARY-WHITESPACE',
    name: 'POST /admin/projects with whitespace-only title & description',
    method: 'POST',
    url: '/admin/projects',
    data: { title: { en: '   ', ar: '   ' }, description: { en: '   ', ar: '   ' }, category: '   ' },
    headers: authHeader,
    expectedStatus: [400]
  });

  // Boundary: Extremely long strings (Stress boundary)
  const hugeString = 'A'.repeat(15000);
  await testAdversarialCase({
    category: 'BOUNDARY-LONG',
    name: 'POST /contact with 15KB message string',
    method: 'POST',
    url: '/contact',
    data: { name: 'Boundary Tester', email: 'boundary@test.com', message: hugeString },
    // A 15KB string is valid JSON and within 100kb limit; should be accepted or rejected cleanly
    allowStatuses: [201, 400]
  });

  // Clean up any test message created if accepted
  try {
    const list = await axios.get(`${BASE_URL}/admin/messages`, { headers: authHeader });
    const found = list.data.data.find(m => m.name === 'Boundary Tester');
    if (found) {
      await axios.delete(`${BASE_URL}/admin/messages/${found._id}`, { headers: authHeader });
    }
  } catch (e) { /* ignore cleanup error */ }

  // =========================================================================
  // 6. NOSQL INJECTION IN BODY PAYLOADS
  // =========================================================================
  console.log(`\n${colors.yellow}${colors.bold}--- Category 6: NoSQL Injection Payloads in Request Bodies ---${colors.reset}`);

  // Login NoSQL injection
  await testAdversarialCase({
    category: 'NOSQL-LOGIN',
    name: 'POST /auth/login with NoSQL selector in email: { $gt: "" }',
    method: 'POST',
    url: '/auth/login',
    data: { email: { $gt: '' }, password: { $gt: '' } },
    expectedStatus: [400]
  });

  await testAdversarialCase({
    category: 'NOSQL-LOGIN',
    name: 'POST /auth/login with NoSQL selector in password: { $ne: null }',
    method: 'POST',
    url: '/auth/login',
    data: { email: ADMIN_EMAIL, password: { $ne: null } },
    expectedStatus: [400]
  });

  // Contact NoSQL injection
  await testAdversarialCase({
    category: 'NOSQL-CONTACT',
    name: 'POST /contact with NoSQL selector in email: { $ne: null }',
    method: 'POST',
    url: '/contact',
    data: { name: 'Hacker', email: { $ne: null }, message: 'Hello' },
    expectedStatus: [400]
  });

  await testAdversarialCase({
    category: 'NOSQL-CONTACT',
    name: 'POST /contact with NoSQL selector in name: { $gt: "" }',
    method: 'POST',
    url: '/contact',
    data: { name: { $gt: '' }, email: 'hacker@evil.com', message: { $gt: '' } },
    expectedStatus: [400]
  });

  // Content NoSQL injection
  await testAdversarialCase({
    category: 'NOSQL-PROJECT',
    name: 'POST /admin/projects with NoSQL object in title.en: { $ne: 1 }',
    method: 'POST',
    url: '/admin/projects',
    data: { title: { en: { $ne: 1 }, ar: 'عربي' }, description: { en: 'Desc', ar: 'وصف' }, category: 'backend' },
    headers: authHeader,
    expectedStatus: [400]
  });

  await testAdversarialCase({
    category: 'NOSQL-SKILL',
    name: 'POST /admin/skills with NoSQL object in name: { $ne: 1 }',
    method: 'POST',
    url: '/admin/skills',
    data: { name: { $ne: 1 }, category: 'Frontend' },
    headers: authHeader,
    expectedStatus: [400]
  });

  await testAdversarialCase({
    category: 'NOSQL-EXP',
    name: 'POST /admin/experience with NoSQL object in organization.en: { $ne: 1 }',
    method: 'POST',
    url: '/admin/experience',
    data: { title: { en: 'Eng', ar: 'مهندس' }, organization: { en: { $ne: 1 }, ar: 'شركة' }, startDate: '2024-01-01T00:00:00.000Z' },
    headers: authHeader,
    expectedStatus: [400]
  });

  await testAdversarialCase({
    category: 'NOSQL-CERT',
    name: 'POST /admin/certificates with NoSQL object in issuer: { $ne: 1 }',
    method: 'POST',
    url: '/admin/certificates',
    data: { title: { en: 'Cert', ar: 'شهادة' }, issuer: { $ne: 1 }, date: '2024-01-01T00:00:00.000Z' },
    headers: authHeader,
    expectedStatus: [400]
  });

  await testAdversarialCase({
    category: 'NOSQL-BLOG',
    name: 'POST /admin/blog with NoSQL object in title.en: { $ne: 1 }',
    method: 'POST',
    url: '/admin/blog',
    data: { title: { en: { $ne: 1 }, ar: 'عنوان' } },
    headers: authHeader,
    expectedStatus: [400]
  });

  await testAdversarialCase({
    category: 'NOSQL-PROJECT',
    name: 'POST /admin/projects with NoSQL regex in category: { $regex: ".*" }',
    method: 'POST',
    url: '/admin/projects',
    data: { ...baseProject, category: { $regex: '.*' } },
    headers: authHeader,
    expectedStatus: [400]
  });

  // Clean up any test documents created by bypasses
  try {
    const pList = await axios.get(`${BASE_URL}/projects`);
    for (const p of pList.data.data) {
      if (p.title?.en === '[object Object]') {
        await axios.delete(`${BASE_URL}/admin/projects/${p._id}`, { headers: authHeader });
      }
    }
    const sList = await axios.get(`${BASE_URL}/skills`);
    for (const s of sList.data.data) {
      if (s.name === '[object Object]') {
        await axios.delete(`${BASE_URL}/admin/skills/${s._id}`, { headers: authHeader });
      }
    }
    const eList = await axios.get(`${BASE_URL}/experience`);
    for (const e of eList.data.data) {
      if (e.organization?.en === '[object Object]') {
        await axios.delete(`${BASE_URL}/admin/experience/${e._id}`, { headers: authHeader });
      }
    }
    const cList = await axios.get(`${BASE_URL}/certificates`);
    for (const c of cList.data.data) {
      if (c.issuer === '[object Object]') {
        await axios.delete(`${BASE_URL}/admin/certificates/${c._id}`, { headers: authHeader });
      }
    }
    const bList = await axios.get(`${BASE_URL}/blog`);
    for (const b of bList.data.data) {
      if (b.title?.en === '[object Object]') {
        await axios.delete(`${BASE_URL}/admin/blog/${b._id}`, { headers: authHeader });
      }
    }
  } catch (err) { /* ignore cleanup error */ }

  // Query parameter NoSQL injection
  await testAdversarialCase({
    category: 'NOSQL-QUERY',
    name: 'GET /projects?category[$ne]=null (Query string NoSQL operator)',
    method: 'GET',
    url: '/projects?category[$ne]=null',
    // Should safely return 200 array or clean 400, never 500 or crash
    allowStatuses: [200, 400]
  });

  // =========================================================================
  // 7. FINAL SERVER LIVENESS & STACK LEAK SUMMARY
  // =========================================================================
  console.log(`\n${colors.yellow}${colors.bold}--- Category 7: Post-Stress Server Liveness & Panic Verification ---${colors.reset}`);

  await testAdversarialCase({
    category: 'LIVENESS',
    name: 'GET /health after adversarial bombardment',
    method: 'GET',
    url: '/health',
    expectedStatus: [200]
  });

  console.log(`\n${colors.bold}${colors.magenta}====================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.magenta}             Adversarial Test Run Summary           ${colors.reset}`);
  console.log(`${colors.bold}${colors.magenta}====================================================${colors.reset}`);
  console.log(`${colors.green}Total Passed: ${passed}${colors.reset}`);
  console.log(`${failed === 0 ? colors.green : colors.red}Total Failed: ${failed}${colors.reset}\n`);

  if (failed > 0) {
    console.log(`${colors.red}${colors.bold}Failures Breakdown:${colors.reset}`);
    for (const f of failures) {
      console.log(`  - [${f.category}] ${f.name} (Status: ${f.status || 'N/A'}): ${f.reason}`);
    }
    console.log(`\n${colors.red}${colors.bold}Verdict: REQUEST_CHANGES (Regressions / vulnerabilities detected)${colors.reset}\n`);
    process.exit(1);
  } else {
    console.log(`${colors.green}${colors.bold}Verdict: APPROVE (Zero server panics, zero stack leaks, 100% graceful 400/401 handling)${colors.reset}\n`);
    process.exit(0);
  }
}

runAdversarialSuite().catch(err => {
  console.error(`Fatal adversarial harness error: ${err.message}`);
  process.exit(1);
});
