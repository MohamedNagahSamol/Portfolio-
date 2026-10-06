import axios from 'axios';
import 'dotenv/config';

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'memenoname60@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Meme@1234';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

let passed = 0;
let failed = 0;

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

async function testEndpoint({
  name,
  method,
  url,
  data = null,
  token = null,
  cookie = null,
  expectedStatus = 200,
  assertion = null
}) {
  console.log(`${colors.cyan}Testing: ${name} [${method} ${url}]...${colors.reset}`);
  try {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (cookie) headers['Cookie'] = cookie;

    const response = await axios({
      method,
      url: `${BASE_URL}${url}`,
      data,
      headers,
      validateStatus: () => true
    });

    const isStatusExpected = Array.isArray(expectedStatus)
      ? expectedStatus.includes(response.status)
      : response.status === expectedStatus;

    let assertionPassed = true;
    let assertionError = '';
    if (assertion && typeof assertion === 'function') {
      try {
        assertion(response);
      } catch (err) {
        assertionPassed = false;
        assertionError = err.message;
      }
    }

    if (isStatusExpected && assertionPassed) {
      passed++;
      console.log(
        `${colors.green}✅ PASS: Status ${response.status} (Expected: ${expectedStatus})${colors.reset}\n`
      );
      return response;
    } else {
      failed++;
      const reason = !isStatusExpected
        ? `Expected status ${expectedStatus}, got ${response.status}`
        : `Assertion failed: ${assertionError}`;
      console.log(
        `${colors.red}❌ FAIL: ${reason}\nResponse: ${JSON.stringify(response.data)}${colors.reset}\n`
      );
      return response;
    }
  } catch (err) {
    failed++;
    console.log(`${colors.red}❌ FAIL: Exception: ${err.message}${colors.reset}\n`);
    return null;
  }
}

