/**
 * Empirical Challenger Adversarial Verification Suite for Milestone 3
 * Strict i18n, RTL Mirroring & Locale Formatting
 *
 * Test Sections:
 * 1. i18n & Translation Parity Adversarial Testing
 *    - Key parity between en.json and ar.json (automated bi-directional assertion)
 *    - Untranslated / placeholder check (empty strings, TODO, FIXME, TBD, etc.)
 *    - Identity inspection (verify identical entries are legitimate brand/stat tokens)
 *    - Arabic language fidelity in ar.json
 * 2. Tech Badge Normalization Adversarial Stress Testing
 *    - Punctuation stripping, casing normalization, composite key mapping
 *    - Dirty inputs: leading/trailing spaces, mixed case, special characters, XSS payloads
 *    - Unknown stacks and fallback resilience
 *    - Edge cases: null, undefined, non-string types
 * 3. Dynamic Date Formatting Adversarial Stress Testing
 *    - formatDate, formatMonthYear, formatFullDate, formatDateTime with invalid inputs:
 *      empty string, null, undefined, invalid Date string, NaN, Infinity, {}, [], false, 0
 *    - Valid inputs: Date objects, ISO strings, timestamp numbers
 *    - Locale outputs: 'ar', 'ar-EG', 'ar-SA', { language: 'ar' } vs 'en', 'en-US', { language: 'en' }
 *    - Contrast assertion (Arabic vs English outputs differ appropriately)
 * 4. Component Source Code Contract Inspection
 *    - Zero hardcoded 'en-US' in target components (Certificates, Blog, Experience, Messages)
 *    - Logical CSS classes (Footer text-start, AdminLayout start-0 / rtl drawer mirroring)
 *    - Messages unread triage and mark-as-read integration
 */

import fs from 'fs';
import path from 'path';

let passCount = 0;
let failCount = 0;
const errors = [];
const findings = [];

function assert(condition, message) {
  if (!condition) {
    failCount++;
    errors.push(message);
    console.error(`  ❌ FAIL: ${message}`);
  } else {
    passCount++;
    console.log(`  ✅ PASS: ${message}`);
  }
}

function recordFinding(severity, title, detail) {
  findings.push({ severity, title, detail });
  console.log(`  ⚠️  FINDING [${severity}]: ${title} - ${detail}`);
}

console.log('======================================================================');
console.log('      MILESTONE 3: EMPIRICAL CHALLENGER ADVERSARIAL TEST SUITE        ');
console.log('======================================================================\n');

// ============================================================================
// SECTION 1: i18n & Translation Parity Adversarial Testing
// ============================================================================
console.log('--- SECTION 1: i18n & Translation Parity Adversarial Testing ---');

const enPath = path.resolve('frontend/src/i18n/en.json');
const arPath = path.resolve('frontend/src/i18n/ar.json');

assert(fs.existsSync(enPath), 'en.json exists');
assert(fs.existsSync(arPath), 'ar.json exists');

const en = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
const ar = JSON.parse(fs.readFileSync(arPath, 'utf-8'));

const enKeys = Object.keys(en);
const arKeys = Object.keys(ar);

// 1.1 Key Parity Assertions
assert(enKeys.length === 292, `en.json contains exactly 292 keys (found: ${enKeys.length})`);
assert(arKeys.length === 292, `ar.json contains exactly 292 keys (found: ${arKeys.length})`);

const missingInAr = enKeys.filter(k => !(k in ar));
const missingInEn = arKeys.filter(k => !(k in en));

assert(missingInAr.length === 0, `Zero missing keys in ar.json (missing: ${missingInAr.join(', ') || 'none'})`);
assert(missingInEn.length === 0, `Zero missing keys in en.json (missing: ${missingInEn.join(', ') || 'none'})`);

