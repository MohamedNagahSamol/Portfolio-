import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const PROJECT_ROOT = path.resolve(__dirname, '../..');

// Load .env from backend if available
function loadEnv() {
  const envPath = path.join(PROJECT_ROOT, 'backend', '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        const value = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}
loadEnv();

export const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

// Discovered bugs registry for escalation
const discoveredBugs = [];

export function recordBug({ featureId, featureName, title, severity = 'MEDIUM', details, location = 'backend' }) {
  const existing = discoveredBugs.find(b => b.featureId === featureId && b.title === title);
  if (!existing) {
    discoveredBugs.push({
      featureId,
      featureName,
      title,
      severity,
      details,
      location,
      timestamp: new Date().toISOString()
    });
  }
}

export function getDiscoveredBugs() {
  return [...discoveredBugs];
}

// Source inspection helpers
export function readSource(relativePath) {
  const fullPath = path.resolve(PROJECT_ROOT, relativePath);
  if (!fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath, 'utf-8');
}

export function fileExists(relativePath) {
  const fullPath = path.resolve(PROJECT_ROOT, relativePath);
  return fs.existsSync(fullPath);
}

export function loadJson(relativePath) {
  const content = readSource(relativePath);
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch (err) {
    throw new Error(`Failed to parse JSON at ${relativePath}: ${err.message}`);
  }
}

export function findInFile(relativePath, regexOrString) {
  const content = readSource(relativePath);
  if (!content) return false;
  if (regexOrString instanceof RegExp) {
    return regexOrString.test(content);
  }
  return content.includes(regexOrString);
}

// HTTP & API Client Helper
export class ApiClient {
  constructor(baseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:5000/api') {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.accessToken = null;
    this.cookies = new Map();
  }

  setAccessToken(token) {
    this.accessToken = token;
  }

  clearAuth() {
    this.accessToken = null;
    this.cookies.clear();
  }

  getCookieString() {
    return Array.from(this.cookies.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
  }

  saveCookies(response) {
    const rawSetCookie = response.headers.get('set-cookie');
    if (!rawSetCookie) return;
    // Handle comma or semicolon separated cookies
    const parts = rawSetCookie.split(/,(?=\s*[^;]+=)/);
    for (const part of parts) {
      const match = part.trim().match(/^([^=;]+)=([^;]*)/);
      if (match) {
        this.cookies.set(match[1].trim(), match[2].trim());
      }
    }
  }

  async request(method, endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const headers = { ...options.headers };

    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }

    if (this.accessToken && !headers['Authorization'] && !options.noAuth) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const cookieStr = this.getCookieString();
    if (cookieStr && !headers['Cookie'] && !options.noCookie) {
      headers['Cookie'] = cookieStr;
    }

    let body = options.body;
    if (body && typeof body === 'object' && !(body instanceof FormData)) {
      body = JSON.stringify(body);
    }

    const timeout = options.timeout || 10000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body,
        signal: controller.signal
      });

      this.saveCookies(response);

      let data = null;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch {
          data = null;
        }
      } else {
        data = await response.text();
      }

      return {
        status: response.status,
        ok: response.ok,
        headers: response.headers,
        data,
      };
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error(`Request to ${url} timed out after ${timeout}ms`);
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  get(endpoint, options = {}) {
    return this.request('GET', endpoint, options);
  }

  post(endpoint, body = null, options = {}) {
    return this.request('POST', endpoint, { ...options, body });
  }

  put(endpoint, body = null, options = {}) {
    return this.request('PUT', endpoint, { ...options, body });
  }

  patch(endpoint, body = null, options = {}) {
    return this.request('PATCH', endpoint, { ...options, body });
  }

  delete(endpoint, options = {}) {
    return this.request('DELETE', endpoint, options);
  }

  async login(email = process.env.ADMIN_EMAIL || 'memenoname60@gmail.com', password = process.env.ADMIN_PASSWORD || 'Meme@1234', options = {}) {
    if (this.accessToken && !options.force) {
      return {
        status: 200,
        ok: true,
        data: { success: true, data: { accessToken: this.accessToken } }
      };
    }
    const res = await this.post('/auth/login', { email, password }, { noAuth: true });
    if (res.status === 200 && res.data?.data?.accessToken) {
      this.setAccessToken(res.data.data.accessToken);
    }
    return res;
  }
}

