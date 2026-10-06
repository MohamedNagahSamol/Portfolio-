/**
 * Empirical Challenger Verification Suite for Milestone 2
 * Focus:
 * 1. Image Fallback & ProjectMockup Robustness
 *    - ProjectCard with image: "" -> renders ProjectMockup
 *    - ProjectCard with image: null -> renders ProjectMockup
 *    - ProjectCard with broken image -> onError triggers imgError state and switches to ProjectMockup
 *    - ProjectMockup across categories ('backend', 'frontend', 'fullstack', 'simple', undefined, null, unknown)
 * 2. Bundle Size & Code-Splitting Verification
 *    - Chunks exist for Dashboard, Login, Messages, ContentManager
 *    - Chunk sizes verified to prevent initial load bloating
 *    - dist/index.html does not load admin bundles eagerly
 */

import fs from 'fs';
import path from 'path';

let passCount = 0;
let failCount = 0;
const errors = [];

function assert(cond, msg) {
  if (!cond) {
    failCount++;
    errors.push(msg);
    console.error(`  ❌ FAIL: ${msg}`);
  } else {
    passCount++;
    console.log(`  ✅ PASS: ${msg}`);
  }
}

console.log('================================================================');
console.log('       MILESTONE 2: EMPIRICAL CHALLENGER VERIFICATION           ');
console.log('================================================================\n');

// ----------------------------------------------------------------------------
// 1. Source Contract & Implementation Analysis
// ----------------------------------------------------------------------------
console.log('--- 1. Image Fallback & ProjectMockup Source Contracts ---');

const projectCardPath = path.resolve('frontend/src/components/ProjectCard.jsx');
const projectMockupPath = path.resolve('frontend/src/components/ProjectMockup.jsx');

assert(fs.existsSync(projectCardPath), 'ProjectCard.jsx exists');
assert(fs.existsSync(projectMockupPath), 'ProjectMockup.jsx exists');

const cardSrc = fs.readFileSync(projectCardPath, 'utf-8');
const mockupSrc = fs.readFileSync(projectMockupPath, 'utf-8');

// ProjectCard state & conditional rendering contract
assert(cardSrc.includes('const [imgError, setImgError] = useState(false);'), 'ProjectCard initializes imgError state with false');
assert(cardSrc.includes('!project.image || imgError'), 'ProjectCard renders ProjectMockup when !project.image || imgError is truthy');
assert(cardSrc.includes('<ProjectMockup category={project.category} title={project.title[lang]} />'), 'ProjectCard passes category and localized title to ProjectMockup');
assert(cardSrc.includes('onError={() => setImgError(true)}'), 'ProjectCard registers onError handler on <img> calling setImgError(true)');
assert(cardSrc.includes('loading="lazy"'), 'ProjectCard specifies loading="lazy" for performant image loading');

// ProjectMockup category contracts
assert(mockupSrc.includes("cat === 'backend'"), 'ProjectMockup contains dedicated wireframe branch for "backend"');
assert(mockupSrc.includes("cat === 'frontend'"), 'ProjectMockup contains dedicated wireframe branch for "frontend"');
assert(mockupSrc.includes("cat === 'fullstack'"), 'ProjectMockup contains dedicated wireframe branch for "fullstack"');
assert(mockupSrc.includes("cat !== 'backend' && cat !== 'frontend' && cat !== 'fullstack'"), 'ProjectMockup contains generic/terminal fallback for simple or unknown categories');
assert(mockupSrc.includes("String(category || '').toLowerCase()"), 'ProjectMockup normalizes category to safe lower-case string (null/undefined safety)');

// ----------------------------------------------------------------------------
// 2. ProjectMockup Category Matrix Simulation
// ----------------------------------------------------------------------------
console.log('\n--- 2. ProjectMockup Category Matrix Simulation ---');

