import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('====================================================');
console.log('   CHALLENGER 2: ADVERSARIAL TIER 5 AUDIT SUITE    ');
console.log('====================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function assert(condition, message, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✅ PASS: ${message}`);
  } else {
    failedTests++;
    failures.push({ message, details });
    console.error(`❌ FAIL: ${message}`);
    if (details) console.error(`   Details: ${details}`);
  }
}

// ─────────────────────────────────────────────────────────────
// SECTION 1: i18n 1:1 Parity & Placeholder Verification
// ─────────────────────────────────────────────────────────────
console.log('\n--- [1] i18n Parity & Placeholder Integrity ---');

const enPath = path.join(rootDir, 'frontend', 'src', 'i18n', 'en.json');
const arPath = path.join(rootDir, 'frontend', 'src', 'i18n', 'ar.json');

const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const arData = JSON.parse(fs.readFileSync(arPath, 'utf8'));

const enKeys = Object.keys(enData);
const arKeys = Object.keys(arData);

console.log(`Total en.json keys: ${enKeys.length}`);
console.log(`Total ar.json keys: ${arKeys.length}`);

// Check 1: Key count match
assert(enKeys.length === arKeys.length, 'Key counts match between en.json and ar.json', `EN=${enKeys.length}, AR=${arKeys.length}`);

// Check 2: Missing keys in AR
const missingInAr = enKeys.filter(k => !(k in arData));
assert(missingInAr.length === 0, 'Zero missing keys in ar.json compared to en.json', missingInAr.join(', '));

// Check 3: Missing keys in EN
const missingInEn = arKeys.filter(k => !(k in enData));
assert(missingInEn.length === 0, 'Zero missing keys in en.json compared to ar.json', missingInEn.join(', '));

// Check 4: Empty string values
const emptyInEn = enKeys.filter(k => typeof enData[k] === 'string' && enData[k].trim() === '');
const emptyInAr = arKeys.filter(k => typeof arData[k] === 'string' && arData[k].trim() === '');
assert(emptyInEn.length === 0, 'Zero empty string values in en.json', emptyInEn.join(', '));
assert(emptyInAr.length === 0, 'Zero empty string values in ar.json', emptyInAr.join(', '));

// Check 5: Untranslated placeholders / variable parity (e.g., {{count}}, {{name}})
let placeholderMismatches = [];
const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/g;

for (const key of enKeys) {
  const enVal = String(enData[key] || '');
  const arVal = String(arData[key] || '');

  const enMatches = [...enVal.matchAll(placeholderRegex)].map(m => m[1]).sort();
  const arMatches = [...arVal.matchAll(placeholderRegex)].map(m => m[1]).sort();

  if (JSON.stringify(enMatches) !== JSON.stringify(arMatches)) {
    placeholderMismatches.push({ key, enMatches, arMatches });
  }
}
assert(placeholderMismatches.length === 0, '1:1 placeholder variable parity across all keys', JSON.stringify(placeholderMismatches));

// Check 6: Check for untranslated / placeholder strings in ar.json (e.g. "TODO", "Lorem", "TRANSLATE_ME")
const suspectStringsInAr = arKeys.filter(k => {
  const val = String(arData[k]);
  return /\b(TODO|FIXME|TRANSLATE|LOREM IPSUM)\b/i.test(val);
});
assert(suspectStringsInAr.length === 0, 'Zero untranslated dummy markers (TODO/FIXME) in ar.json', suspectStringsInAr.join(', '));

// Check 7: Spot check Arabic text contains actual Arabic characters for localized content
const technicalKeys = new Set([
  'hero_status_terminal', 'hero_code_filename', 'email', 'github', 'linkedin'
]);
let arabicCharCount = 0;
const arabicRegex = /[\u0600-\u06FF]/;
for (const key of arKeys) {
  if (technicalKeys.has(key)) continue;
  if (arabicRegex.test(arData[key])) {
    arabicCharCount++;
  }
}
assert(arabicCharCount > 100, `Arabic translation file has rich Arabic script coverage (${arabicCharCount} keys contain Arabic script)`);

// ─────────────────────────────────────────────────────────────
// SECTION 2: Adversarial Date Formatter Robustness
// ─────────────────────────────────────────────────────────────
console.log('\n--- [2] Adversarial Date Formatter Testing (date.js) ---');

const dateFileContent = fs.readFileSync(path.join(rootDir, 'frontend', 'src', 'utils', 'date.js'), 'utf-8');

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
const { formatDate, formatMonthYear, formatFullDate, formatDateTime } = createDateHarness();

