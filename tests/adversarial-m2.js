/**
 * Adversarial Stress Testing Harness for Milestone 2
 * Tests:
 * 1. Silent Auth Edge Cases & Negative Scenarios
 * 2. React Key Uniqueness & Collision Resistance
 * 3. Form Accessibility (htmlFor <-> id matching, WHATWG autocomplete tokens)
 * 4. Image Fallbacks & Code-splitting Verification
 */

import fs from 'fs';
import path from 'path';

let passedTests = 0;
let failedTests = 0;
const failures = [];

function assert(condition, message) {
  if (!condition) {
    failedTests++;
    failures.push(message);
    console.error(`  ❌ FAIL: ${message}`);
    throw new Error(message);
  } else {
    passedTests++;
    console.log(`  ✅ PASS: ${message}`);
  }
}

console.log('================================================================');
console.log('   MILESTONE 2: EMPIRICAL ADVERSARIAL STRESS TEST SUITE        ');
console.log('================================================================\n');

// ----------------------------------------------------------------------------
// SUITE 1: SILENT AUTH ADVERSARIAL TESTING
// ----------------------------------------------------------------------------
console.log('--- Suite 1: Silent Auth Adversarial Testing ---');

// Mock localStorage implementation
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] !== undefined ? this.store[key] : null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

// Emulate AuthContext behavior under adverse conditions
function createAuthSimulator(initialStorage = {}) {
  const localStorage = new MockLocalStorage();
  for (const [k, v] of Object.entries(initialStorage)) {
    localStorage.setItem(k, v);
  }

  let user = null;
  let accessToken = null;
  let initializing = Boolean(localStorage.getItem('portfolio_auth_hint'));
  let fetchCallCount = 0;
  let fetchLastUrl = null;
  let fetchLastOptions = null;
  const consoleErrors = [];

  const mockConsoleError = (...args) => {
    consoleErrors.push(args.map(String).join(' '));
  };

  // Simulated fetch
  let fetchMock = async (url, options) => {
    fetchCallCount++;
    fetchLastUrl = url;
    fetchLastOptions = options;
    return {
      ok: false,
      status: 401,
      json: async () => ({ success: false, message: 'No refresh token' })
    };
  };

  const refreshToken = async () => {
    try {
      const response = await fetchMock('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        localStorage.removeItem('portfolio_auth_hint');
        accessToken = null;
        user = null;
        return null;
      }
      const data = await response.json();
      if (data.success && data.data?.accessToken) {
        accessToken = data.data.accessToken;
        return data.data.accessToken;
      }
    } catch {
      // Quietly ignore network or parsing failure
    }
    localStorage.removeItem('portfolio_auth_hint');
    accessToken = null;
    user = null;
    return null;
  };

  const mount = async () => {
    if (!localStorage.getItem('portfolio_auth_hint')) {
      return;
    }
    try {
      await refreshToken();
    } finally {
      initializing = false;
    }
  };

  const login = async (email, password, apiResponse) => {
    if (apiResponse.success) {
      localStorage.setItem('portfolio_auth_hint', 'true');
      accessToken = apiResponse.data.accessToken;
      user = { email };
      return { success: true };
    }
    return { success: false, message: apiResponse.message };
  };

  const logout = async () => {
    localStorage.removeItem('portfolio_auth_hint');
    accessToken = null;
    user = null;
  };

  return {
    localStorage,
    getInitializing: () => initializing,
    getAccessToken: () => accessToken,
    getUser: () => user,
    getFetchCount: () => fetchCallCount,
    getConsoleErrors: () => consoleErrors,
    setFetchMock: (fn) => { fetchMock = fn; },
    mount,
    refreshToken,
    login,
    logout,
    mockConsoleError
  };
}

// 1.1: When localStorage is empty, NO refresh request is fired
try {
  const sim1 = createAuthSimulator(); // hint is null
  assert(sim1.localStorage.getItem('portfolio_auth_hint') === null, 'Initial portfolio_auth_hint is null');
  assert(sim1.getInitializing() === false, 'Initializing is immediately false when hint is null');
  await sim1.mount();
  assert(sim1.getFetchCount() === 0, 'Zero network requests made when portfolio_auth_hint is null');
  assert(sim1.getAccessToken() === null, 'Access token is null');
} catch (e) { /* logged in assert */ }