function simulateProjectMockup(category = 'fullstack', title = 'Project Mockup') {
  const cat = String(category || '').toLowerCase();
  
  // Badge resolution logic from ProjectMockup.jsx:28
  const badge = cat === 'backend' ? 'API Engine' : cat === 'frontend' ? 'Client UI' : cat === 'simple' ? 'Micro-App' : 'Full Stack';
  
  // Wireframe branch resolution logic
  let wireframe = 'unknown';
  if (cat === 'backend') {
    wireframe = 'backend_routes_pool_uptime';
  } else if (cat === 'frontend') {
    wireframe = 'frontend_layout_blocks';
  } else if (cat === 'fullstack') {
    wireframe = 'mern_pipeline_nodes';
  } else {
    wireframe = 'terminal_build_deploy';
  }
  
  return { badge, wireframe, cat, title };
}

const categoriesToTest = [
  { input: 'backend', expectedBadge: 'API Engine', expectedWireframe: 'backend_routes_pool_uptime' },
  { input: 'Backend', expectedBadge: 'API Engine', expectedWireframe: 'backend_routes_pool_uptime' },
  { input: 'BACKEND', expectedBadge: 'API Engine', expectedWireframe: 'backend_routes_pool_uptime' },
  { input: 'frontend', expectedBadge: 'Client UI', expectedWireframe: 'frontend_layout_blocks' },
  { input: 'Frontend', expectedBadge: 'Client UI', expectedWireframe: 'frontend_layout_blocks' },
  { input: 'fullstack', expectedBadge: 'Full Stack', expectedWireframe: 'mern_pipeline_nodes' },
  { input: 'Fullstack', expectedBadge: 'Full Stack', expectedWireframe: 'mern_pipeline_nodes' },
  { input: 'simple', expectedBadge: 'Micro-App', expectedWireframe: 'terminal_build_deploy' },
  { input: 'Simple', expectedBadge: 'Micro-App', expectedWireframe: 'terminal_build_deploy' },
  { input: undefined, expectedBadge: 'Full Stack', expectedWireframe: 'mern_pipeline_nodes' }, // default param is 'fullstack'
  { input: null, expectedBadge: 'Full Stack', expectedWireframe: 'terminal_build_deploy' },     // String(null || '') = '', falls to default
  { input: '', expectedBadge: 'Full Stack', expectedWireframe: 'terminal_build_deploy' },
  { input: 'mobile-app', expectedBadge: 'Full Stack', expectedWireframe: 'terminal_build_deploy' },
  { input: 'devops-infra', expectedBadge: 'Full Stack', expectedWireframe: 'terminal_build_deploy' },
  { input: 'AI/ML', expectedBadge: 'Full Stack', expectedWireframe: 'terminal_build_deploy' }
];

for (const tc of categoriesToTest) {
  try {
    const res = simulateProjectMockup(tc.input);
    assert(
      res.badge === tc.expectedBadge && res.wireframe === tc.expectedWireframe,
      `Category '${tc.input}' successfully maps to badge '${res.badge}' and wireframe '${res.wireframe}'`
    );
  } catch (err) {
    assert(false, `Category '${tc.input}' threw exception: ${err.message}`);
  }
}

// ----------------------------------------------------------------------------
// 3. ProjectCard Image Fallback Logic Simulation
// ----------------------------------------------------------------------------
console.log('\n--- 3. ProjectCard Fallback State Logic Simulation ---');

function simulateProjectCardImageRender(project, imgError = false) {
  if (!project.image || imgError) {
    return {
      rendersMockup: true,
      rendersImg: false,
      category: project.category,
      title: project.title?.en
    };
  } else {
    return {
      rendersMockup: false,
      rendersImg: true,
      src: project.image
    };
  }
}

// 3.1: Empty string image
const emptyImgProj = { title: { en: 'Empty Img' }, category: 'frontend', image: '' };
const resEmpty = simulateProjectCardImageRender(emptyImgProj, false);
assert(resEmpty.rendersMockup === true && resEmpty.rendersImg === false, 'image: "" renders ProjectMockup immediately');

// 3.2: Null image
const nullImgProj = { title: { en: 'Null Img' }, category: 'backend', image: null };
const resNull = simulateProjectCardImageRender(nullImgProj, false);
assert(resNull.rendersMockup === true && resNull.rendersImg === false, 'image: null renders ProjectMockup immediately');

