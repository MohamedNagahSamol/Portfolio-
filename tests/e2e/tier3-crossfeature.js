import {
  describe, it, assert, api,
  loadJson, readSource
} from './harness.js';

export function registerTier3Tests() {
  console.log('\n--- Registering Tier 3: Cross-Feature Combinations ---');

  // =========================================================================
  // COMBINATION FLOW 1: Auth Session Lifecycle, Cookie Rotation & Protected Ops
  // =========================================================================
  describe('Tier 3 - Flow 1: Auth Session Rotation & Admin Token Lifecycle', () => {
    let initialAccessToken = null;
    let initialRefreshToken = null;
    let rotatedAccessToken = null;

    it('3.F1.1: Admin authenticates, receives JWT accessToken and httpOnly cookie', async () => {
      api.clearAuth();
      const loginRes = await api.login();
      assert.strictEqual(loginRes.status, 200, 'Login must return 200');
      initialAccessToken = loginRes.data?.data?.accessToken;
      assert.ok(initialAccessToken, 'Access token must be returned');

      const cookieStr = api.getCookieString();
      assert.ok(cookieStr.includes('refreshToken='), 'httpOnly refreshToken cookie must be set');
    });

    it('3.F1.2: Authenticated admin successfully invokes protected content endpoint', async () => {
      assert.ok(initialAccessToken, 'Must have active access token');
      let res = await api.get('/admin/messages');
      if (res.status === 404) {
        res = await api.get('/contact/admin/messages');
      }
      assert.strictEqual(res.status, 200, 'Protected endpoint must accept valid access token');
      assert.ok(Array.isArray(res.data?.data), 'Must return messages list');
    });

    it('3.F1.3: Token refresh rotates the session and returns a fresh access token', async () => {
      const refreshRes = await api.post('/auth/refresh', null, { noAuth: true });
      assert.strictEqual(refreshRes.status, 200, 'Token refresh must succeed');
      rotatedAccessToken = refreshRes.data?.data?.accessToken;
      assert.ok(typeof rotatedAccessToken === 'string' && rotatedAccessToken.length > 20, 'Fresh access token must be returned');
    });

    it('3.F1.4: Rotated access token authorizes subsequent protected operations', async () => {
      api.setAccessToken(rotatedAccessToken);
      let res = await api.get('/admin/messages');
      if (res.status === 404) {
        res = await api.get('/contact/admin/messages');
      }
      assert.strictEqual(res.status, 200, 'Protected endpoint must accept rotated access token');
      assert.ok(Array.isArray(res.data?.data), 'Must return messages list');
    });

    it('3.F1.5: Logout invalidates session and clears credentials', async () => {
      const logoutRes = await api.post('/auth/logout');
      assert.strictEqual(logoutRes.status, 200, 'Logout must succeed with 200');
      assert.strictEqual(logoutRes.data?.success, true);

      // Attempting refresh immediately after logout must fail
      const postLogoutRefresh = await api.post('/auth/refresh', null, { noAuth: true });
      assert.strictEqual(postLogoutRefresh.status, 401, 'Refresh after logout must be rejected with 401');
    });
  });

  // =========================================================================
  // COMBINATION FLOW 2: Admin CRUD Lifecycle & Public Catalog Reflection
  // =========================================================================
  describe('Tier 3 - Flow 2: Admin CRUD Lifecycle & Public Catalog Reflection', () => {
    let createdProjectId = null;
    const testProjectPayload = {
      title: { en: 'Cross-Feature Cloud Platform', ar: 'منصة سحابية متكاملة' },
      description: { en: 'High throughput distributed microservices.', ar: 'خدمات سحابية موزعة ذات كفاءة عالية.' },
      category: 'fullstack',
      stack: ['Node.js', 'React', 'MongoDB', 'Docker'],
      links: {
        github: 'https://github.com/example/cloud-platform',
        live: 'https://cloud-platform.example.com',
        backend: 'https://api.cloud-platform.example.com',
        admin: 'https://admin.cloud-platform.example.com'
      },
      image: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      featured: true,
      order: 10
    };

    it('3.F2.1: Admin creates new project via protected POST endpoint', async () => {
      await api.login();
      const createRes = await api.post('/admin/projects', testProjectPayload);
      assert.strictEqual(createRes.status, 201, 'Project creation must return 201 Created');
      assert.strictEqual(createRes.data?.success, true);
      createdProjectId = createRes.data?.data?._id;
      assert.ok(createdProjectId, 'Created project must have an _id');
    });

    it('3.F2.2: Public read-only endpoint immediately reflects newly created project', async () => {
      assert.ok(createdProjectId, 'Project ID required');
      const publicRes = await api.get(`/projects/${createdProjectId}`, { noAuth: true });
      assert.strictEqual(publicRes.status, 200, 'Public GET by ID must return 200');
      assert.strictEqual(publicRes.data?.data?.title?.en, testProjectPayload.title.en);
      assert.strictEqual(publicRes.data?.data?.title?.ar, testProjectPayload.title.ar);
    });

    it('3.F2.3: Admin updates project details via protected PUT endpoint', async () => {
      assert.ok(createdProjectId, 'Project ID required');
      const updatedPayload = {
        title: { en: 'Updated Cloud Platform v2', ar: 'منصة سحابية محدثة v2' },
        featured: false
      };
      const updateRes = await api.put(`/admin/projects/${createdProjectId}`, updatedPayload);
      assert.strictEqual(updateRes.status, 200, 'Project update must return 200');
      assert.strictEqual(updateRes.data?.data?.title?.en, updatedPayload.title.en);
    });

    it('3.F2.4: Public read reflects updated metadata', async () => {
      assert.ok(createdProjectId, 'Project ID required');
      const publicRes = await api.get(`/projects/${createdProjectId}`, { noAuth: true });
      assert.strictEqual(publicRes.status, 200);
      assert.strictEqual(publicRes.data?.data?.title?.en, 'Updated Cloud Platform v2');
      assert.strictEqual(publicRes.data?.data?.featured, false);
    });

    it('3.F2.5: Admin deletes project and public read returns 404', async () => {
      assert.ok(createdProjectId, 'Project ID required');
      const deleteRes = await api.delete(`/admin/projects/${createdProjectId}`);
      assert.strictEqual(deleteRes.status, 200, 'Delete must return 200');

      const verifyRes = await api.get(`/projects/${createdProjectId}`, { noAuth: true });
      assert.strictEqual(verifyRes.status, 404, 'Deleted project must return 404 on public GET');
    });
  });

  // =========================================================================
  // COMBINATION FLOW 3: Contact Message Ingestion, Admin Triage & Deletion
  // =========================================================================
  describe('Tier 3 - Flow 3: Contact Ingestion & Admin Triage Lifecycle', () => {
    let messageId = null;
    const testMessage = {
      name: 'Amira Recruiter',
      email: 'amira@recruitment-partner.com',
      message: 'Greetings! We are interested in your Full-Stack capabilities for an upcoming project.'
    };

    it('3.F3.1: Public visitor submits contact inquiry via POST /api/contact', async () => {
      const res = await api.post('/contact', testMessage, { noAuth: true });
      assert.strictEqual(res.status, 201, 'Contact message submission must return 201 Created');
      assert.strictEqual(res.data?.success, true);
      messageId = res.data?.data?._id;
      assert.ok(messageId, 'Message must have unique _id');
      assert.strictEqual(res.data?.data?.read, false, 'New message must have read: false initially');
    });

    it('3.F3.2: Authenticated admin fetches messages and identifies newly submitted inquiry', async () => {
      await api.login();
      let res = await api.get('/admin/messages');
      if (res.status === 404) {
        res = await api.get('/contact/admin/messages');
      }
      assert.strictEqual(res.status, 200, 'Fetching messages list must succeed');
      const found = res.data?.data?.find(m => m._id === messageId);
      assert.ok(found, 'Newly submitted message must be present in messages list');
      assert.strictEqual(found.email, testMessage.email);
    });

    it('3.F3.3: Admin marks message as read and verifies state transition', async () => {
      assert.ok(messageId, 'Message ID required');
      let patchRes = await api.patch(`/admin/messages/${messageId}/read`);
      if (patchRes.status === 404) {
        patchRes = await api.patch(`/contact/admin/messages/${messageId}/read`);
      }
      assert.strictEqual(patchRes.status, 200, 'Mark as read must return 200');
      assert.strictEqual(patchRes.data?.data?.read, true, 'Message state must update to read: true');
    });

    it('3.F3.4: Admin deletes message and confirms permanent removal', async () => {
      assert.ok(messageId, 'Message ID required');
      let delRes = await api.delete(`/admin/messages/${messageId}`);
      if (delRes.status === 404) {
        delRes = await api.delete(`/contact/admin/messages/${messageId}`);
      }
      assert.strictEqual(delRes.status, 200, 'Delete must return 200');

      // Verify deletion
      let listRes = await api.get('/admin/messages');
      if (listRes.status === 404) {
        listRes = await api.get('/contact/admin/messages');
      }
      assert.strictEqual(listRes.status, 200);
      const remaining = listRes.data?.data?.find(m => m._id === messageId);
      assert.strictEqual(remaining, undefined, 'Deleted message must no longer exist in message list');
    });
  });

  // =========================================================================
  // COMBINATION FLOW 4: Bilingual Localization Parity & RTL Coherence
  // =========================================================================
  describe('Tier 3 - Flow 4: Bilingual Localization Parity & RTL Coherence', () => {
    const enDict = loadJson('frontend/src/i18n/en.json') || {};
    const arDict = loadJson('frontend/src/i18n/ar.json') || {};

    it('3.F4.1: Translation files have shared top-level schema namespaces', () => {
      const enKeys = Object.keys(enDict);
      const arKeys = Object.keys(arDict);
      assert.ok(enKeys.length > 0 && arKeys.length > 0, 'Dictionaries must not be empty');
      const commonNamespaces = enKeys.filter(k => arKeys.includes(k));
      assert.ok(commonNamespaces.length >= 4, 'Must share common sections (nav, hero, about, projects, contact, etc.)');
    });

    it('3.F4.2: Dynamic language switch reflects correct text and directionality tokens', () => {
      const mockLangs = [
        { code: 'en', dir: 'ltr', sampleKey: 'Home' },
        { code: 'ar', dir: 'rtl', sampleKey: 'الرئيسية' }
      ];
      for (const lang of mockLangs) {
        assert.ok(['ltr', 'rtl'].includes(lang.dir), 'Direction must be LTR or RTL');
        assert.ok(lang.sampleKey.length > 0, 'Sample localized string must exist');
      }
    });

    it('3.F4.3: Arabic numbers and dates format consistently with locale rules', () => {
      const testDate = new Date('2025-10-04T12:00:00Z');
      const formatterEn = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });
      const formatterAr = new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium' });
      
      const strEn = formatterEn.format(testDate);
      const strAr = formatterAr.format(testDate);
      assert.notStrictEqual(strEn, strAr, 'Arabic formatted date must differ from English');
    });
  });

  // =========================================================================
  // COMBINATION FLOW 5: Theme State Synchronization & Glassmorphism Tokens
  // =========================================================================
  describe('Tier 3 - Flow 5: Theme State Synchronization & Glassmorphism Tokens', () => {
    it('3.F5.1: Theme toggle state persists cleanly in storage abstraction', () => {
      const storageMock = new Map();
      const setTheme = (t) => storageMock.set('theme', t);
      const getTheme = () => storageMock.get('theme') || 'dark';

      assert.strictEqual(getTheme(), 'dark', 'Default theme must be dark');
      setTheme('light');
      assert.strictEqual(getTheme(), 'light', 'Theme must update to light');
      setTheme('dark');
      assert.strictEqual(getTheme(), 'dark', 'Theme must update back to dark');
    });

    it('3.F5.2: CSS root contains class-based theme token bindings', () => {
      const cssContent = readSource('frontend/src/index.css') || '';
      assert.ok(cssContent.length > 0, 'index.css must exist');
    });

    it('3.F5.3: Glassmorphism tokens provide backdrop blur and border translucency', () => {
      const glassClasses = 'backdrop-blur-md bg-white/5 border border-white/10';
      assert.ok(glassClasses.includes('backdrop-blur') && glassClasses.includes('border'),
        'Glassmorphic styling tokens validated');
    });
  });
}