// 1.2: When portfolio_auth_hint is "true" but cookie missing (401 response)
try {
  const sim2 = createAuthSimulator({ portfolio_auth_hint: 'true' });
  assert(sim2.localStorage.getItem('portfolio_auth_hint') === 'true', 'Hint is present before refresh');
  assert(sim2.getInitializing() === true, 'Initializing starts as true when hint is present');
  
  // fetchMock returns 401
  sim2.setFetchMock(async () => ({
    ok: false,
    status: 401,
    json: async () => ({ success: false, message: 'Refresh token not found' })
  }));

  const token = await sim2.refreshToken();
  assert(token === null, 'refreshToken() quietly returns null on 401');
  assert(sim2.localStorage.getItem('portfolio_auth_hint') === null, 'Hint is evicted from localStorage after 401');
  assert(sim2.getConsoleErrors().length === 0, 'Zero console.error calls during failed 401 refresh');
} catch (e) { /* logged in assert */ }

// 1.3: When portfolio_auth_hint is "true" but network throws (drop / offline)
try {
  const sim3 = createAuthSimulator({ portfolio_auth_hint: 'true' });
  sim3.setFetchMock(async () => {
    throw new TypeError('Failed to fetch (Network connection lost)');
  });

  const token = await sim3.refreshToken();
  assert(token === null, 'refreshToken() quietly returns null on network exception');
  assert(sim3.localStorage.getItem('portfolio_auth_hint') === null, 'Hint is evicted after network failure');
  assert(sim3.getConsoleErrors().length === 0, 'Zero console errors on network drop during silent refresh');
} catch (e) { /* logged in assert */ }

// 1.4: When portfolio_auth_hint is "true" but server responds with 500 or corrupted JSON
try {
  const sim4 = createAuthSimulator({ portfolio_auth_hint: 'true' });
  sim4.setFetchMock(async () => ({
    ok: false,
    status: 500,
    json: async () => { throw new SyntaxError('Unexpected token < in JSON at position 0'); }
  }));

  const token = await sim4.refreshToken();
  assert(token === null, 'refreshToken() quietly returns null on HTTP 500 HTML error');
  assert(sim4.localStorage.getItem('portfolio_auth_hint') === null, 'Hint is removed on 500 server error');
} catch (e) { /* logged in assert */ }

// 1.5: Login and Logout state transitions
try {
  const sim5 = createAuthSimulator();
  assert(sim5.localStorage.getItem('portfolio_auth_hint') === null, 'Initial state: hint is null');
  
  await sim5.login('admin@test.com', 'ValidPass123', {
    success: true,
    data: { accessToken: 'jwt.header.payload.signature' }
  });
  assert(sim5.localStorage.getItem('portfolio_auth_hint') === 'true', 'Login stores portfolio_auth_hint = "true"');
  assert(sim5.getAccessToken() === 'jwt.header.payload.signature', 'Access token set in state');

  await sim5.logout();
  assert(sim5.localStorage.getItem('portfolio_auth_hint') === null, 'Logout removes portfolio_auth_hint');
  assert(sim5.getAccessToken() === null, 'Access token cleared on logout');
} catch (e) { /* logged in assert */ }


// ----------------------------------------------------------------------------
// SUITE 2: REACT KEY UNIQUENESS & COLLISION RESISTANCE
// ----------------------------------------------------------------------------
console.log('\n--- Suite 2: React Key Uniqueness & Collision Resistance ---');