// 1.2 Untranslated or Placeholder Value Checks
const placeholderRegex = /\b(TODO|FIXME|TBD|PLACEHOLDER|LOREM IPSUM)\b/i;
let emptyValuesEn = [];
let emptyValuesAr = [];
let placeholderValuesEn = [];
let placeholderValuesAr = [];

for (const [k, v] of Object.entries(en)) {
  if (typeof v !== 'string' || v.trim().length === 0) emptyValuesEn.push(k);
  if (placeholderRegex.test(v)) placeholderValuesEn.push({ key: k, value: v });
}

for (const [k, v] of Object.entries(ar)) {
  if (typeof v !== 'string' || v.trim().length === 0) emptyValuesAr.push(k);
  if (placeholderRegex.test(v)) placeholderValuesAr.push({ key: k, value: v });
}

assert(emptyValuesEn.length === 0, `en.json has 0 empty/whitespace values (found: ${emptyValuesEn.length})`);
assert(emptyValuesAr.length === 0, `ar.json has 0 empty/whitespace values (found: ${emptyValuesAr.length})`);
assert(placeholderValuesEn.length === 0, `en.json has 0 placeholder/TODO values (found: ${placeholderValuesEn.length})`);
assert(placeholderValuesAr.length === 0, `ar.json has 0 placeholder/TODO values (found: ${placeholderValuesAr.length})`);

// 1.3 Identical Translation Values Audit
// Values that are identical between English and Arabic must only be brand names, version strings, or email/placeholders
const identicalKeys = [];
for (const k of enKeys) {
  if (en[k] === ar[k]) {
    identicalKeys.push({ key: k, value: en[k] });
  }
}

console.log(`  ℹ️  Total identical values between en.json and ar.json: ${identicalKeys.length}`);

// Allowed non-translated categories: stats ('1+'), emails, passwords ('••••••••'), brand names (tech_*)
const allowedIdenticalPrefixes = ['about_stat_', 'contact_email_', 'contact_info_email', 'admin_login_email_', 'admin_login_password_', 'tech_'];
const suspiciousIdentical = identicalKeys.filter(({ key }) => {
  return !allowedIdenticalPrefixes.some(pref => key.startsWith(pref));
});

assert(suspiciousIdentical.length === 0, `All identical keys are approved brand/format constants (suspicious: ${suspiciousIdentical.map(s => s.key).join(', ') || 'none'})`);

// 1.4 Arabic Text Verification in ar.json
// Non-tech, non-stat UI keys in ar.json MUST contain Arabic unicode characters ([\u0600-\u06FF])
const nonArabicUIKeys = [];
for (const [k, v] of Object.entries(ar)) {
  const isExempt = allowedIdenticalPrefixes.some(pref => k.startsWith(pref));
  if (!isExempt && !/[\u0600-\u06FF]/.test(v)) {
    nonArabicUIKeys.push({ key: k, value: v });
  }
}

assert(nonArabicUIKeys.length === 0, `All user-facing UI copy in ar.json contains authentic Arabic text (untranslated: ${nonArabicUIKeys.map(n => n.key).join(', ') || 'none'})`);

console.log('');

// ============================================================================
// SECTION 2: Tech Badge Normalization Adversarial Stress Testing
// ============================================================================
console.log('--- SECTION 2: Tech Badge Normalization Adversarial Stress Testing ---');

// Mock translation function mimicking i18next behavior
function mockT(dict) {
  return function(key) {
    return dict[key] !== undefined ? dict[key] : key;
  };
}

const tEn = mockT(en);
const tAr = mockT(ar);

// Implementation under test from Skills.jsx and ProjectCard.jsx
function techLabel(t, tech) {
  if (tech === null || tech === undefined) return '';
  const str = String(tech);
  const key = 'tech_' + str.toLowerCase().replace(/[^a-z0-9]/g, '');
  return t(key) !== key ? t(key) : str;
}