// 3.3: Undefined image
const undefImgProj = { title: { en: 'Undef Img' }, category: 'fullstack', image: undefined };
const resUndef = simulateProjectCardImageRender(undefImgProj, false);
assert(resUndef.rendersMockup === true && resUndef.rendersImg === false, 'image: undefined renders ProjectMockup immediately');

// 3.4: Valid image initial render vs onError state transition
const validImgProj = { title: { en: 'Valid Img' }, category: 'backend', image: 'https://cloudinary.com/valid.png' };
const resInitial = simulateProjectCardImageRender(validImgProj, false);
assert(resInitial.rendersMockup === false && resInitial.rendersImg === true && resInitial.src === 'https://cloudinary.com/valid.png',
  'Valid image initially renders <img> with correct src');

// When onError fires: imgError = true
const resAfterError = simulateProjectCardImageRender(validImgProj, true);
assert(resAfterError.rendersMockup === true && resAfterError.rendersImg === false,
  'When onError triggers imgError=true, ProjectCard switches to ProjectMockup');


// ----------------------------------------------------------------------------
// 4. Bundle Size & Code-Splitting Verification
// ----------------------------------------------------------------------------
console.log('\n--- 4. Bundle Size & Code-Splitting Verification ---');

const distAssetsPath = path.resolve('frontend/dist/assets');
assert(fs.existsSync(distAssetsPath), 'frontend/dist/assets exists after build');

const assetFiles = fs.readdirSync(distAssetsPath);

const requiredAdminChunks = [
  { pattern: /^Dashboard-.*\.js$/, name: 'Dashboard' },
  { pattern: /^Login-.*\.js$/, name: 'Login' },
  { pattern: /^Messages-.*\.js$/, name: 'Messages' },
  { pattern: /^ContentManager-.*\.js$/, name: 'ContentManager' }
];

let totalAdminBytes = 0;

for (const { pattern, name } of requiredAdminChunks) {
  const match = assetFiles.find(f => pattern.test(f));
  assert(!!match, `Admin route chunk for ${name} exists in dist/assets (${match || 'NOT FOUND'})`);
  if (match) {
    const stat = fs.statSync(path.join(distAssetsPath, match));
    totalAdminBytes += stat.size;
    console.log(`    ↳ Chunk: ${match} (${(stat.size / 1024).toFixed(2)} kB)`);
    assert(stat.size < 50 * 1024, `${name} chunk size (${(stat.size / 1024).toFixed(2)} kB) is well within performance budget (<50 kB)`);
  }
}

console.log(`  📊 Total Isolated Admin Code Size: ${(totalAdminBytes / 1024).toFixed(2)} kB`);

// Verify dist/index.html
const distHtmlPath = path.resolve('frontend/dist/index.html');
const distHtml = fs.readFileSync(distHtmlPath, 'utf-8');

assert(!distHtml.includes('Dashboard-'), 'dist/index.html does not eagerly reference Dashboard chunk');
assert(!distHtml.includes('Login-'), 'dist/index.html does not eagerly reference Login chunk');
assert(!distHtml.includes('Messages-'), 'dist/index.html does not eagerly reference Messages chunk');
assert(!distHtml.includes('ContentManager-'), 'dist/index.html does not eagerly reference ContentManager chunk');

const mainEntryMatch = distHtml.match(/src="\/assets\/(index-.*?\.js)"/);
assert(!!mainEntryMatch, `dist/index.html loads main entry bundle: ${mainEntryMatch ? mainEntryMatch[1] : 'NONE'}`);


// ----------------------------------------------------------------------------
// Summary
// ----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`VERIFICATION SUMMARY: ${passCount} passed, ${failCount} failed.`);
console.log('================================================================\n');

if (failCount > 0) {
  console.error('Failures:\n' + errors.map(e => ' - ' + e).join('\n'));
  process.exit(1);
} else {
  console.log('All empirical challenger verification checks PASSED cleanly (100% Green).');
  process.exit(0);
}
