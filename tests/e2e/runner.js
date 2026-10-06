#!/usr/bin/env node

import { registry, colors, getDiscoveredBugs } from './harness.js';
import { registerTier1Tests } from './tier1-features.js';
import { registerTier2Tests } from './tier2-boundaries.js';
import { registerTier3Tests } from './tier3-crossfeature.js';
import { registerTier4Tests } from './tier4-scenarios.js';

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  tier: null,
  all: true,
  verbose: args.includes('--verbose') || args.includes('-v')
};

for (const arg of args) {
  if (arg.startsWith('--tier=')) {
    options.tier = parseInt(arg.split('=')[1], 10);
    options.all = false;
  }
}

async function main() {
  console.log(`${colors.bold}${colors.cyan}`);
  console.log('======================================================================');
  console.log('       FULL-STACK MERN BILINGUAL PORTFOLIO - E2E TEST RUNNER         ');
  console.log('======================================================================');
  console.log(`${colors.reset}`);
  console.log(`${colors.gray}Target API: ${process.env.API_BASE_URL || 'http://localhost:5000/api'}${colors.reset}`);
  console.log(`${colors.gray}Timestamp:  ${new Date().toISOString()}${colors.reset}`);
  console.log(`${colors.gray}Mode:       ${options.tier ? `Tier ${options.tier} Only` : 'All Tiers (Tiers 1-4)'}${colors.reset}\n`);

  registry.clear();

  // Register selected tiers
  if (options.all || options.tier === 1) {
    registerTier1Tests();
  }
  if (options.all || options.tier === 2) {
    registerTier2Tests();
  }
  if (options.all || options.tier === 3) {
    registerTier3Tests();
  }
  if (options.all || options.tier === 4) {
    registerTier4Tests();
  }

  // Run all registered suites
  const { stats, results } = await registry.runSuites({ verbose: options.verbose });

  // Discovered Bugs for Escalation
  const bugs = getDiscoveredBugs();

  console.log(`\n${colors.bold}${colors.cyan}======================================================================`);
  console.log('                      TEST EXECUTION SUMMARY                          ');
  console.log(`======================================================================${colors.reset}`);

  console.log(`\n${colors.bold}Overall Statistics:${colors.reset}`);
  console.log(`  Total Tests Run: ${stats.total}`);
  console.log(`  ${colors.green}✓ Passed:         ${stats.passed}${colors.reset}`);
  console.log(`  ${stats.failed > 0 ? colors.red : colors.gray}✗ Failed:         ${stats.failed}${colors.reset}`);
  console.log(`  ${stats.skipped > 0 ? colors.yellow : colors.gray}⊘ Skipped:        ${stats.skipped}${colors.reset}`);
  console.log(`  Duration:        ${stats.duration}ms\n`);

  if (bugs.length > 0) {
    console.log(`${colors.bold}${colors.yellow}Discovered Implementation Bugs / Anomalies for Escalation (${bugs.length}):${colors.reset}`);
    bugs.forEach((b, idx) => {
      console.log(`  ${idx + 1}. [Feature ${b.featureId}] [${b.severity}] ${colors.bold}${b.title}${colors.reset}`);
      console.log(`     Location: ${colors.cyan}${b.location}${colors.reset}`);
      console.log(`     Details:  ${colors.gray}${b.details}${colors.reset}`);
    });
    console.log('');
  }

  if (stats.failed > 0) {
    console.log(`${colors.bold}${colors.red}======================================================================`);
    console.log(`  FAILED: ${stats.failed} test(s) failed.`);
    console.log(`======================================================================${colors.reset}\n`);
    process.exit(1);
  } else {
    console.log(`${colors.bold}${colors.green}======================================================================`);
    console.log(`  SUCCESS: All ${stats.passed} test(s) passed cleanly!`);
    console.log(`======================================================================${colors.reset}\n`);
    process.exit(0);
  }
}

main().catch((err) => {
  console.error(`${colors.red}Fatal Runner Error: ${err.message}${colors.reset}`);
  if (err.stack) console.error(err.stack);
  process.exit(1);
});