// Test 2.1: null, undefined, empty string
assert(formatDate(null) === '', 'formatDate(null) safely returns empty string');
assert(formatDate(undefined) === '', 'formatDate(undefined) safely returns empty string');
assert(formatDate('') === '', 'formatDate("") safely returns empty string');
assert(formatMonthYear(null) === '', 'formatMonthYear(null) safely returns empty string');
assert(formatFullDate(undefined) === '', 'formatFullDate(undefined) safely returns empty string');
assert(formatDateTime('') === '', 'formatDateTime("") safely returns empty string');

// Test 2.2: Corrupted date strings and invalid inputs
const corruptedInputs = [
  { label: 'not-a-date', val: 'not-a-date' },
  { label: '2026-99-99', val: '2026-99-99' },
  { label: 'invalid_timestamp_text', val: 'invalid_timestamp_text' },
  { label: 'undefined as string', val: 'undefined' },
  { label: 'null as string', val: 'null' },
  { label: '<script>alert(1)</script>', val: '<script>alert(1)</script>' },
  { label: '2024-02-31T99:99:99Z', val: '2024-02-31T99:99:99Z' },
  { label: 'empty object {}', val: {} },
  { label: 'empty array []', val: [] },
  { label: 'NaN', val: NaN },
  { label: 'Infinity', val: Infinity },
  { label: '-Infinity', val: -Infinity },
  { label: 'false', val: false },
  { label: '0 numeric', val: 0 },
];

for (const item of corruptedInputs) {
  let res = 'NOT_CALLED';
  let threw = false;
  try {
    res = formatDate(item.val);
  } catch (err) {
    threw = true;
    res = err.message;
  }
  assert(!threw && res === '', `formatDate(${item.label}) safely returns empty string without throwing`);
}

// Test 2.3: Valid Date instances in en-US and ar-EG
const validIso = '2024-03-15T14:30:00.000Z';
const enMonthYear = formatMonthYear(validIso, 'en');
const arMonthYear = formatMonthYear(validIso, 'ar');
assert(typeof enMonthYear === 'string' && enMonthYear.length > 0, `formatMonthYear in 'en': "${enMonthYear}"`);
assert(typeof arMonthYear === 'string' && arMonthYear.length > 0, `formatMonthYear in 'ar': "${arMonthYear}"`);
assert(enMonthYear !== arMonthYear, `Arabic and English formatted month-year are distinct ("${enMonthYear}" vs "${arMonthYear}")`);

// Verify Arabic date contains Arabic script or Eastern Arabic numerals
assert(/[\u0600-\u06FF]/.test(arMonthYear) || /[\u0660-\u0669]/.test(arMonthYear), `Arabic monthYear uses Arabic locale tokens: "${arMonthYear}"`);

// Test 2.4: Full Date formatting
const enFull = formatFullDate(validIso, 'en');
const arFull = formatFullDate(validIso, 'ar');
assert(enFull.includes('2024'), `formatFullDate('en') contains 2024: "${enFull}"`);
assert(/[\u0600-\u06FF]/.test(arFull) || /[\u0660-\u0669]/.test(arFull), `formatFullDate('ar') localized: "${arFull}"`);

// Test 2.5: DateTime formatting
const enDateTime = formatDateTime(validIso, 'en');
const arDateTime = formatDateTime(validIso, 'ar');
assert(enDateTime.length > 0, `formatDateTime('en') valid: "${enDateTime}"`);
assert(arDateTime.length > 0, `formatDateTime('ar') valid: "${arDateTime}"`);

// Test 2.6: Passing language as i18n object { language: 'ar' }
const arFromObj = formatDate(validIso, { year: 'numeric' }, { language: 'ar' });
const enFromObj = formatDate(validIso, { year: 'numeric' }, { language: 'en' });
assert(arFromObj.length > 0 && enFromObj.length > 0, 'formatDate accepts i18n-shaped object { language: "ar" }');

// Test 2.7: Epoch 0 Date instance, boundary dates
const epochDate = new Date(0);
const epochFormatted = formatDate(epochDate, { year: 'numeric' }, 'en');
assert(epochFormatted === '1970', `formatDate(new Date(0)) formats epoch correctly as 1970: "${epochFormatted}"`);

const futureDate = new Date('2050-06-15T12:00:00.000Z');
assert(formatDate(futureDate, { year: 'numeric' }, 'en') === '2050', 'formatDate future date 2050 works');

const pastDate = new Date('1980-01-01T00:00:00.000Z');
assert(formatDate(pastDate, { year: 'numeric' }, 'en') === '1980', 'formatDate historical date 1980 works');

// ─────────────────────────────────────────────────────────────
// SECTION 3: Bundle & Code-Splitting Audit
// ─────────────────────────────────────────────────────────────
console.log('\n--- [3] Bundle & Code-Splitting Architecture Audit ---');

