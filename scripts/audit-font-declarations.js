/**
 * Font Declaration Audit Script
 *
 * Reviews @font-face declarations to identify:
 * - All declared fonts
 * - Font file usage
 * - Font-display values
 * - Missing font files
 * - Unused font declarations
 * - Font loading strategy consistency
 *
 * Based on Phase 3: Code Quality Assessment requirements
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

/**
 * Parse @font-face declarations from CSS
 */
function parseFontFaces(content, filePath) {
  const fontFaces = [];
  const relativePath = path.relative(projectRoot, filePath);

  // Match @font-face blocks
  const fontFaceRegex = /@font-face\s*\{([^}]+)\}/g;
  let match;

  while ((match = fontFaceRegex.exec(content)) !== null) {
    const block = match[1];
    const fontFace = {
      file: relativePath,
      family: null,
      src: [],
      weight: null,
      style: null,
      display: null,
      unicodeRange: null,
    };

    // Extract font-family
    const familyMatch = block.match(/font-family:\s*['"]?([^'";]+)['"]?/i);
    if (familyMatch) {
      fontFace.family = familyMatch[1].trim();
    }

    // Extract src (can have multiple sources)
    const srcMatch = block.match(/src:\s*([^;]+)/i);
    if (srcMatch) {
      const srcValue = srcMatch[1];
      // Match url() declarations
      const urlRegex = /url\(['"]?([^'")]+)['"]?\)/gi;
      let urlMatch;
      while ((urlMatch = urlRegex.exec(srcValue)) !== null) {
        fontFace.src.push(urlMatch[1].trim());
      }
    }

    // Extract font-weight
    const weightMatch = block.match(/font-weight:\s*(\d+|normal|bold)/i);
    if (weightMatch) {
      fontFace.weight = weightMatch[1];
    }

    // Extract font-style
    const styleMatch = block.match(/font-style:\s*(normal|italic|oblique)/i);
    if (styleMatch) {
      fontFace.style = styleMatch[1];
    }

    // Extract font-display
    const displayMatch = block.match(/font-display:\s*(\w+)/i);
    if (displayMatch) {
      fontFace.display = displayMatch[1];
    } else {
      fontFace.display = 'auto'; // Default
    }

    // Extract unicode-range
    const unicodeMatch = block.match(/unicode-range:\s*([^;]+)/i);
    if (unicodeMatch) {
      fontFace.unicodeRange = unicodeMatch[1].trim();
    }

    fontFaces.push(fontFace);
  }

  return fontFaces;
}

/**
 * Check if font file exists
 */
function checkFontFileExists(fontPath) {
  // Handle relative paths
  const fullPath = path.isAbsolute(fontPath)
    ? fontPath
    : path.resolve(projectRoot, fontPath);

  return fs.existsSync(fullPath);
}

/**
 * Get font file size
 */
function getFontFileSize(fontPath) {
  const fullPath = path.isAbsolute(fontPath)
    ? fontPath
    : path.resolve(projectRoot, fontPath);

  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    return stats.size;
  }
  return null;
}

/**
 * Find all font files in assets/fonts
 */
