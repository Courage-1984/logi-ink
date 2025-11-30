/**
 * CSS Specificity Analysis Script
 *
 * Analyzes CSS files to identify:
 * - High specificity selectors (potential conflicts)
 * - Selector conflicts (same selector defined multiple times)
 * - !important usage
 * - Specificity distribution
 *
 * Based on Phase 3: Code Quality Assessment requirements
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';
import { parse } from 'css';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Files to exclude
const excludePatterns = [
  '**/*.backup',
  '**/node_modules/**',
  '**/dist/**',
];

/**
 * Calculate CSS specificity
 * Returns: [inline, IDs, classes/attrs/pseudo, elements]
 */
function calculateSpecificity(selector) {
  const specificity = [0, 0, 0, 0];

  // Remove pseudo-elements (::before, ::after) for counting
  const cleanSelector = selector.replace(/::[a-z-]+/gi, '');

  // Count IDs
  const idMatches = cleanSelector.match(/#[a-z0-9_-]+/gi);
  if (idMatches) {
    specificity[1] = idMatches.length;
  }

  // Count classes, attributes, and pseudo-classes
  const classMatches = cleanSelector.match(/\.[a-z0-9_-]+/gi);
  const attrMatches = cleanSelector.match(/\[[^\]]+\]/gi);
  const pseudoMatches = cleanSelector.match(/:[a-z-]+(?!:)/gi);

  specificity[2] = (classMatches?.length || 0) +
                    (attrMatches?.length || 0) +
                    (pseudoMatches?.length || 0);

  // Count elements and pseudo-elements
  const elementMatches = cleanSelector.match(/^[a-z]+|(?<=\s)[a-z]+/gi);
  const pseudoElementMatches = selector.match(/::[a-z-]+/gi);

  specificity[3] = (elementMatches?.length || 0) +
                    (pseudoElementMatches?.length || 0);

  return specificity;
}

/**
 * Format specificity as string (e.g., "0,1,2,1")
 */
function formatSpecificity(specificity) {
  return specificity.join(',');
}

/**
 * Calculate specificity score (for sorting)
 */
function specificityScore(specificity) {
  return specificity[0] * 1000 +
         specificity[1] * 100 +
         specificity[2] * 10 +
         specificity[3];
}

/**
 * Parse CSS file and extract rules
 */
function parseCSSFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(projectRoot, filePath);

  try {
    const ast = parse(content, { source: relativePath });
    const rules = [];

    function processRule(rule, parentSelector = '') {
      if (rule.type === 'rule') {
        const selectors = rule.selectors || [];

        selectors.forEach(selector => {
          const fullSelector = parentSelector ? `${parentSelector} ${selector}` : selector;
          const specificity = calculateSpecificity(fullSelector);

          // Check for !important
          let hasImportant = false;
          rule.declarations?.forEach(decl => {
            if (decl.type === 'declaration' && decl.important) {
              hasImportant = true;
            }
          });

          rules.push({
            selector: fullSelector,
            specificity,
            specificityString: formatSpecificity(specificity),
            specificityScore: specificityScore(specificity),
            hasImportant,
            file: relativePath,
            declarations: rule.declarations?.filter(d => d.type === 'declaration').length || 0,
          });
        });
      } else if (rule.type === 'media') {
        // Process media query rules
        rule.rules?.forEach(mediaRule => {
          processRule(mediaRule, `@media ${rule.media}`);
        });
      }
    }

    ast.stylesheet?.rules?.forEach(rule => {
      processRule(rule);
    });

    return rules;
  } catch (error) {
    console.warn(`⚠️  Could not parse ${relativePath}: ${error.message}`);
    return [];
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Analyzing CSS Specificity...\n');

  const cssFiles = await glob('css/**/*.css', {
    cwd: projectRoot,
    ignore: excludePatterns,
    absolute: true,
  });

  console.log(`Found ${cssFiles.length} CSS files to analyze\n`);

  const allRules = [];
  const selectorMap = new Map(); // selector -> [rules]
  const importantRules = [];

  // Parse all CSS files
  for (const file of cssFiles) {
    const rules = parseCSSFile(file);
    allRules.push(...rules);

    rules.forEach(rule => {
      if (!selectorMap.has(rule.selector)) {
        selectorMap.set(rule.selector, []);
      }
      selectorMap.get(rule.selector).push(rule);

      if (rule.hasImportant) {
        importantRules.push(rule);
      }
    });
  }

  // Find conflicts (same selector defined multiple times)
  const conflicts = [];
  selectorMap.forEach((rules, selector) => {
    if (rules.length > 1) {
      conflicts.push({
        selector,
        count: rules.length,
        locations: rules.map(r => ({
          file: r.file,
          specificity: r.specificityString,
          hasImportant: r.hasImportant,
        })),
      });
    }
  });

  // Find high specificity selectors (score > 30 or has IDs)
  const highSpecificity = allRules
    .filter(r => r.specificityScore > 30 || r.specificity[1] > 0)
    .sort((a, b) => b.specificityScore - a.specificityScore)
    .slice(0, 50); // Top 50

  // Calculate statistics
  const stats = {
    totalSelectors: allRules.length,
    uniqueSelectors: selectorMap.size,
    duplicateSelectors: conflicts.length,
    highSpecificityCount: highSpecificity.length,
    importantCount: importantRules.length,
    specificityDistribution: {
      low: allRules.filter(r => r.specificityScore <= 10).length,
      medium: allRules.filter(r => r.specificityScore > 10 && r.specificityScore <= 30).length,
      high: allRules.filter(r => r.specificityScore > 30).length,
    },
  };

  // Print summary
  console.log('📊 Specificity Analysis Summary:\n');
  console.log(`Total selectors: ${stats.totalSelectors}`);
  console.log(`Unique selectors: ${stats.uniqueSelectors}`);
  console.log(`Duplicate selectors: ${conflicts.length}`);
  console.log(`High specificity selectors (>30): ${stats.highSpecificityCount}`);
  console.log(`!important declarations: ${stats.importantCount}\n`);

  console.log('Specificity Distribution:');
  console.log(`  Low (≤10): ${stats.specificityDistribution.low}`);
  console.log(`  Medium (11-30): ${stats.specificityDistribution.medium}`);
  console.log(`  High (>30): ${stats.specificityDistribution.high}\n`);

  // Print top high specificity selectors
  if (highSpecificity.length > 0) {
    console.log('🔴 Top High Specificity Selectors:\n');
    highSpecificity.slice(0, 20).forEach((rule, index) => {
      console.log(`${index + 1}. ${rule.selector}`);
      console.log(`   Specificity: ${rule.specificityString} (score: ${rule.specificityScore})`);
      console.log(`   File: ${rule.file}`);
      if (rule.hasImportant) {
        console.log(`   ⚠️  Contains !important`);
      }
      console.log('');
    });
  }

  // Print conflicts
  if (conflicts.length > 0) {
    console.log('⚠️  Selector Conflicts (defined multiple times):\n');
    conflicts.slice(0, 20).forEach((conflict, index) => {
      console.log(`${index + 1}. ${conflict.selector} (${conflict.count} times)`);
      conflict.locations.forEach((loc, locIndex) => {
        console.log(`   ${locIndex + 1}. ${loc.file} (${loc.specificity})${loc.hasImportant ? ' [!important]' : ''}`);
      });
      console.log('');
    });
  }

  // Print !important usage
  if (importantRules.length > 0) {
    console.log('⚠️  Rules with !important:\n');
    const importantByFile = {};
    importantRules.forEach(rule => {
      if (!importantByFile[rule.file]) {
        importantByFile[rule.file] = [];
      }
      importantByFile[rule.file].push(rule);
    });

    Object.entries(importantByFile).forEach(([file, rules]) => {
      console.log(`  ${file}: ${rules.length} rules`);
    });
    console.log('');
  }

  // Save detailed report
  const report = {
    summary: stats,
    highSpecificity: highSpecificity.map(r => ({
      selector: r.selector,
      specificity: r.specificityString,
      specificityScore: r.specificityScore,
      file: r.file,
      hasImportant: r.hasImportant,
    })),
    conflicts: conflicts.map(c => ({
      selector: c.selector,
      count: c.count,
      locations: c.locations,
    })),
    importantRules: importantRules.map(r => ({
      selector: r.selector,
      file: r.file,
      specificity: r.specificityString,
    })),
  };

  const reportPath = path.join(projectRoot, 'audit-reports', 'specificity-analysis.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  console.log(`✅ Detailed report saved to: audit-reports/specificity-analysis.json`);

  // Recommendations
  console.log('\n💡 Recommendations:\n');

  if (stats.highSpecificityCount > 20) {
    console.log('  ⚠️  High specificity count detected. Consider:');
    console.log('     - Reducing selector depth');
    console.log('     - Avoiding ID selectors');
    console.log('     - Using BEM methodology for lower specificity');
  }

  if (conflicts.length > 10) {
    console.log('  ⚠️  Multiple selector conflicts detected. Consider:');
    console.log('     - Consolidating duplicate selectors');
    console.log('     - Reviewing CSS architecture');
  }

  if (stats.importantCount > 10) {
    console.log('  ⚠️  High !important usage detected. Consider:');
    console.log('     - Reducing !important declarations');
    console.log('     - Using higher specificity instead');
    console.log('     - Restructuring CSS architecture');
  }

  if (stats.highSpecificityCount <= 20 && conflicts.length <= 10 && stats.importantCount <= 10) {
    console.log('  ✅ Specificity is well-managed!');
  }
}

main().catch(console.error);