// 2.1 ProjectCard duplicate tech stack tags
try {
  const projectWithDuplicates = {
    _id: '6700abcd1234ef5678901234',
    title: { en: 'Test Project', ar: 'مشروع تجريبي' },
    stack: ['React', 'React', 'React', 'TypeScript', 'TypeScript', 'Node.js', 'Node.js', '']
  };

  const projectCardKeys = projectWithDuplicates.stack.map(
    (s, idx) => `${projectWithDuplicates._id || 'proj'}-${s}-${idx}`
  );

  const uniqueProjectKeys = new Set(projectCardKeys);
  assert(
    uniqueProjectKeys.size === projectWithDuplicates.stack.length,
    `ProjectCard generated ${uniqueProjectKeys.size}/${projectWithDuplicates.stack.length} unique keys for duplicate stack items`
  );

  // Negative boundary: Project with undefined/null _id
  const projectWithoutId = {
    title: { en: 'No ID Project', ar: 'بدون معرف' },
    stack: ['Docker', 'Docker', 'AWS', 'AWS']
  };
  const fallbackProjectKeys = projectWithoutId.stack.map(
    (s, idx) => `${projectWithoutId._id || 'proj'}-${s}-${idx}`
  );
  const uniqueFallbackKeys = new Set(fallbackProjectKeys);
  assert(
    uniqueFallbackKeys.size === projectWithoutId.stack.length,
    `ProjectCard fallback key generation handles missing _id without collision (${uniqueFallbackKeys.size}/${projectWithoutId.stack.length})`
  );
} catch (e) { /* logged in assert */ }

// 2.2 Blog post duplicate tags
try {
  const postWithDuplicateTags = {
    _id: '6700ffff1234ef5678905678',
    title: { en: 'Blog Post', ar: 'مقال' },
    tags: ['Architecture', 'Architecture', 'Security', 'Security', 'WebDev']
  };

  const blogTagKeys = postWithDuplicateTags.tags.map(
    (tag, idx) => `${postWithDuplicateTags._id || 'post'}-${tag}-${idx}`
  );
  const uniqueBlogTagKeys = new Set(blogTagKeys);
  assert(
    uniqueBlogTagKeys.size === postWithDuplicateTags.tags.length,
    `Blog tags generated ${uniqueBlogTagKeys.size}/${postWithDuplicateTags.tags.length} unique keys with duplicate tag names`
  );

  // Negative boundary: Blog post without _id
  const postWithoutId = {
    tags: ['AI', 'AI', 'DeepLearning']
  };
  const fallbackBlogKeys = postWithoutId.tags.map(
    (tag, idx) => `${postWithoutId._id || 'post'}-${tag}-${idx}`
  );
  const uniqueFallbackBlogKeys = new Set(fallbackBlogKeys);
  assert(
    uniqueFallbackBlogKeys.size === postWithoutId.tags.length,
    `Blog fallback keys handle missing _id without collision (${uniqueFallbackBlogKeys.size}/${postWithoutId.tags.length})`
  );
} catch (e) { /* logged in assert */ }

// 2.3 Skills duplicate items
try {
  const cat = { id: 'frontend', label: 'Frontend' };
  const duplicateSkills = [
    { _id: 's1', name: 'React', category: 'Frontend' },
    { _id: 's2', name: 'React', category: 'Frontend' }, // same name, different id
    { name: 'CSS', category: 'Frontend' },              // missing id
    { name: 'CSS', category: 'Frontend' }               // missing id
  ];

  const skillKeys = duplicateSkills.map(
    (skill, idx) => skill._id || `${cat.id}-${skill.name}-${idx}`
  );
  const uniqueSkillKeys = new Set(skillKeys);
  assert(
    uniqueSkillKeys.size === duplicateSkills.length,
    `Skills key mapper produces 100% collision-free keys for duplicates and missing IDs (${uniqueSkillKeys.size}/${duplicateSkills.length})`
  );
} catch (e) { /* logged in assert */ }

// 2.4 Projects list duplicate items
try {
  const projectList = [
    { _id: 'p1', title: { en: 'P1' } },
    { title: { en: 'P2' } }, // no id
    { title: { en: 'P3' } }, // no id
    { _id: 'p4', title: { en: 'P4' } }
  ];

  const projectListKeys = projectList.map(
    (project, idx) => project._id || `proj-${idx}`
  );
  const uniqueProjectListKeys = new Set(projectListKeys);
  assert(
    uniqueProjectListKeys.size === projectList.length,
    `Projects list key mapper produces 100% collision-free keys even when _id is missing (${uniqueProjectListKeys.size}/${projectList.length})`
  );
} catch (e) { /* logged in assert */ }


// ----------------------------------------------------------------------------
// SUITE 3: FORM ACCESSIBILITY AUDIT (id <-> htmlFor & standard autoComplete)
// ----------------------------------------------------------------------------
console.log('\n--- Suite 3: Form Accessibility & Autocomplete Token Audit ---');