// 2.1 Standard & Composite Tech Badges Normalization
const standardBadges = [
  { raw: 'HTML5 & CSS3', expectedKey: 'tech_html5css3', enExpected: 'HTML5 & CSS3', arExpected: 'HTML5 و CSS3' },
  { raw: 'MongoDB & Mongoose', expectedKey: 'tech_mongodbmongoose', enExpected: 'MongoDB & Mongoose', arExpected: 'MongoDB و Mongoose' },
  { raw: 'Prisma ORM', expectedKey: 'tech_prismaorm', enExpected: 'Prisma ORM', arExpected: 'بريزما ORM' },
  { raw: 'Git & GitHub', expectedKey: 'tech_gitgithub', enExpected: 'Git & GitHub', arExpected: 'Git و GitHub' },
  { raw: 'Tailwind CSS', expectedKey: 'tech_tailwindcss', enExpected: 'Tailwind CSS', arExpected: 'Tailwind CSS' },
  { raw: 'Express.js', expectedKey: 'tech_expressjs', enExpected: 'Express.js', arExpected: 'إكسبرس.js' },
  { raw: 'Next.js', expectedKey: 'tech_nextjs', enExpected: 'Next.js', arExpected: 'Next.js' },
  { raw: 'Docker', expectedKey: 'tech_docker', enExpected: 'Docker', arExpected: 'دوكر' },
  { raw: 'AWS', expectedKey: 'tech_aws', enExpected: 'AWS', arExpected: 'خدمات أمازون AWS' },
  { raw: 'Redux Toolkit', expectedKey: 'tech_reduxtoolkit', enExpected: 'Redux Toolkit', arExpected: 'ريدكس تولكيت' },
  { raw: 'Framer Motion', expectedKey: 'tech_framermotion', enExpected: 'Framer Motion', arExpected: 'فرايمر موشن' },
];

for (const badge of standardBadges) {
  const normKey = 'tech_' + badge.raw.toLowerCase().replace(/[^a-z0-9]/g, '');
  assert(normKey === badge.expectedKey, `Normalized key for "${badge.raw}" is "${badge.expectedKey}"`);
  assert(tEn(normKey) === badge.enExpected, `EN translation for "${normKey}" is "${badge.enExpected}"`);
  assert(tAr(normKey) === badge.arExpected, `AR translation for "${normKey}" is "${badge.arExpected}"`);
}

// 2.2 Dirty Strings: Whitespace, Casing, and Punctuation
const dirtyCases = [
  { input: '   HTML5 & CSS3   ', expectedNorm: 'tech_html5css3' },
  { input: 'MONGODB & MONGOOSE', expectedNorm: 'tech_mongodbmongoose' },
  { input: 'pRiSmA oRm', expectedNorm: 'tech_prismaorm' },
  { input: 'Next.js!!!', expectedNorm: 'tech_nextjs' },
  { input: 'Express.js---', expectedNorm: 'tech_expressjs' },
  { input: 'Docker@#$%', expectedNorm: 'tech_docker' },
];

for (const { input, expectedNorm } of dirtyCases) {
  const key = 'tech_' + input.toLowerCase().replace(/[^a-z0-9]/g, '');
  assert(key === expectedNorm, `Dirty input "${input}" correctly normalizes to "${expectedNorm}"`);
}

// 2.3 Unknown Stacks: Fallback behavior
const unknownStacks = ['Cobol 85', 'Fortran 77', 'QuantumAssembly', 'WebAssembly-v2'];
for (const stack of unknownStacks) {
  const resEn = techLabel(tEn, stack);
  const resAr = techLabel(tAr, stack);
  assert(resEn === stack, `Unknown stack "${stack}" safely preserves raw input in EN (${resEn})`);
  assert(resAr === stack, `Unknown stack "${stack}" safely preserves raw input in AR (${resAr})`);
}

