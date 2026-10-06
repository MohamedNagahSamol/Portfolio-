import {
  describe, it, assert, api, recordBug
} from './harness.js';

export function registerTier2Tests() {
  console.log('\n--- Registering Tier 2: Boundary & Corner Cases ---');

  describe('Tier 2: Boundary & Corner Cases', () => {
    // ------------------------------------------
    // 1. Empty Strings & Whitespace Boundaries
    // ------------------------------------------
    it('2.B1: Contact form rejects whitespace-only name and message', async () => {
      const res = await api.post('/contact', {
        name: '   ',
        email: 'test@example.com',
        message: '   \t\n   '
      });
      assert.strictEqual(res.status, 400, 'Whitespace-only inputs must be trimmed and rejected with 400');
      assert.strictEqual(res.data?.success, false);
    });

    it('2.B2: Contact form rejects invalid email variations (missing @, missing TLD, leading spaces)', async () => {
      const badEmails = ['plainaddress', '@missingusername.com', 'user@.com', 'user@domain.'];
      for (const email of badEmails) {
        const res = await api.post('/contact', {
          name: 'Tester',
          email,
          message: 'Boundary email testing'
        });
        assert.strictEqual(res.status, 400, `Email "${email}" must be rejected with 400`);
      }
    });

    // ------------------------------------------
    // 2. Huge / Extreme Inputs Stress Boundaries
    // ------------------------------------------
    it('2.B3: Contact form handles large input payload (50KB message) gracefully', async () => {
      const hugeMessage = 'CyberSecurity-Data-Payload-'.repeat(2000); // ~54 KB
      const res = await api.post('/contact', {
        name: 'Load Tester',
        email: 'loadtest@example.com',
        message: hugeMessage
      });
      assert.ok([201, 400, 413].includes(res.status), 'Large payload must result in valid response or bounded error');
    });

    it('2.B4: Auth login rejects extremely long email/password payloads without buffer overflow', async () => {
      const hugeString = 'X'.repeat(5000);
      const res = await api.post('/auth/login', {
        email: `${hugeString}@example.com`,
        password: hugeString
      }, { noAuth: true });
      assert.ok([400, 413, 500].includes(res.status), 'Oversized login payload must be rejected gracefully');
    });

    // ------------------------------------------
    // 3. Non-Existent and Malformed Resource IDs
    // ------------------------------------------
    it('2.B5: Public GET with non-existent 24-character hex ObjectId returns 404', async () => {
      const nonExistentId = '660000000000000000000000';
      const res = await api.get(`/projects/${nonExistentId}`);
      assert.strictEqual(res.status, 404, 'Non-existent project must return 404');
    });

    it('2.B6: Public GET with malformed non-hex ID is handled safely without crashing server', async () => {
      const malformedId = 'not-a-valid-mongo-object-id-12345';
      const res = await api.get(`/projects/${malformedId}`);
      assert.ok([400, 404, 500].includes(res.status), 'Malformed ID must return safe error status');
      assert.strictEqual(res.data?.success, false);
    });

    it('2.B7: Protected admin operations with non-existent ID return 404', async () => {
      await api.login();
      const nonExistentId = '660000000000000000000000';
      const res = await api.delete(`/admin/projects/${nonExistentId}`);
      assert.strictEqual(res.status, 404, 'Deleting non-existent resource must return 404');
    });

    // ------------------------------------------
    // 4. Invalid Tokens & Missing/Spoofed Cookies
    // ------------------------------------------
    it('2.B8: Protected endpoint rejects request with missing Bearer token with 401', async () => {
      const res = await api.get('/contact/admin/messages', {
        headers: { Authorization: 'Bearer ' }
      });
      assert.strictEqual(res.status, 401, 'Empty Bearer token must return 401');
    });

    it('2.B9: Protected endpoint rejects request with corrupted/tampered JWT signature with 401', async () => {
      const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1NiJ9.TamperedSignatureInvalid';
      const res = await api.get('/contact/admin/messages', {
        headers: { Authorization: `Bearer ${fakeToken}` }
      });
      assert.strictEqual(res.status, 401, 'Tampered JWT must return 401');
    });

    it('2.B10: Auth refresh endpoint rejects call without refreshToken cookie with 401', async () => {
      const res = await api.post('/auth/refresh', null, { noCookie: true, noAuth: true });
      assert.strictEqual(res.status, 401, 'Calling /auth/refresh without cookie must return 401');
      assert.strictEqual(res.data?.success, false);
    });

    it('2.B11: Auth refresh endpoint rejects forged/random refreshToken cookie with 401', async () => {
      const res = await api.post('/auth/refresh', null, {
        headers: { Cookie: 'refreshToken=forged_invalid_refresh_token_string' },
        noAuth: true
      });
      assert.strictEqual(res.status, 401, 'Invalid refresh cookie must return 401');
      assert.strictEqual(res.data?.success, false);
    });

    // ------------------------------------------
    // 5. Extreme Dates & Localization Boundaries
    // ------------------------------------------
    it('2.B12: Locale-aware date formatter handles boundary historical and future dates safely', () => {
      const minDate = new Date('1900-01-01T00:00:00Z');
      const maxDate = new Date('2099-12-31T23:59:59Z');
      
      const arMin = new Intl.DateTimeFormat('ar-EG', { year: 'numeric', month: 'long' }).format(minDate);
      const enMin = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long' }).format(minDate);
      const arMax = new Intl.DateTimeFormat('ar-EG', { year: 'numeric', month: 'long' }).format(maxDate);
      const enMax = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long' }).format(maxDate);

      assert.ok(arMin.length > 0 && enMin.length > 0, 'Historical boundary date must format properly');
      assert.ok(arMax.length > 0 && enMax.length > 0, 'Future boundary date must format properly');
    });

    it('2.B13: Bidirectional text with mixed Arabic, English, and punctuation processes cleanly', async () => {
      const bidiMessage = 'مرحبا Hello! هذا اختبار لـ Full-Stack & Cyber-Tech. Code: 1234 #TAG.';
      const res = await api.post('/contact', {
        name: 'مستخدم تجريبي Test User',
        email: 'bidi@example.com',
        message: bidiMessage
      });
      assert.strictEqual(res.status, 201, 'Mixed bidirectional text must be accepted without encoding corruption');
      assert.strictEqual(res.data?.data?.message, bidiMessage, 'Persisted message must match original bidirectional string');
    });

    // ------------------------------------------
    // 6. Data Structure Boundaries
    // ------------------------------------------
    it('2.B14: Project creation handles empty tech stack array without crashing', async () => {
      await api.login();
      const emptyStackProject = {
        title: { en: 'Boundary Project', ar: 'مشروع حدي' },
        description: { en: 'No stack test', ar: 'بدون تقنيات' },
        category: 'simple',
        stack: [],
        links: {},
        image: '',
        featured: false,
        order: 999
      };
      const res = await api.post('/admin/projects', emptyStackProject);
      assert.ok([201, 400].includes(res.status), 'Empty stack project handled gracefully');
      if (res.status === 201) {
        // Clean up created boundary project
        const createdId = res.data?.data?._id;
        if (createdId) await api.delete(`/admin/projects/${createdId}`);
      }
    });

    it('2.B15: Auth login with incorrect password returns 400 invalid credentials', async () => {
      const res = await api.post('/auth/login', {
        email: process.env.ADMIN_EMAIL || 'memenoname60@gmail.com',
        password: 'IncorrectPassword@999'
      }, { noAuth: true });
      assert.strictEqual(res.status, 400, 'Incorrect password must return 400');
      assert.strictEqual(res.data?.success, false);
    });
  });
}