async function runTests() {
  console.log(`${colors.yellow}${colors.bold}===========================================${colors.reset}`);
  console.log(`${colors.yellow}${colors.bold}   Portfolio Backend Automated Test Suite   ${colors.reset}`);
  console.log(`${colors.yellow}${colors.bold}===========================================${colors.reset}\n`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Admin User: ${ADMIN_EMAIL}\n`);

  // ==========================================
  // 1. PUBLIC READ & HEALTH ENDPOINTS
  // ==========================================
  console.log(`${colors.yellow}--- [1] Public Read & Health Checks ---${colors.reset}`);
  await testEndpoint({
    name: 'Server Health Check',
    method: 'GET',
    url: '/health',
    expectedStatus: 200,
    assertion: (res) => {
      if (!res.data.success || res.data.dbStatus !== 'connected') {
        throw new Error('Database is not connected');
      }
    }
  });

  await testEndpoint({
    name: 'Public Get Projects',
    method: 'GET',
    url: '/projects',
    expectedStatus: 200,
    assertion: (res) => {
      if (!res.data.success || !Array.isArray(res.data.data)) throw new Error('Invalid project response');
    }
  });

  await testEndpoint({
    name: 'Public Get Skills',
    method: 'GET',
    url: '/skills',
    expectedStatus: 200,
    assertion: (res) => {
      if (!res.data.success || !Array.isArray(res.data.data)) throw new Error('Invalid skills response');
    }
  });

  await testEndpoint({
    name: 'Public Get Experience',
    method: 'GET',
    url: '/experience',
    expectedStatus: 200,
    assertion: (res) => {
      if (!res.data.success || !Array.isArray(res.data.data)) throw new Error('Invalid experience response');
    }
  });

  await testEndpoint({
    name: 'Public Get Certificates',
    method: 'GET',
    url: '/certificates',
    expectedStatus: 200,
    assertion: (res) => {
      if (!res.data.success || !Array.isArray(res.data.data)) throw new Error('Invalid certificates response');
    }
  });

  await testEndpoint({
    name: 'Public Get Blog Posts',
    method: 'GET',
    url: '/blog',
    expectedStatus: 200,
    assertion: (res) => {
      if (!res.data.success || !Array.isArray(res.data.data)) throw new Error('Invalid blog response');
    }
  });

  // ==========================================
  // 2. AUTHENTICATION & LOGIN FLOW
  // ==========================================
  console.log(`${colors.yellow}--- [2] Authentication & Login Flow ---${colors.reset}`);

  // Negative Auth: Invalid email format
  await testEndpoint({
    name: 'Login with Invalid Email Format (Negative)',
    method: 'POST',
    url: '/auth/login',
    data: { email: 'not-an-email', password: 'password123' },
    expectedStatus: 400,
    assertion: (res) => {
      if (res.data.success !== false || !Array.isArray(res.data.errors)) {
        throw new Error('Expected validation errors array');
      }
    }
  });

  // Negative Auth: Short password
  await testEndpoint({
    name: 'Login with Short Password (Negative)',
    method: 'POST',
    url: '/auth/login',
    data: { email: ADMIN_EMAIL, password: '123' },
    expectedStatus: 400,
    assertion: (res) => {
      if (res.data.success !== false || !Array.isArray(res.data.errors)) {
        throw new Error('Expected validation errors array');
      }
    }
  });

  // Negative Auth: Wrong password
  await testEndpoint({
    name: 'Login with Wrong Credentials (Negative)',
    method: 'POST',
    url: '/auth/login',
    data: { email: ADMIN_EMAIL, password: 'WrongPassword@999' },
    expectedStatus: 400,
    assertion: (res) => {
      if (res.data.success !== false) throw new Error('Expected failure on invalid credentials');
    }
  });

  // Successful Login
  const loginRes = await testEndpoint({
    name: 'Admin Login (Valid Credentials)',
    method: 'POST',
    url: '/auth/login',
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    expectedStatus: 200,
    assertion: (res) => {
      if (!res.data.success || !res.data.data?.accessToken) throw new Error('Missing accessToken');
      const refreshTokenCookie = extractCookie(res.headers, 'refreshToken');
      if (!refreshTokenCookie) throw new Error('Missing httpOnly refreshToken cookie');
    }
  });

  if (!loginRes || !loginRes.data?.data?.accessToken) {
    console.error(`${colors.red}Critical: Admin login failed. Halting further tests.${colors.reset}`);
    process.exit(1);
  }

  let accessToken = loginRes.data.data.accessToken;
  let refreshTokenValue = extractCookie(loginRes.headers, 'refreshToken');
  let refreshTokenCookie = `refreshToken=${refreshTokenValue}`;

  // ==========================================
  // 3. NEGATIVE SECURITY & VALIDATION TESTS
  // ==========================================
  console.log(`${colors.yellow}--- [3] Security & Input Validation Tests ---${colors.reset}`);

  // Unauthorized access without token
  await testEndpoint({
    name: 'Access Protected Route without Token (Negative)',
    method: 'GET',
    url: '/admin/messages',
    expectedStatus: 401,
    assertion: (res) => {
      if (res.data.success !== false) throw new Error('Expected 401 Unauthorized');
    }
  });

  // Invalid Mongo ID
  await testEndpoint({
    name: 'Get Content by Invalid Mongo ID Format (Negative)',
    method: 'GET',
    url: '/projects/invalid-mongo-id-12345',
    expectedStatus: 400,
    assertion: (res) => {
      if (res.data.success !== false || !Array.isArray(res.data.errors)) {
        throw new Error('Expected 400 with validation errors array');
      }
    }
  });

  // Empty Project Body
  await testEndpoint({
    name: 'Create Project with Empty Payload (Negative)',
    method: 'POST',
    url: '/admin/projects',
    data: {},
    token: accessToken,
    expectedStatus: 400,
    assertion: (res) => {
      if (res.data.success !== false || !Array.isArray(res.data.errors)) {
        throw new Error('Expected 400 Validation failed with errors array');
      }
      const fieldNames = res.data.errors.map((e) => e.field);
      if (!fieldNames.includes('title.en') || !fieldNames.includes('category')) {
        throw new Error('Missing required field validation errors');
      }
    }
  });

  // ==========================================
  // 4. CONTACT & ADMIN MESSAGES LIFECYCLE
  // ==========================================
  console.log(`${colors.yellow}--- [4] Contact & Admin Messages Lifecycle ---${colors.reset}`);

  // Negative Contact Form
  await testEndpoint({
    name: 'Submit Invalid Contact Form (Negative)',
    method: 'POST',
    url: '/contact',
    data: { name: '', email: 'notanemail', message: '' },
    expectedStatus: 400,
    assertion: (res) => {
      if (res.data.success !== false || !Array.isArray(res.data.errors)) {
        throw new Error('Expected validation errors array');
      }
    }
  });

  // Submit Contact Form
  const submitMsgRes = await testEndpoint({
    name: 'Submit Valid Contact Message',
    method: 'POST',
    url: '/contact',
    data: {
      name: 'Automated QA Tester',
      email: 'qa.automated@example.com',
      message: 'Automated API validation test run message.'
    },
    expectedStatus: 201,
    assertion: (res) => {
      if (!res.data.success || !res.data.data?._id) throw new Error('Failed to create message');
    }
  });

  const createdMessageId = submitMsgRes.data.data._id;

  // Direct Admin Messages route
  await testEndpoint({
    name: 'Direct Route: GET /api/admin/messages',
    method: 'GET',
    url: '/admin/messages',
    token: accessToken,
    expectedStatus: 200,
    assertion: (res) => {
      if (!res.data.success || !Array.isArray(res.data.data)) throw new Error('Expected array of messages');
      const found = res.data.data.some((m) => m._id === createdMessageId);
      if (!found) throw new Error('Created message not found in list');
    }
  });

  // Backward-compatible alias
  await testEndpoint({
    name: 'Alias Route: GET /api/contact/admin/messages',
    method: 'GET',
    url: '/contact/admin/messages',
    token: accessToken,
    expectedStatus: 200,
    assertion: (res) => {
      if (!res.data.success || !Array.isArray(res.data.data)) throw new Error('Expected array of messages');
    }
  });

  // Mark Message as Read
  await testEndpoint({
    name: `Mark Message as Read: PATCH /api/admin/messages/${createdMessageId}/read`,
    method: 'PATCH',
    url: `/admin/messages/${createdMessageId}/read`,
    token: accessToken,
    expectedStatus: 200,
    assertion: (res) => {
      if (!res.data.success || res.data.data?.read !== true) {
        throw new Error('Message read status was not set to true');
      }
    }
  });

  // Delete Message
  await testEndpoint({
    name: `Delete Message: DELETE /api/admin/messages/${createdMessageId}`,
    method: 'DELETE',
    url: `/admin/messages/${createdMessageId}`,
    token: accessToken,
    expectedStatus: 200,
    assertion: (res) => {
      if (!res.data.success) throw new Error('Failed to delete message');
    }
  });

  // ==========================================
  // 5. FULL CRUD: PROJECT MODEL
  // ==========================================
  console.log(`${colors.yellow}--- [5.1] CRUD: Project Model ---${colors.reset}`);

  const projectPayload = {
    title: { en: 'Audit Portfolio Web App', ar: 'تطبيق محفظة أعمال للتدقيق' },
    description: { en: 'Full-stack MERN application for testing', ar: 'تطبيق متكامل لاختبار التدقيق' },
    category: 'fullstack',
    stack: ['React', 'Node.js', 'MongoDB', 'Express'],
    links: {
      github: 'https://github.com/example/portfolio',
      frontend: 'https://example.com'
    },
    image: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    featured: true,
    order: 1
  };

  const projectCreateRes = await testEndpoint({
    name: 'Admin Create Project',
    method: 'POST',
    url: '/admin/projects',
    data: projectPayload,
    token: accessToken,
    expectedStatus: 201,
    assertion: (res) => {
      if (!res.data.success || !res.data.data?._id) throw new Error('Project creation failed');
    }
  });

  const testProjectId = projectCreateRes.data.data._id;

  await testEndpoint({
    name: `Get Project by ID: ${testProjectId}`,
    method: 'GET',
    url: `/projects/${testProjectId}`,
    expectedStatus: 200,
    assertion: (res) => {
      if (res.data.data?.title?.en !== projectPayload.title.en) throw new Error('Data mismatch');
    }
  });

  await testEndpoint({
    name: `Admin Update Project: ${testProjectId}`,
    method: 'PUT',
    url: `/admin/projects/${testProjectId}`,
    data: {
      title: { en: 'Audit Portfolio Web App (Updated)', ar: 'تطبيق محفظة أعمال للتدقيق (محدث)' },
      featured: false
    },
    token: accessToken,
    expectedStatus: 200,
    assertion: (res) => {
      if (res.data.data?.title?.en !== 'Audit Portfolio Web App (Updated)') {
        throw new Error('Project title was not updated');
      }
    }
  });

  await testEndpoint({
    name: `Admin Delete Project: ${testProjectId}`,
    method: 'DELETE',
    url: `/admin/projects/${testProjectId}`,
    token: accessToken,
    expectedStatus: 200
  });

  await testEndpoint({
    name: `Verify Deleted Project: ${testProjectId}`,
    method: 'GET',
    url: `/projects/${testProjectId}`,
    expectedStatus: 404
  });

  // ==========================================
  // 6. FULL CRUD: SKILL MODEL
  // ==========================================
  console.log(`${colors.yellow}--- [5.2] CRUD: Skill Model ---${colors.reset}`);

  const skillPayload = {
    name: 'TypeScript',
    category: 'Frontend',
    icon: 'typescript',
    order: 10
  };

  const skillCreateRes = await testEndpoint({
    name: 'Admin Create Skill',
    method: 'POST',
    url: '/admin/skills',
    data: skillPayload,
    token: accessToken,
    expectedStatus: 201,
    assertion: (res) => {
      if (!res.data.success || !res.data.data?._id) throw new Error('Skill creation failed');
    }
  });

  const testSkillId = skillCreateRes.data.data._id;

  await testEndpoint({
    name: `Get Skill by ID: ${testSkillId}`,
    method: 'GET',
    url: `/skills/${testSkillId}`,
    expectedStatus: 200
  });

  await testEndpoint({
    name: `Admin Update Skill: ${testSkillId}`,
    method: 'PUT',
    url: `/admin/skills/${testSkillId}`,
    data: { name: 'TypeScript & JavaScript', order: 12 },
    token: accessToken,
    expectedStatus: 200,
    assertion: (res) => {
      if (res.data.data?.name !== 'TypeScript & JavaScript') throw new Error('Skill name was not updated');
    }
  });

  await testEndpoint({
    name: `Admin Delete Skill: ${testSkillId}`,
    method: 'DELETE',
    url: `/admin/skills/${testSkillId}`,
    token: accessToken,
    expectedStatus: 200
  });

  await testEndpoint({
    name: `Verify Deleted Skill: ${testSkillId}`,
    method: 'GET',
    url: `/skills/${testSkillId}`,
    expectedStatus: 404
  });

  // ==========================================
  // 7. FULL CRUD: EXPERIENCE MODEL
  // ==========================================
  console.log(`${colors.yellow}--- [5.3] CRUD: Experience Model ---${colors.reset}`);

  const experiencePayload = {
    title: { en: 'Senior Full Stack Engineer', ar: 'مهندس برمجيات أول' },
    organization: { en: 'Tech Innovators Inc.', ar: 'شركة المبتكرين للتقنية' },
    startDate: '2023-01-15T00:00:00.000Z',
    endDate: null,
    description: {
      en: 'Architected scalable cloud services and microservices.',
      ar: 'بناء وتصميم خدمات سحابية قابلة للتوسع.'
    },
    order: 1
  };

  const expCreateRes = await testEndpoint({
    name: 'Admin Create Experience',
    method: 'POST',
    url: '/admin/experience',
    data: experiencePayload,
    token: accessToken,
    expectedStatus: 201,
    assertion: (res) => {
      if (!res.data.success || !res.data.data?._id) throw new Error('Experience creation failed');
    }
  });

  const testExpId = expCreateRes.data.data._id;

  await testEndpoint({
    name: `Get Experience by ID: ${testExpId}`,
    method: 'GET',
    url: `/experience/${testExpId}`,
    expectedStatus: 200
  });

  await testEndpoint({
    name: `Admin Update Experience: ${testExpId}`,
    method: 'PUT',
    url: `/admin/experience/${testExpId}`,
    data: {
      title: { en: 'Lead Full Stack Architect', ar: 'كبير معماريي البرمجيات' }
    },
    token: accessToken,
    expectedStatus: 200,
    assertion: (res) => {
      if (res.data.data?.title?.en !== 'Lead Full Stack Architect') {
        throw new Error('Experience title was not updated');
      }
    }
  });

  await testEndpoint({
    name: `Admin Delete Experience: ${testExpId}`,
    method: 'DELETE',
    url: `/admin/experience/${testExpId}`,
    token: accessToken,
    expectedStatus: 200
  });

  await testEndpoint({
    name: `Verify Deleted Experience: ${testExpId}`,
    method: 'GET',
    url: `/experience/${testExpId}`,
    expectedStatus: 404
  });

  // ==========================================
  // 8. FULL CRUD: CERTIFICATE MODEL
  // ==========================================
  console.log(`${colors.yellow}--- [5.4] CRUD: Certificate Model ---${colors.reset}`);

  const certificatePayload = {
    title: { en: 'AWS Certified Solutions Architect', ar: 'شهادة مهندس حلول أمازون المعتمد' },
    issuer: 'Amazon Web Services',
    date: '2023-08-01T00:00:00.000Z',
    credentialUrl: 'https://aws.amazon.com/verify/12345',
    image: 'https://res.cloudinary.com/demo/image/upload/aws-cert.png',
    order: 2
  };

  const certCreateRes = await testEndpoint({
    name: 'Admin Create Certificate',
    method: 'POST',
    url: '/admin/certificates',
    data: certificatePayload,
    token: accessToken,
    expectedStatus: 201,
    assertion: (res) => {
      if (!res.data.success || !res.data.data?._id) throw new Error('Certificate creation failed');
    }
  });

  const testCertId = certCreateRes.data.data._id;

  await testEndpoint({
    name: `Get Certificate by ID: ${testCertId}`,
    method: 'GET',
    url: `/certificates/${testCertId}`,
    expectedStatus: 200
  });

  await testEndpoint({
    name: `Admin Update Certificate: ${testCertId}`,
    method: 'PUT',
    url: `/admin/certificates/${testCertId}`,
    data: {
      issuer: 'AWS Training & Certification'
    },
    token: accessToken,
    expectedStatus: 200,
    assertion: (res) => {
      if (res.data.data?.issuer !== 'AWS Training & Certification') {
        throw new Error('Certificate issuer was not updated');
      }
    }
  });

  await testEndpoint({
    name: `Admin Delete Certificate: ${testCertId}`,
    method: 'DELETE',
    url: `/admin/certificates/${testCertId}`,
    token: accessToken,
    expectedStatus: 200
  });

  await testEndpoint({
    name: `Verify Deleted Certificate: ${testCertId}`,
    method: 'GET',
    url: `/certificates/${testCertId}`,
    expectedStatus: 404
  });

  // ==========================================
  // 9. FULL CRUD: BLOG POST MODEL
  // ==========================================
  console.log(`${colors.yellow}--- [5.5] CRUD: BlogPost Model ---${colors.reset}`);

  const blogPayload = {
    title: {
      en: 'Building Resilient Microservices with Node.js',
      ar: 'بناء خدمات مصغرة مرنة باستخدام نود جي إس'
    },
    excerpt: {
      en: 'A deep dive into architecture and design patterns.',
      ar: 'نظرة متعمقة على الأنماط والتصميم المعماري.'
    },
    content: {
      en: 'Detailed technical guide covering circuits, retries, and messaging.',
      ar: 'دليل تقني شامل يغطي قواطع الدوائر، وإعادة المحاولة والرسائل.'
    },
    tags: ['Architecture', 'Node.js', 'Microservices'],
    coverImage: 'https://res.cloudinary.com/demo/image/upload/blog-cover.jpg',
    externalUrl: 'https://medium.com/@dev/post-1',
    publishedAt: '2024-02-01T00:00:00.000Z'
  };

  const blogCreateRes = await testEndpoint({
    name: 'Admin Create Blog Post',
    method: 'POST',
    url: '/admin/blog',
    data: blogPayload,
    token: accessToken,
    expectedStatus: 201,
    assertion: (res) => {
      if (!res.data.success || !res.data.data?._id) throw new Error('Blog post creation failed');
    }
  });

  const testBlogId = blogCreateRes.data.data._id;

  await testEndpoint({
    name: `Get Blog Post by ID: ${testBlogId}`,
    method: 'GET',
    url: `/blog/${testBlogId}`,
    expectedStatus: 200
  });

  await testEndpoint({
    name: `Admin Update Blog Post: ${testBlogId}`,
    method: 'PUT',
    url: `/admin/blog/${testBlogId}`,
    data: {
      tags: ['Architecture', 'Node.js', 'Microservices', 'CleanCode']
    },
    token: accessToken,
    expectedStatus: 200,
    assertion: (res) => {
      if (!res.data.data?.tags?.includes('CleanCode')) {
        throw new Error('Tags were not updated');
      }
    }
  });

  await testEndpoint({
    name: `Admin Delete Blog Post: ${testBlogId}`,
    method: 'DELETE',
    url: `/admin/blog/${testBlogId}`,
    token: accessToken,
    expectedStatus: 200
  });

  await testEndpoint({
    name: `Verify Deleted Blog Post: ${testBlogId}`,
    method: 'GET',
    url: `/blog/${testBlogId}`,
    expectedStatus: 404
  });

  // ==========================================
  // 10. TOKEN ROTATION & LOGOUT FLOW
  // ==========================================
  console.log(`${colors.yellow}--- [6] Token Rotation & Session Termination ---${colors.reset}`);

  // Refresh Token Rotation (valid cookie)
  const refreshRes = await testEndpoint({
    name: 'Auth Token Refresh (Valid Cookie)',
    method: 'POST',
    url: '/auth/refresh',
    cookie: refreshTokenCookie,
    expectedStatus: 200,
    assertion: (res) => {
      if (!res.data.success || !res.data.data?.accessToken) throw new Error('Missing new accessToken');
      const rotatedRefreshToken = extractCookie(res.headers, 'refreshToken');
      if (!rotatedRefreshToken) throw new Error('Missing rotated refreshToken cookie in response');
    }
  });

  // Update tokens from rotated session
  if (refreshRes?.data?.data?.accessToken) {
    accessToken = refreshRes.data.data.accessToken;
    const newRefreshValue = extractCookie(refreshRes.headers, 'refreshToken');
    if (newRefreshValue) {
      refreshTokenCookie = `refreshToken=${newRefreshValue}`;
    }
  }

  // Refresh Token without Cookie (Negative)
  await testEndpoint({
    name: 'Auth Token Refresh without Cookie (Negative)',
    method: 'POST',
    url: '/auth/refresh',
    expectedStatus: 401,
    assertion: (res) => {
      if (res.data.success !== false) throw new Error('Expected 401 Unauthorized');
    }
  });

  // Logout
  await testEndpoint({
    name: 'Admin Logout',
    method: 'POST',
    url: '/auth/logout',
    cookie: refreshTokenCookie,
    expectedStatus: 200,
    assertion: (res) => {
      if (!res.data.success) throw new Error('Logout failed');
    }
  });

  // ==========================================
  // FINAL RESULTS SUMMARY & PROCESS EXIT
  // ==========================================
  console.log(`${colors.yellow}${colors.bold}===========================================${colors.reset}`);
  console.log(`${colors.yellow}${colors.bold}              Test Run Summary             ${colors.reset}`);
  console.log(`${colors.yellow}${colors.bold}===========================================${colors.reset}`);
  console.log(`${colors.green}Total Passed: ${passed}${colors.reset}`);
  if (failed > 0) {
    console.log(`${colors.red}Total Failed: ${failed}${colors.reset}`);
    console.log(`\n${colors.red}${colors.bold}❌ Test suite FAILED. Exiting with code 1.${colors.reset}\n`);
    process.exit(1);
  } else {
    console.log(`${colors.green}Total Failed: 0${colors.reset}`);
    console.log(`\n${colors.green}${colors.bold}✅ All tests PASSED successfully (100% Green). Exiting with code 0.${colors.reset}\n`);
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error(`${colors.red}Fatal test suite execution error: ${err.message}${colors.reset}`);
  process.exit(1);
});