export const api = new ApiClient();

// Test Runner Engine
class TestSuiteRegistry {
  constructor() {
    this.currentSuite = null;
    this.suites = [];
    this.stats = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
    };
  }

  describe(name, fn) {
    const suite = {
      name,
      tests: [],
      beforeHooks: [],
      afterHooks: [],
      beforeEachHooks: [],
      afterEachHooks: [],
    };
    this.suites.push(suite);
    const parent = this.currentSuite;
    this.currentSuite = suite;
    fn();
    this.currentSuite = parent;
  }

  it(name, fn) {
    if (!this.currentSuite) {
      this.describe('Global Suite', () => this.it(name, fn));
      return;
    }
    this.currentSuite.tests.push({ name, fn, skipped: false });
  }

  itSkip(name, fn) {
    if (!this.currentSuite) return;
    this.currentSuite.tests.push({ name, fn, skipped: true });
  }

  before(fn) {
    if (this.currentSuite) this.currentSuite.beforeHooks.push(fn);
  }

  after(fn) {
    if (this.currentSuite) this.currentSuite.afterHooks.push(fn);
  }

  beforeEach(fn) {
    if (this.currentSuite) this.currentSuite.beforeEachHooks.push(fn);
  }

  afterEach(fn) {
    if (this.currentSuite) this.currentSuite.afterEachHooks.push(fn);
  }

  async runSuites(reporterOptions = { verbose: false }) {
    const startTime = Date.now();
    this.stats = { total: 0, passed: 0, failed: 0, skipped: 0, duration: 0 };
    const results = [];

    for (const suite of this.suites) {
      console.log(`\n${colors.bold}${colors.blue}Suite: ${suite.name}${colors.reset}`);
      
      // Run before hooks
      for (const hook of suite.beforeHooks) {
        await hook();
      }

      for (const test of suite.tests) {
        this.stats.total++;
        if (test.skipped) {
          this.stats.skipped++;
          console.log(`  ${colors.yellow}⊘ SKIP:${colors.reset} ${test.name}`);
          results.push({ suite: suite.name, test: test.name, status: 'SKIPPED' });
          continue;
        }

        // Run beforeEach hooks
        for (const hook of suite.beforeEachHooks) {
          await hook();
        }

        const tStart = Date.now();
        try {
          await test.fn();
          const tDuration = Date.now() - tStart;
          this.stats.passed++;
          console.log(`  ${colors.green}✓ PASS:${colors.reset} ${test.name} ${colors.gray}(${tDuration}ms)${colors.reset}`);
          results.push({ suite: suite.name, test: test.name, status: 'PASSED', duration: tDuration });
        } catch (err) {
          const tDuration = Date.now() - tStart;
          this.stats.failed++;
          console.log(`  ${colors.red}✗ FAIL:${colors.reset} ${test.name} ${colors.gray}(${tDuration}ms)${colors.reset}`);
          console.log(`    ${colors.red}Error: ${err.message}${colors.reset}`);
          if (reporterOptions.verbose && err.stack) {
            console.log(`    ${colors.gray}${err.stack.split('\n').slice(1, 4).join('\n    ')}${colors.reset}`);
          }
          results.push({ suite: suite.name, test: test.name, status: 'FAILED', duration: tDuration, error: err.message });
        }

        // Run afterEach hooks
        for (const hook of suite.afterEachHooks) {
          await hook();
        }
      }

      // Run after hooks
      for (const hook of suite.afterHooks) {
        await hook();
      }
    }

    this.stats.duration = Date.now() - startTime;
    return { stats: this.stats, results };
  }

  clear() {
    this.suites = [];
    this.currentSuite = null;
  }
}

export const registry = new TestSuiteRegistry();
export const describe = (name, fn) => registry.describe(name, fn);
export const it = (name, fn) => registry.it(name, fn);
export const itSkip = (name, fn) => registry.itSkip(name, fn);
export const before = (fn) => registry.before(fn);
export const after = (fn) => registry.after(fn);
export const beforeEach = (fn) => registry.beforeEach(fn);
export const afterEach = (fn) => registry.afterEach(fn);
export { assert };