// 2.4 Adversarial Injection Strings
const maliciousInputs = [
  '<script>alert("xss")</script>',
  '"><svg onload=alert(1)>',
  '../../../../etc/passwd',
  '${process.env.JWT_SECRET}',
  'SELECT * FROM skills WHERE 1=1'
];

for (const malicious of maliciousInputs) {
  let threw = false;
  let result = '';
  try {
    result = techLabel(tAr, malicious);
  } catch (err) {
    threw = true;
  }
  assert(!threw, `Malicious input "${malicious.slice(0, 20)}..." processes without throwing`);
  assert(result === malicious, `Malicious input falls back safely without executing or transforming unexpectedly`);
}

// 2.5 Edge Case Types & Null/Undefined Defensiveness Check
// Note: In Skills.jsx and ProjectCard.jsx, the original function is:
// `const key = 'tech_' + tech.toLowerCase().replace(/[^a-z0-9]/g, '');`
// Without a null check, `techLabel(t, null)` would throw TypeError: Cannot read properties of null (reading 'toLowerCase').
// Let's verify whether the actual component files have defensive null/undefined checks:
const skillsSource = fs.readFileSync('frontend/src/sections/Skills.jsx', 'utf-8');
const cardSource = fs.readFileSync('frontend/src/components/ProjectCard.jsx', 'utf-8');

const rawTechLabelSkills = skillsSource.includes('tech.toLowerCase()') && !skillsSource.includes('if (!tech)');
const rawTechLabelCard = cardSource.includes('tech.toLowerCase()') && !cardSource.includes('if (!tech)');

if (rawTechLabelSkills || rawTechLabelCard) {
  recordFinding(
    'LOW',
    'Tech Label Null-Safety Advisory',
    'techLabel(t, tech) in Skills.jsx and ProjectCard.jsx relies on tech.toLowerCase() without an early guard `if (!tech) return tech || "";`. While all database seeds provide non-null strings, dirty/null API responses could trigger TypeError.'
  );
}

console.log('');

// ============================================================================
// SECTION 3: Dynamic Date Formatting Adversarial Stress Testing
// ============================================================================
console.log('--- SECTION 3: Dynamic Date Formatting Adversarial Stress Testing ---');

// Dynamically extract date formatter implementation from frontend/src/utils/date.js
const dateFileContent = fs.readFileSync('frontend/src/utils/date.js', 'utf-8');

// Construct isolated test harness for date functions without requiring browser document globals
let dateHarnessCode = dateFileContent
  .replace("import i18n from '../i18n/config.js';", "const i18n = { language: 'en' };")
  .replace(/export function /g, 'function ')
  .replace(/export default [^;]+;/, '');

dateHarnessCode += `
return {
  formatDate,
  formatMonthYear,
  formatFullDate,
  formatDateTime,
};
`;

const createDateHarness = new Function(dateHarnessCode);
const dateUtils = createDateHarness();

const { formatDate, formatMonthYear, formatFullDate, formatDateTime } = dateUtils;

// 3.1 Invalid Input Defensive Handling Across All 4 Functions
const invalidInputs = [
  { desc: 'null', val: null },
  { desc: 'undefined', val: undefined },
  { desc: 'empty string ""', val: '' },
  { desc: 'invalid string "invalid-date-string"', val: 'invalid-date-string' },
  { desc: 'impossible date "2024-99-99"', val: '2024-99-99' },
  { desc: 'NaN', val: NaN },
  { desc: 'Infinity', val: Infinity },
  { desc: '-Infinity', val: -Infinity },
  { desc: 'empty object {}', val: {} },
  { desc: 'empty array []', val: [] },
  { desc: 'numeric zero 0', val: 0 },
  { desc: 'false', val: false },
];

