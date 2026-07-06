import axios from 'axios';
import 'dotenv/config';

const BASE_URL = `http://localhost:${process.env.PORT || 5000}/api`;

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
};

async function testEndpoint(name, method, url, data = null, token = null) {
  console.log(`${colors.cyan}Testing ${name}...${colors.reset}`);
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      data,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    };
    const response = await axios(config);
    console.log(`${colors.green}✅ PASS: ${response.status} ${JSON.stringify(response.data)}${colors.reset}\n`);
    return response;
  } catch (error) {
    const status = error.response ? error.response.status : 'NETWORK_ERROR';
    const message = error.response ? JSON.stringify(error.response.data) : error.message;
    console.log(`${colors.red}❌ FAIL: ${status} ${message}${colors.reset}\n`);
    return null;
  }
}

async function runTests() {
  console.log(`${colors.yellow}🚀 Starting API Integration Tests...${colors.reset}\n`);

  // 1. Public GET Endpoints
  await testEndpoint('Health Check', 'GET', '/health');
  await testEndpoint('Get Projects', 'GET', '/projects');
  await testEndpoint('Get Skills', 'GET', '/skills');
  await testEndpoint('Get Experience', 'GET', '/experience');
  await testEndpoint('Get Certificates', 'GET', '/certificates');
  await testEndpoint('Get Blog', 'GET', '/blog');

  // 2. Public POST - Contact
  await testEndpoint('Submit Contact Form', 'POST', '/contact', {
    name: 'Test User',
    email: 'test@example.com',
    message: 'This is a test message',
  });

  // 3. Auth Flow
  console.log(`${colors.yellow}--- Testing Auth Flow ---${colors.reset}`);
  const loginRes = await testEndpoint('Admin Login', 'POST', '/auth/login', {
    email: 'admin@portfolio.com',
    password: 'Admin@123456',
  });

  if (!loginRes) {
    console.log(`${colors.red}Critical: Login failed. Cannot test protected routes.${colors.reset}`);
    return;
  }

  const accessToken = loginRes.data.data.accessToken;
  const refreshToken = loginRes.data.data.refreshToken; // This is usually in a cookie, but some return it in body for testing

  // 4. Protected Admin Routes
  console.log(`${colors.yellow}--- Testing Protected Admin Routes ---${colors.reset}`);
  
  // Test if token works
  await testEndpoint('Admin Get Messages', 'GET', '/admin/messages', null, accessToken);

  // Test CRUD (Create a dummy project)
  const newProject = {
    title: { en: 'Test Project', ar: 'مشروع تجريبي' },
    description: { en: 'Testing API', ar: 'تجربة الواجهة' },
    category: 'simple',
    stack: ['Test'],
    links: { github: 'https://github.com/' },
    image: 'https://res.cloudinary.com/demo/image/upload/v1/test.jpg',
    featured: false,
    order: 99,
  };
  
  const createRes = await testEndpoint('Admin Create Project', 'POST', '/admin/projects', newProject, accessToken);
  
  if (createRes) {
    const projectId = createRes.data.data._id;
    await testEndpoint(`Admin Get Project ${projectId}`, 'GET', `/projects/${projectId}`);
    await testEndpoint(`Admin Update Project ${projectId}`, 'PUT', `/admin/projects/${projectId}`, {
      title: { en: 'Updated Test Project', ar: 'مشروع تجريبي محدث' },
    }, accessToken);
    await testEndpoint(`Admin Delete Project ${projectId}`, 'DELETE', `/admin/projects/${projectId}`, null, accessToken);
  }

  // 5. Auth Refresh/Logout
  console.log(`${colors.yellow}--- Testing Token Lifecycle ---${colors.reset}`);
  
  // Refresh test (Note: backend uses cookies for refresh, so this test might fail without cookie handling)
  await testEndpoint('Auth Refresh', 'POST', '/auth/refresh');

  await testEndpoint('Auth Logout', 'POST', '/auth/logout');

  console.log(`${colors.yellow}🚀 API Tests Completed.${colors.reset}`);
}

runTests().catch(err => console.error('Unexpected error during tests:', err));