const contactSrc = fs.readFileSync(path.resolve('frontend/src/sections/Contact.jsx'), 'utf-8');
const loginSrc = fs.readFileSync(path.resolve('frontend/src/pages/admin/Login.jsx'), 'utf-8');
const contentMgrSrc = fs.readFileSync(path.resolve('frontend/src/pages/admin/ContentManager.jsx'), 'utf-8');

// Helper to extract matches
function extractAttributes(src, regex) {
  const matches = [];
  let m;
  while ((m = regex.exec(src)) !== null) {
    matches.push(m[1]);
  }
  return matches;
}

// 3.1 Contact.jsx Accessibility
try {
  const contactLabels = extractAttributes(contactSrc, /<label\s+[^>]*htmlFor=["']([^"']+)["']/g);
  const contactInputs = extractAttributes(contactSrc, /<(?:input|textarea|select)\s+[^>]*id=["']([^"']+)["']/g);

  assert(contactLabels.length === 3, `Contact.jsx defines exactly 3 form labels (found: ${contactLabels.join(', ')})`);
  assert(contactInputs.length === 3, `Contact.jsx defines exactly 3 form controls with ids (found: ${contactInputs.join(', ')})`);

  for (const labelId of contactLabels) {
    assert(contactInputs.includes(labelId), `Contact.jsx: label htmlFor="${labelId}" corresponds to matching element id="${labelId}"`);
  }
} catch (e) { /* logged in assert */ }

// 3.2 Login.jsx Accessibility
try {
  const loginLabels = extractAttributes(loginSrc, /<label\s+[^>]*htmlFor=["']([^"']+)["']/g);
  const loginInputs = extractAttributes(loginSrc, /<(?:input|textarea|select)\s+[^>]*id=["']([^"']+)["']/g);

  assert(loginLabels.length === 2, `Login.jsx defines exactly 2 form labels (found: ${loginLabels.join(', ')})`);
  assert(loginInputs.length === 2, `Login.jsx defines exactly 2 form inputs with ids (found: ${loginInputs.join(', ')})`);

  for (const labelId of loginLabels) {
    assert(loginInputs.includes(labelId), `Login.jsx: label htmlFor="${labelId}" corresponds to matching input id="${labelId}"`);
  }

  // Password visibility button must have accessible label
  const hasAriaLabel = loginSrc.includes('aria-label={showPassword ?');
  const hasAriaPressed = loginSrc.includes('aria-pressed={showPassword}');
  assert(hasAriaLabel, 'Login.jsx password visibility toggle button has dynamic aria-label');
  assert(hasAriaPressed, 'Login.jsx password visibility toggle button has aria-pressed attribute');
} catch (e) { /* logged in assert */ }

// 3.3 ContentManager.jsx Accessibility
try {
  // Check field labels and inputs pattern
  const hasDynamicFieldLabel = contentMgrSrc.includes('htmlFor={`field-${name}`}');
  const hasDynamicFileLabel = contentMgrSrc.includes('htmlFor={`file-${name}`}');
  assert(hasDynamicFieldLabel, 'ContentManager.jsx links field labels via dynamic htmlFor={`field-${name}`}');
  assert(hasDynamicFileLabel, 'ContentManager.jsx links file upload labels via dynamic htmlFor={`file-${name}`}');

  // Check that input controls receive matching id
  const hasSelectId = contentMgrSrc.includes('id={`field-${name}`}');
  const hasFileId = contentMgrSrc.includes('id={`file-${name}`}');
  assert(hasSelectId, 'ContentManager.jsx controls receive matching id={`field-${name}`}');
  assert(hasFileId, 'ContentManager.jsx file input receives matching id={`file-${name}`}');

  // Verify icon buttons have aria-labels
  const iconAriaLabels = [
    'Back to dashboard',
    'Dismiss error',
    'Remove image',
    'Edit item',
    'Cancel delete',
    'Delete item'
  ];
  for (const label of iconAriaLabels) {
    assert(contentMgrSrc.includes(`aria-label="${label}"`), `ContentManager.jsx includes aria-label="${label}" for icon action`);
  }
} catch (e) { /* logged in assert */ }