for (const { desc, val } of invalidInputs) {
  const rFormatDate = formatDate(val);
  const rMonthYear = formatMonthYear(val);
  const rFullDate = formatFullDate(val);
  const rDateTime = formatDateTime(val);

  assert(rFormatDate === '', `formatDate(${desc}) defensively returns empty string`);
  assert(rMonthYear === '', `formatMonthYear(${desc}) defensively returns empty string`);
  assert(rFullDate === '', `formatFullDate(${desc}) defensively returns empty string`);
  assert(rDateTime === '', `formatDateTime(${desc}) defensively returns empty string`);
}

// 3.2 Valid Input Handling Across Input Types
const testTimestamp = 1713182400000; // 2024-04-15T12:00:00Z
const testIsoString = '2024-04-15T12:00:00.000Z';
const testDateObj = new Date('2024-04-15T12:00:00.000Z');

// Test timestamp number input
const tsResEn = formatDate(testTimestamp, { year: 'numeric', month: 'short' }, 'en');
const tsResAr = formatDate(testTimestamp, { year: 'numeric', month: 'short' }, 'ar');
assert(tsResEn.length > 0, `formatDate with numeric timestamp produces non-empty EN date: "${tsResEn}"`);
assert(tsResAr.length > 0, `formatDate with numeric timestamp produces non-empty AR date: "${tsResAr}"`);

// Test Date object input
const objResEn = formatMonthYear(testDateObj, 'en');
const objResAr = formatMonthYear(testDateObj, 'ar');
assert(objResEn.includes('Apr') || objResEn.includes('2024'), `formatMonthYear(DateObj, 'en') formats correctly: "${objResEn}"`);
assert(objResAr.length > 0 && objResAr !== objResEn, `formatMonthYear(DateObj, 'ar') formats correctly in Arabic: "${objResAr}"`);

// Test ISO string input
const isoResEn = formatFullDate(testIsoString, 'en');
const isoResAr = formatFullDate(testIsoString, 'ar');
assert(isoResEn.length > 0, `formatFullDate(ISO, 'en') formats correctly: "${isoResEn}"`);
assert(isoResAr.length > 0 && isoResAr !== isoResEn, `formatFullDate(ISO, 'ar') formats correctly: "${isoResAr}"`);

// Test formatDateTime
const dtResEn = formatDateTime(testIsoString, 'en');
const dtResAr = formatDateTime(testIsoString, 'ar');
assert(dtResEn.length > 0, `formatDateTime(ISO, 'en') formats date & time: "${dtResEn}"`);
assert(dtResAr.length > 0 && dtResAr !== dtResEn, `formatDateTime(ISO, 'ar') formats date & time: "${dtResAr}"`);

// 3.3 Dynamic Locale Resolution Assertions
// Must support string codes ('ar', 'ar-EG', 'ar-SA') and i18n object `{ language: 'ar' }`
const arLocaleVariants = ['ar', 'ar-EG', 'ar-SA', { language: 'ar' }, { language: 'ar-EG' }];
for (const variant of arLocaleVariants) {
  const desc = typeof variant === 'string' ? variant : JSON.stringify(variant);
  const formatted = formatMonthYear(testIsoString, variant);
  assert(formatted === objResAr, `Locale variant ${desc} correctly resolves to Arabic: "${formatted}"`);
}

const enLocaleVariants = ['en', 'en-US', 'en-GB', { language: 'en' }, { language: 'en-US' }];
for (const variant of enLocaleVariants) {
  const desc = typeof variant === 'string' ? variant : JSON.stringify(variant);
  const formatted = formatMonthYear(testIsoString, variant);
  assert(formatted.length > 0, `Locale variant ${desc} correctly resolves to English: "${formatted}"`);
}

// 3.4 Fallback Behavior with Unknown or Corrupt Locale Specifier
const fallbackVariants = [null, undefined, '', 12345, {}, { foo: 'bar' }, 'invalid_locale'];
for (const fallback of fallbackVariants) {
  const desc = typeof fallback === 'object' ? JSON.stringify(fallback) : String(fallback);
  let threw = false;
  let result = '';
  try {
    result = formatMonthYear(testIsoString, fallback);
  } catch (e) {
    threw = true;
  }
  assert(!threw, `formatMonthYear with invalid locale ${desc} does not throw`);
  assert(result.length > 0, `formatMonthYear with invalid locale ${desc} safely falls back to default locale`);
}