const distPath = path.join(rootDir, 'frontend', 'dist', 'assets');
assert(fs.existsSync(distPath), 'frontend/dist/assets exists from production build');

const builtFiles = fs.readdirSync(distPath);
const jsFiles = builtFiles.filter(f => f.endsWith('.js'));

console.log('Built JS chunks:', jsFiles);

// Verify admin chunks exist
const hasDashboardChunk = jsFiles.some(f => f.startsWith('Dashboard-'));
const hasLoginChunk = jsFiles.some(f => f.startsWith('Login-'));
const hasMessagesChunk = jsFiles.some(f => f.startsWith('Messages-'));
const hasContentManagerChunk = jsFiles.some(f => f.startsWith('ContentManager-'));
const mainChunk = jsFiles.find(f => f.startsWith('index-'));

assert(hasDashboardChunk, 'Dashboard page partitioned into dedicated chunk');
assert(hasLoginChunk, 'Login page partitioned into dedicated chunk');
assert(hasMessagesChunk, 'Messages page partitioned into dedicated chunk');
assert(hasContentManagerChunk, 'ContentManager page partitioned into dedicated chunk');
assert(Boolean(mainChunk), 'Main index chunk exists');

if (mainChunk) {
  const mainChunkStats = fs.statSync(path.join(distPath, mainChunk));
  const mainChunkKb = mainChunkStats.size / 1024;
  console.log(`Main chunk size: ${mainChunkKb.toFixed(2)} KB`);
}

// ─────────────────────────────────────────────────────────────
// SECTION 4: Barrel File Import Leakage Investigation
// ─────────────────────────────────────────────────────────────
console.log('\n--- [4] Barrel File Import Leakage Investigation ---');

const expFile = fs.readFileSync(path.join(rootDir, 'frontend', 'src', 'sections', 'Experience.jsx'), 'utf8');
const certFile = fs.readFileSync(path.join(rootDir, 'frontend', 'src', 'sections', 'Certificates.jsx'), 'utf8');
const barrelFile = fs.readFileSync(path.join(rootDir, 'frontend', 'src', 'components', 'index.js'), 'utf8');

const expImportsFromBarrel = /from ['"]\.\.\/components['"]/.test(expFile);
const certImportsFromBarrel = /from ['"]\.\.\/components['"]/.test(certFile);
const barrelExportsAdminLayout = /AdminLayout/.test(barrelFile);

console.log(`Experience.jsx imports from '../components': ${expImportsFromBarrel}`);
console.log(`Certificates.jsx imports from '../components': ${certImportsFromBarrel}`);
console.log(`components/index.js exports AdminLayout: ${barrelExportsAdminLayout}`);

// Check whether AdminLayout is leaked into main chunk
const hasAdminLayoutChunk = jsFiles.some(f => f.startsWith('AdminLayout-'));
console.log(`AdminLayout has separate chunk: ${hasAdminLayoutChunk}`);

// Challenge assertions:
// AdminLayout is intended to be dynamically imported:
// const AdminLayout = lazy(() => import('./components/AdminLayout'));
// BUT components/index.js does:
// export { default as AdminLayout } from './AdminLayout';
// AND Experience.jsx and Certificates.jsx import from '../components':
// import { Spinner } from '../components';
// This creates an INEFFECTIVE_DYNAMIC_IMPORT warning in Vite build!
assert(!expImportsFromBarrel, 'Experience.jsx should NOT import through ../components barrel (prevents admin leakage)', 'Found: import { Spinner } from "../components" at Experience.jsx:5');
assert(!certImportsFromBarrel, 'Certificates.jsx should NOT import through ../components barrel (prevents admin leakage)', 'Found: import { Spinner } from "../components" at Certificates.jsx:6');
assert(!barrelExportsAdminLayout, 'components/index.js should NOT export AdminLayout if it is lazy-loaded', 'Found: export { default as AdminLayout } from "./AdminLayout" at components/index.js:11');
assert(hasAdminLayoutChunk, 'AdminLayout must be partitioned into its own separate chunk rather than bundled into main bundle', 'AdminLayout chunk not generated; Vite warned INEFFECTIVE_DYNAMIC_IMPORT');

// ─────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────
console.log('\n====================================================');
console.log(`AUDIT SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED out of ${totalTests} checks`);
if (failedTests > 0) {
  console.log('\nFailed Checks Summary:');
  failures.forEach((f, i) => {
    console.log(`  [${i + 1}] ${f.message}`);
    if (f.details) console.log(`      ${f.details}`);
  });
}
console.log('====================================================\n');

process.exit(failedTests > 0 ? 1 : 0);