function findAllFontFiles() {
  const fontFiles = [];
  const fontsDir = path.join(projectRoot, 'assets', 'fonts');

  if (fs.existsSync(fontsDir)) {
    const files = fs.readdirSync(fontsDir, { recursive: true });
    files.forEach(file => {
      if (typeof file === 'string' && /\.(woff2?|ttf|otf|eot)$/i.test(file)) {
        const fullPath = path.join(fontsDir, file);
        if (fs.statSync(fullPath).isFile()) {
          const stats = fs.statSync(fullPath);
          fontFiles.push({
            path: path.relative(projectRoot, fullPath),
            name: file,
            size: stats.size,
            exists: true,
          });
        }
      }
    });
  }

  return fontFiles;
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Auditing Font Declarations...\n');

  // Find all CSS files
  const cssFiles = await glob('css/**/*.css', {
    cwd: projectRoot,
    ignore: ['**/*.backup', '**/node_modules/**', '**/dist/**'],
    absolute: true,
  });

  console.log(`Found ${cssFiles.length} CSS files to analyze\n`);

  // Parse all @font-face declarations
  const allFontFaces = [];
  for (const file of cssFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const fontFaces = parseFontFaces(content, file);
    allFontFaces.push(...fontFaces);
  }

  // Find all font files
  const allFontFiles = findAllFontFiles();

  console.log(`Found ${allFontFaces.length} @font-face declarations\n`);
  console.log(`Found ${allFontFiles.length} font files in assets/fonts\n`);

  // Analyze font declarations
  const analysis = {
    declarations: allFontFaces,
    fontFiles: allFontFiles,
    families: {},
    issues: {
      missingFiles: [],
      unusedFiles: [],
      missingDisplay: [],
      inconsistentDisplay: {},
      duplicateDeclarations: [],
    },
  };

  // Group by font family
  allFontFaces.forEach(face => {
    if (!analysis.families[face.family]) {
      analysis.families[face.family] = {
        family: face.family,
        declarations: [],
        weights: new Set(),
        styles: new Set(),
        displays: new Set(),
        files: [],
      };
    }

    analysis.families[face.family].declarations.push(face);
    if (face.weight) analysis.families[face.family].weights.add(face.weight);
    if (face.style) analysis.families[face.family].styles.add(face.style);
    analysis.families[face.family].displays.add(face.display);

    // Check font files
    face.src.forEach(srcPath => {
      const exists = checkFontFileExists(srcPath);
      const size = getFontFileSize(srcPath);

      analysis.families[face.family].files.push({
        path: srcPath,
        exists,
        size,
      });

      if (!exists) {
        analysis.issues.missingFiles.push({
          family: face.family,
          path: srcPath,
          file: face.file,
        });
      }
    });
  });

  // Check for unused font files
  const declaredPaths = new Set();
  allFontFaces.forEach(face => {
    face.src.forEach(src => declaredPaths.add(src));
  });

  allFontFiles.forEach(fontFile => {
    // Check if this file is referenced in any @font-face
    const isReferenced = Array.from(declaredPaths).some(declaredPath => {
      return declaredPath.includes(fontFile.name) || fontFile.path.includes(fontFile.name);
    });

    if (!isReferenced) {
      analysis.issues.unusedFiles.push(fontFile);
    }
  });

  // Check for missing font-display
  allFontFaces.forEach(face => {
    if (face.display === 'auto' || !face.display) {
      analysis.issues.missingDisplay.push({
        family: face.family,
        file: face.file,
        weight: face.weight,
      });
    }
  });

  // Check for inconsistent font-display within families
  Object.entries(analysis.families).forEach(([family, data]) => {
    if (data.displays.size > 1) {
      analysis.issues.inconsistentDisplay[family] = Array.from(data.displays);
    }
  });

  // Check for duplicate declarations (same family, weight, style)
  const declarationKeys = new Map();
  allFontFaces.forEach((face, index) => {
    const key = `${face.family}-${face.weight || 'normal'}-${face.style || 'normal'}`;
    if (declarationKeys.has(key)) {
      analysis.issues.duplicateDeclarations.push({
        key,
        declarations: [declarationKeys.get(key), index],
      });
    } else {
      declarationKeys.set(key, index);
    }
  });

  // Print summary
  console.log('📊 Font Declaration Summary:\n');
  console.log(`Total @font-face declarations: ${allFontFaces.length}`);
  console.log(`Font families: ${Object.keys(analysis.families).length}`);
  console.log(`Total font files: ${allFontFiles.length}\n`);

  // Print font families
  console.log('Font Families:\n');
  Object.entries(analysis.families).forEach(([family, data]) => {
    console.log(`  ${family}:`);
    console.log(`    Weights: ${Array.from(data.weights).join(', ') || 'none'}`);
    console.log(`    Styles: ${Array.from(data.styles).join(', ') || 'none'}`);
    console.log(`    Font-display: ${Array.from(data.displays).join(', ')}`);
    console.log(`    Files: ${data.files.length}`);
    data.files.forEach(file => {
      const status = file.exists ? '✅' : '❌';
      const size = file.size ? ` (${(file.size / 1024).toFixed(1)}KB)` : '';
      console.log(`      ${status} ${file.path}${size}`);
    });
    console.log('');
  });

  // Print issues
  if (analysis.issues.missingFiles.length > 0) {
    console.log('❌ Missing Font Files:\n');
    analysis.issues.missingFiles.forEach(issue => {
      console.log(`  ${issue.family}: ${issue.path}`);
      console.log(`    Declared in: ${issue.file}`);
    });
    console.log('');
  }

  if (analysis.issues.unusedFiles.length > 0) {
    console.log('⚠️  Unused Font Files:\n');
    analysis.issues.unusedFiles.forEach(file => {
      console.log(`  ${file.path} (${(file.size / 1024).toFixed(1)}KB)`);
    });
    console.log('');
  }

  if (analysis.issues.missingDisplay.length > 0) {
    console.log('⚠️  Missing font-display (using default "auto"):\n');
    analysis.issues.missingDisplay.forEach(issue => {
      console.log(`  ${issue.family} (${issue.weight || 'normal'}) in ${issue.file}`);
    });
    console.log('');
  }

  if (Object.keys(analysis.issues.inconsistentDisplay).length > 0) {
    console.log('⚠️  Inconsistent font-display within families:\n');
    Object.entries(analysis.issues.inconsistentDisplay).forEach(([family, displays]) => {
      console.log(`  ${family}: ${displays.join(', ')}`);
    });
    console.log('');
  }

  if (analysis.issues.duplicateDeclarations.length > 0) {
    console.log('⚠️  Duplicate @font-face declarations:\n');
    analysis.issues.duplicateDeclarations.forEach(dup => {
      console.log(`  ${dup.key}`);
    });
    console.log('');
  }

  // Recommendations
  console.log('💡 Recommendations:\n');

  if (analysis.issues.missingFiles.length > 0) {
    console.log('  ❌ Fix missing font files or remove declarations');
  }

  if (analysis.issues.unusedFiles.length > 0) {
    console.log(`  ⚠️  Consider removing ${analysis.issues.unusedFiles.length} unused font files`);
  }

  if (analysis.issues.missingDisplay.length > 0) {
    console.log('  ⚠️  Add explicit font-display: swap for better performance');
  }

  if (Object.keys(analysis.issues.inconsistentDisplay).length > 0) {
    console.log('  ⚠️  Use consistent font-display values within each font family');
  }

  if (analysis.issues.missingFiles.length === 0 &&
      analysis.issues.unusedFiles.length === 0 &&
      analysis.issues.missingDisplay.length === 0 &&
      Object.keys(analysis.issues.inconsistentDisplay).length === 0) {
    console.log('  ✅ Font declarations are well-configured!');
  }

  // Save report
  const reportPath = path.join(projectRoot, 'audit-reports', 'font-declaration-audit.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(analysis, null, 2), 'utf8');

  console.log(`\n✅ Detailed report saved to: audit-reports/font-declaration-audit.json`);
}

main().catch(console.error);