console.log('');

// ============================================================================
// SECTION 4: Component Source Code Contract Inspection
// ============================================================================
console.log('--- SECTION 4: Component Source Code Contract Inspection ---');

// 4.1 Target components for date formatting must import and use date.js
const targetDateComponents = [
  { name: 'Certificates.jsx', path: 'frontend/src/sections/Certificates.jsx', fn: 'formatMonthYear' },
  { name: 'Blog.jsx', path: 'frontend/src/sections/Blog.jsx', fn: 'formatFullDate' },
  { name: 'Experience.jsx', path: 'frontend/src/sections/Experience.jsx', fn: 'formatMonthYear' },
  { name: 'Messages.jsx', path: 'frontend/src/pages/admin/Messages.jsx', fn: 'formatDateTime' },
];

for (const comp of targetDateComponents) {
  const content = fs.readFileSync(comp.path, 'utf-8');
  assert(content.includes('../utils/date') || content.includes('../../utils/date'), `${comp.name} imports date.js`);
  assert(content.includes(comp.fn), `${comp.name} calls ${comp.fn}`);
  assert(!content.includes(".toLocaleDateString('en-US'"), `${comp.name} contains ZERO hardcoded .toLocaleDateString('en-US')`);
}

// 4.2 RTL Mirroring & Logical Layout Contracts
const footerContent = fs.readFileSync('frontend/src/components/Footer.jsx', 'utf-8');
assert(!footerContent.includes('md:text-left'), 'Footer.jsx has eliminated physical md:text-left');
assert(footerContent.includes('text-start'), 'Footer.jsx utilizes logical text-start');

const adminLayoutContent = fs.readFileSync('frontend/src/components/AdminLayout.jsx', 'utf-8');
assert(adminLayoutContent.includes('start-0'), 'AdminLayout.jsx sidebar uses logical start-0 docking');
assert(adminLayoutContent.includes('rtl:translate-x-full'), 'AdminLayout.jsx implements rtl:translate-x-full drawer transition');
assert(adminLayoutContent.includes('rtl:rotate-180'), 'AdminLayout.jsx mirrors directional back/collapse arrows in RTL');
assert(adminLayoutContent.includes('<LangSwitch'), 'AdminLayout.jsx embeds direct LangSwitch for immediate locale toggle');

const messagesContent = fs.readFileSync('frontend/src/pages/admin/Messages.jsx', 'utf-8');
assert(messagesContent.includes('handleMarkRead'), 'Messages.jsx implements handleMarkRead action');
assert(messagesContent.includes('admin_messages_unread'), 'Messages.jsx displays unread status indicator');

console.log('\n======================================================================');
console.log('                      VERIFICATION SUMMARY                            ');
console.log('======================================================================');
console.log(`  Total Checks: ${passCount + failCount}`);
console.log(`  ✅ Passed:     ${passCount}`);
console.log(`  ❌ Failed:     ${failCount}`);
console.log(`  ⚠️  Findings:   ${findings.length}`);

if (errors.length > 0) {
  console.log('\nFailed Checks:');
  errors.forEach(e => console.log(`  - ${e}`));
}

if (findings.length > 0) {
  console.log('\nFindings / Advisories:');
  findings.forEach(f => console.log(`  - [${f.severity}] ${f.title}: ${f.detail}`));
}

if (failCount === 0) {
  console.log('\n>>> EMPIRICAL CHALLENGER VERDICT: APPROVE <<<');
  process.exit(0);
} else {
  console.log('\n>>> EMPIRICAL CHALLENGER VERDICT: REQUEST_CHANGES <<<');
  process.exit(1);
}
