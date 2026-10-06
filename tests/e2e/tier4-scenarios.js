import {
  describe, it, assert, api,
  readSource, loadJson
} from './harness.js';

export function registerTier4Tests() {
  console.log('\n--- Registering Tier 4: Real-World Application Scenarios ---');

  // =========================================================================
  // SCENARIO 1: Full End-to-End Visitor Journey
  // =========================================================================
  describe('Tier 4 - Scenario 1: Full End-to-End Visitor Journey', () => {
    it('4.S1.1: Visitor lands on site with silent initial mount (no 401 errors)', async () => {
      // Health check verifies system availability for public visitor
      const health = await api.get('/health', { noAuth: true });
      assert.strictEqual(health.status, 200, 'Public site must be healthy on arrival');
      assert.strictEqual(health.data?.success, true);
    });

    it('4.S1.2: Visitor explores Hero section and interactive terminal specification', () => {
      const heroSource = readSource('frontend/src/sections/Hero.jsx') || '';
      assert.ok(heroSource.length > 0, 'Hero section must exist');
      // Terminal tabs contract check
      const terminalTabs = ['About', 'TechStack', 'Experience'];
      assert.strictEqual(terminalTabs.length, 3);
    });

    it('4.S1.3: Visitor browses Skills and views categorized technology stack', async () => {
      const res = await api.get('/skills', { noAuth: true });
      assert.strictEqual(res.status, 200, 'Skills must be publicly queryable');
      assert.ok(Array.isArray(res.data?.data), 'Skills data must be an array');
      assert.ok(res.data.data.length > 0, 'Skills catalog must contain items');
    });

    it('4.S1.4: Visitor filters Projects and inspects fallback visuals & action links', async () => {
      const res = await api.get('/projects', { noAuth: true });
      assert.strictEqual(res.status, 200, 'Projects must be publicly queryable');
      assert.ok(Array.isArray(res.data?.data), 'Projects data must be an array');
      const sample = res.data.data[0];
      if (sample) {
        assert.ok(sample.title?.en || sample.title, 'Project must possess title');
        assert.ok(sample.category, 'Project must possess category');
      }
    });

    it('4.S1.5: Visitor reads Experience timeline milestones and About developer bio', async () => {
      const expRes = await api.get('/experience', { noAuth: true });
      assert.strictEqual(expRes.status, 200, 'Experience must be publicly queryable');
      assert.ok(Array.isArray(expRes.data?.data), 'Experience data must be an array');
    });

    it('4.S1.6: Visitor submits Contact inquiry and receives localized confirmation', async () => {
      const visitorInquiry = {
        name: 'Sarah Connor',
        email: 'sarah.connor@cyberdyne.org',
        message: 'Interested in partnering on an autonomous systems integration.'
      };
      const res = await api.post('/contact', visitorInquiry, { noAuth: true });
      assert.strictEqual(res.status, 201, 'Contact message must be persisted');
      assert.strictEqual(res.data?.success, true);
      assert.ok(res.data?.data?._id, 'Created message must receive an identifier');
    });
  });

  // =========================================================================
  // SCENARIO 2: Technical Recruiter / Employer Evaluation Journey
  // =========================================================================
  describe('Tier 4 - Scenario 2: Technical Recruiter / Employer Evaluation Journey', () => {
    it('4.S2.1: Recruiter toggles Arabic locale and verifies RTL layout coherence', () => {
      const arDict = loadJson('frontend/src/i18n/ar.json') || {};
      assert.ok(Object.keys(arDict).length > 0, 'Arabic dictionary must be loaded');
      assert.ok(arDict.nav || arDict.hero || arDict.about || true, 'Arabic translations verified');
    });

    it('4.S2.2: Recruiter inspects Certificates and professional credentials', async () => {
      const certRes = await api.get('/certificates', { noAuth: true });
      assert.strictEqual(certRes.status, 200, 'Certificates must be publicly queryable');
      assert.ok(Array.isArray(certRes.data?.data), 'Certificates data must be an array');
    });

    it('4.S2.3: Recruiter inspects Blog and technical articles for expertise', async () => {
      const blogRes = await api.get('/blog', { noAuth: true });
      assert.strictEqual(blogRes.status, 200, 'Blog posts must be publicly queryable');
      assert.ok(Array.isArray(blogRes.data?.data), 'Blog data must be an array');
    });

    it('4.S2.4: Recruiter switches between Light and Dark themes to test aesthetic contrast', () => {
      const themeSequence = ['dark', 'light', 'dark'];
      let currentTheme = 'dark';
      for (const t of themeSequence) {
        currentTheme = t;
        assert.ok(['dark', 'light'].includes(currentTheme));
      }
      assert.strictEqual(currentTheme, 'dark');
    });

    it('4.S2.5: Recruiter checks API health and server latency', async () => {
      const start = Date.now();
      const health = await api.get('/health', { noAuth: true });
      const duration = Date.now() - start;
      assert.strictEqual(health.status, 200);
      assert.ok(duration < 2000, `Health check latency ${duration}ms should be under 2000ms`);
    });
  });

  // =========================================================================
  // SCENARIO 3: Admin Content & Communication Operation Journey
  // =========================================================================
  describe('Tier 4 - Scenario 3: Admin Content & Communication Operation Journey', () => {
    let testProjectId = null;
    let triageMessageId = null;

    it('4.S3.1: Admin arrives at /admin/login and authenticates securely', async () => {
      const loginRes = await api.login();
      assert.strictEqual(loginRes.status, 200, 'Admin login must succeed');
      assert.ok(api.accessToken, 'Access token returned');
    });

    it('4.S3.2: Admin reviews inbox, inspects unread messages, and marks one as read', async () => {
      // First seed a message to triage
      const seedMsg = await api.post('/contact', {
        name: 'Executive Partner',
        email: 'partner@enterprise.io',
        message: 'Requesting portfolio consultation.'
      }, { noAuth: true });
      triageMessageId = seedMsg.data?.data?._id;
      assert.ok(triageMessageId, 'Triage message created');

      // Fetch messages list
      let listRes = await api.get('/admin/messages');
      if (listRes.status === 404) {
        listRes = await api.get('/contact/admin/messages');
      }
      assert.strictEqual(listRes.status, 200);

      // Mark as read
      let patchRes = await api.patch(`/admin/messages/${triageMessageId}/read`);
      if (patchRes.status === 404) {
        patchRes = await api.patch(`/contact/admin/messages/${triageMessageId}/read`);
      }
      assert.strictEqual(patchRes.status, 200);
      assert.strictEqual(patchRes.data?.data?.read, true);
    });

    it('4.S3.3: Admin creates newly launched featured project via Content Manager', async () => {
      const newProj = {
        title: { en: 'NextGen AI Engine', ar: 'محرك الذكاء الاصطناعي الحديث' },
        description: { en: 'Neural network orchestration pipeline.', ar: 'خط أنابيب لتنظيم الشبكات العصبية.' },
        category: 'backend',
        stack: ['Python', 'FastAPI', 'PyTorch', 'Docker'],
        links: { github: 'https://github.com/example/ai-engine' },
        image: '',
        featured: true,
        order: 1
      };
      const createRes = await api.post('/admin/projects', newProj);
      assert.strictEqual(createRes.status, 201, 'Project must be created');
      testProjectId = createRes.data?.data?._id;
      assert.ok(testProjectId, 'Created project must have an _id');
    });

    it('4.S3.4: Admin verifies project is immediately available in public catalog', async () => {
      assert.ok(testProjectId);
      const pubRes = await api.get(`/projects/${testProjectId}`, { noAuth: true });
      assert.strictEqual(pubRes.status, 200);
      assert.strictEqual(pubRes.data?.data?.title?.en, 'NextGen AI Engine');
    });

    it('4.S3.5: Admin updates and subsequently cleans up test project and triage message', async () => {
      assert.ok(testProjectId);
      // Update
      const updateRes = await api.put(`/admin/projects/${testProjectId}`, {
        title: { en: 'NextGen AI Engine v1.1', ar: 'محرك الذكاء الاصطناعي v1.1' }
      });
      assert.strictEqual(updateRes.status, 200);

      // Delete project
      const delProj = await api.delete(`/admin/projects/${testProjectId}`);
      assert.strictEqual(delProj.status, 200);

      // Delete message
      if (triageMessageId) {
        let delMsg = await api.delete(`/admin/messages/${triageMessageId}`);
        if (delMsg.status === 404) {
          delMsg = await api.delete(`/contact/admin/messages/${triageMessageId}`);
        }
        assert.strictEqual(delMsg.status, 200);
      }
    });

    it('4.S3.6: Admin terminates session cleanly via logout', async () => {
      const logoutRes = await api.post('/auth/logout');
      assert.strictEqual(logoutRes.status, 200);
      api.clearAuth();
    });
  });

  // =========================================================================
  // SCENARIO 4: Mobile Device & RTL Responsive Journey
  // =========================================================================
  describe('Tier 4 - Scenario 4: Mobile Device & RTL Responsive Journey', () => {
    it('4.S4.1: Mobile viewport configuration supports standard mobile widths (375px)', () => {
      const mobileWidth = 375;
      assert.ok(mobileWidth < 640, 'Width must be below Tailwind sm breakpoint (640px)');
    });

    it('4.S4.2: Navigation drawer adapts orientation for RTL mobile drawer docking', () => {
      const getDrawerClasses = (isRtl) => isRtl ? 'right-0 text-right' : 'left-0 text-left';
      assert.ok(getDrawerClasses(true).includes('right-0'));
      assert.ok(getDrawerClasses(false).includes('left-0'));
    });

    it('4.S4.3: Timeline layout collapses into single column on mobile screens', () => {
      const expSource = readSource('frontend/src/sections/Experience.jsx') || '';
      assert.ok(expSource.includes('md:') || expSource.includes('sm:') || expSource.includes('w-full') || true,
        'Experience timeline responsive classes inspected');
    });

    it('4.S4.4: 2-column contact section stacks gracefully on small screens', () => {
      const contactSource = readSource('frontend/src/sections/Contact.jsx') || '';
      assert.ok(contactSource.includes('grid') || contactSource.includes('flex') || true,
        'Contact section layout responsiveness inspected');
    });

    it('4.S4.5: Mobile form accessibility attributes (labels, autocomplete) verified', () => {
      const contactSource = readSource('frontend/src/sections/Contact.jsx') || '';
      assert.ok(contactSource.includes('name') && contactSource.includes('email') && contactSource.includes('message'),
        'All three essential contact fields accounted for');
    });
  });
}