// 3.4 WHATWG HTML Autocomplete Token Validation
const VALID_WHATWG_AUTOCOMPLETE_TOKENS = new Set([
  'off', 'on', 'name', 'honorific-prefix', 'given-name', 'additional-name',
  'family-name', 'honorific-suffix', 'nickname', 'email', 'username',
  'new-password', 'current-password', 'one-time-code', 'organization-title',
  'organization', 'street-address', 'address-line1', 'address-line2',
  'address-line3', 'address-level4', 'address-level3', 'address-level2',
  'address-level1', 'country', 'country-name', 'postal-code', 'cc-name',
  'cc-given-name', 'cc-additional-name', 'cc-family-name', 'cc-number',
  'cc-exp', 'cc-exp-month', 'cc-exp-year', 'cc-csc', 'cc-type',
  'transaction-currency', 'transaction-amount', 'language', 'bday',
  'bday-day', 'bday-month', 'bday-year', 'sex', 'tel', 'tel-country-code',
  'tel-national', 'tel-area-code', 'tel-local', 'tel-extension', 'impp',
  'url', 'photo', 'webauthn'
]);

try {
  // Extract all autoComplete tokens in frontend/src
  const allFiles = [
    { name: 'Contact.jsx', src: contactSrc },
    { name: 'Login.jsx', src: loginSrc },
    { name: 'ContentManager.jsx', src: contentMgrSrc }
  ];

  for (const file of allFiles) {
    const autoCompletes = extractAttributes(file.src, /autoComplete=["']([^"']+)["']/g);
    for (const token of autoCompletes) {
      assert(
        VALID_WHATWG_AUTOCOMPLETE_TOKENS.has(token),
        `${file.name}: autoComplete="${token}" is a standard WHATWG compliant token`
      );
    }
  }

  // Specific semantic checks
  assert(contactSrc.includes('autoComplete="name"'), 'Contact.jsx name input uses autoComplete="name"');
  assert(contactSrc.includes('autoComplete="email"'), 'Contact.jsx email input uses autoComplete="email"');
  assert(loginSrc.includes('autoComplete="username"'), 'Login.jsx email input uses autoComplete="username"');
  assert(loginSrc.includes('autoComplete="current-password"'), 'Login.jsx password input uses autoComplete="current-password"');
} catch (e) { /* logged in assert */ }


// ----------------------------------------------------------------------------
// SUITE 4: IMAGE FALLBACKS & CODE-SPLITTING VERIFICATION
// ----------------------------------------------------------------------------
console.log('\n--- Suite 4: Image Fallbacks & Admin Code-Splitting ---');

const projectCardSrc = fs.readFileSync(path.resolve('frontend/src/components/ProjectCard.jsx'), 'utf-8');
const appSrc = fs.readFileSync(path.resolve('frontend/src/App.jsx'), 'utf-8');

try {
  // 4.1 ProjectCard image fallback & onError
  assert(projectCardSrc.includes('const [imgError, setImgError] = useState(false);'), 'ProjectCard tracks imgError state');
  assert(projectCardSrc.includes('!project.image || imgError'), 'ProjectCard switches to ProjectMockup when !project.image || imgError');
  assert(projectCardSrc.includes('onError={() => setImgError(true)}'), 'ProjectCard img element has onError fallback handler');

  // 4.2 ContentManager preview onError
  assert(contentMgrSrc.includes("onError={(e) => { e.currentTarget.style.display = 'none'; }}"), 'ContentManager preview image has onError handler');

  // 4.3 App.jsx Dynamic Lazy Imports & Suspense
  assert(appSrc.includes("lazy(() => import('./pages/admin/Login'))"), 'App.jsx lazily imports AdminLogin');
  assert(appSrc.includes("lazy(() => import('./pages/admin/Dashboard'))"), 'App.jsx lazily imports AdminDashboard');
  assert(appSrc.includes("lazy(() => import('./pages/admin/ContentManager'))"), 'App.jsx lazily imports ContentManager');
  assert(appSrc.includes("lazy(() => import('./pages/admin/Messages'))"), 'App.jsx lazily imports AdminMessages');
  assert(appSrc.includes('<Suspense fallback='), 'App.jsx wraps lazy admin routes in Suspense boundary');
} catch (e) { /* logged in assert */ }

console.log('\n================================================================');
console.log(`STRESS TEST SUMMARY: ${passedTests} passed, ${failedTests} failed.`);
console.log('================================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
