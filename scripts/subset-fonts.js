/**
 * Font Subsetting Script
 * Analyzes used characters and subsets fonts to reduce file size
 *
 * This script:
 * 1. Analyzes HTML files for used characters
 * 2. Extracts unique characters
 * 3. Provides subsetting instructions
 *
 * Note: Actual font subsetting requires external tools like:
 * - glyphhanger (npm install -g glyphhanger)
 * - pyftsubset (Python fonttools)
 * - fonttools (Python package)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Extract all text content from HTML files
 */
function extractTextFromHTML(htmlContent) {
  // Remove script and style tags
  let text = htmlContent.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  // Extract text content
  text = text.replace(/<[^>]+>/g, ' ');

  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");

  return text;
}

/**
 * Extract unique characters from text
 */
function extractUniqueChars(text) {
  const chars = new Set();

  for (const char of text) {
    if (char.trim() || char === ' ') {
      chars.add(char);
    }
  }

  return Array.from(chars).sort().join('');
}

/**
 * Analyze HTML files for used characters
 */
async function analyzeUsedCharacters() {
  const htmlFiles = await glob('./**/*.html', {
    ignore: ['node_modules/**', 'dist/**'],
  });

  let allText = '';

  console.log('📄 Analyzing HTML files for used characters...\n');

  for (const file of htmlFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const text = extractTextFromHTML(content);
    allText += text;
    console.log(`   ✅ Analyzed: ${file}`);
  }

  const uniqueChars = extractUniqueChars(allText);

  // Add common characters that might be used
  const commonChars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!?;:()[]{}\'"-–—…•@#$%^&*+=|\\/<>~`';
  const allChars = new Set(uniqueChars + commonChars);
  const finalChars = Array.from(allChars).sort().join('');

  console.log(`\n📊 Analysis Results:`);
  console.log(`   Total unique characters: ${finalChars.length}`);
  console.log(
    `   Characters: ${finalChars.substring(0, 100)}${finalChars.length > 100 ? '...' : ''}`
  );

  return finalChars;
}

/**
 * Generate subsetting instructions
 */
function generateSubsettingInstructions(chars) {
  const instructions = `
# Font Subsetting Instructions

## Used Characters Analysis

**Total unique characters found:** ${chars.length}

**Characters to include:**
${chars}

## Subsetting Methods

### Method 1: Using glyphhanger (Recommended)

1. **Install glyphhanger:**
   \`\`\`bash
   npm install -g glyphhanger
   \`\`\`

2. **Subset fonts:**
   \`\`\`bash
   # Orbitron fonts
   glyphhanger --subset=./assets/fonts/Orbitron/woff2/*.woff2 --formats=woff2 --US_ASCII --whitelist="${chars.replace(/"/g, '\\"')}"
   
   # Rajdhani fonts
   glyphhanger --subset=./assets/fonts/Rajdhani/woff2/*.woff2 --formats=woff2 --US_ASCII --whitelist="${chars.replace(/"/g, '\\"')}"
   \`\`\`

### Method 2: Using pyftsubset (Python)

1. **Install fonttools:**
   \`\`\`bash
   pip install fonttools
   \`\`\`

2. **Subset fonts:**
   \`\`\`bash
   # For each font file:
   pyftsubset font.woff2 --unicodes="${chars
     .split('')
     .map(c => 'U+' + c.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0'))
     .join(',')}" --output-file=font-subset.woff2 --flavor=woff2
   \`\`\`

### Method 3: Using Google Fonts Helper

1. Visit: https://google-webfonts-helper.herokuapp.com/
2. Select font (Orbitron or Rajdhani)
3. Select weights you need
4. Choose "Subset" option
5. Select "Latin" or "Custom subset"
6. Download subsetted fonts

## Expected Results

- **30-50% smaller font files**
- **Faster font loading**
- **Only includes used characters**

## Font Weights Used

Based on CSS analysis:
- **Orbitron:** 400 (Regular), 700 (Bold), 900 (Black)
- **Rajdhani:** 300 (Light), 400 (Regular), 600 (SemiBold), 700 (Bold)

## Next Steps

1. Run subsetting tool on font files
2. Replace original fonts with subsetted versions
3. Test font rendering
4. Verify all characters display correctly
5. Update font file sizes in documentation

---

**Generated:** ${new Date().toISOString()}
`;

  return instructions;
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('🔤 Font Subsetting Analysis\n');
    console.log('='.repeat(50));

    const chars = await analyzeUsedCharacters();
    const instructions = generateSubsettingInstructions(chars);

    // Save instructions to file
    const outputPath = path.join(__dirname, '../docs/FONT_SUBSETTING_INSTRUCTIONS.md');
    fs.writeFileSync(outputPath, instructions, 'utf-8');

    console.log(`\n✅ Instructions saved to: ${outputPath}`);
    console.log('\n📝 Next Steps:');
    console.log('   1. Review FONT_SUBSETTING_INSTRUCTIONS.md');
    console.log('   2. Choose subsetting method');
    console.log('   3. Run subsetting tool on font files');
    console.log('   4. Replace original fonts with subsetted versions');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run if called directly
// Check if this is the main module by comparing file paths
const scriptPath = fileURLToPath(import.meta.url);
const isMainModule =
  process.argv[1] &&
  (scriptPath === process.argv[1] ||
    scriptPath.replace(/\\/g, '/') === process.argv[1].replace(/\\/g, '/') ||
    scriptPath.endsWith(process.argv[1].split(/[/\\]/).pop()));

if (isMainModule || !process.argv[1] || process.argv[1].includes('subset-fonts')) {
  main();
}

export { analyzeUsedCharacters, extractUniqueChars };
