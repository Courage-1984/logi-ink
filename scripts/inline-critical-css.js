/**
 * Inline Critical CSS Script
 * Reads critical.css and inlines it in HTML files
 * Also sets up async loading for remaining CSS
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Minify CSS (basic minification - removes comments and extra whitespace)
 */
function minifyCSS(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/;\s*}/g, '}') // Remove semicolon before closing brace
    .replace(/\s*{\s*/g, '{') // Remove spaces around opening brace
    .replace(/;\s*/g, ';') // Remove spaces after semicolons
    .replace(/\s*:\s*/g, ':') // Remove spaces around colons
    .replace(/\s*,\s*/g, ',') // Remove spaces around commas
    .replace(/\s*>\s*/g, '>') // Remove spaces around >
    .replace(/\s*\+\s*/g, '+') // Remove spaces around +
    .replace(/\s*~\s*/g, '~') // Remove spaces around ~
    .trim();
}

async function inlineCriticalCSS(targetDir = null) {
  try {
    // Determine target directory (dist/ for build, root for manual runs)
    const projectRoot = path.resolve(__dirname, '..');
    const htmlDir = targetDir || projectRoot;
    const isDistBuild = htmlDir.includes('dist');

    // Read critical CSS
    const criticalCSSPath = path.join(projectRoot, 'css/critical.css');
    if (!fs.existsSync(criticalCSSPath)) {
      throw new Error(`Critical CSS file not found: ${criticalCSSPath}`);
    }
    let criticalCSS = fs.readFileSync(criticalCSSPath, 'utf-8');

    // Minify critical CSS for inlining
    let minifiedCSS = minifyCSS(criticalCSS);

    // Fix font paths when inlining
    // For dist/ builds, paths should be relative to dist root
    if (isDistBuild) {
      minifiedCSS = minifiedCSS.replace(/url\(['"]?\.\.\/assets\//g, "url('./assets/");
    } else {
      minifiedCSS = minifiedCSS.replace(/url\(['"]?\.\.\/assets\//g, "url('./assets/");
    }

    const originalSize = (criticalCSS.length / 1024).toFixed(2);
    const minifiedSize = (minifiedCSS.length / 1024).toFixed(2);

    console.log('📄 Inlining Critical CSS...\n');
    console.log(`   Target directory: ${htmlDir}`);
    console.log(`   Original size: ${originalSize} KB`);
    console.log(`   Minified size: ${minifiedSize} KB`);
    console.log(`   Reduction: ${((1 - minifiedCSS.length / criticalCSS.length) * 100).toFixed(1)}%\n`);

    // Find all HTML files in target directory
    const htmlPattern = path.join(htmlDir, '*.html').replace(/\\/g, '/');
    const htmlFiles = await glob(htmlPattern, {
      ignore: ['node_modules/**', 'build/**', '.old/**', 'backups/**'],
    });

    console.log(`Found ${htmlFiles.length} HTML files to process\n`);

    let processedCount = 0;
    let skippedCount = 0;

    for (const file of htmlFiles) {
      let html = fs.readFileSync(file, 'utf-8');

      // Check if critical CSS is already inlined
      if (html.includes('<!-- Critical CSS - Above-the-fold styles')) {
        // Remove ALL existing critical CSS blocks and async loading blocks
        // We'll replace them with the updated version
        html = html.replace(/<!-- Critical CSS - Above-the-fold styles[\s\S]*?<\/style>\s*/g, '');
        html = html.replace(/<!-- Load remaining CSS asynchronously[\s\S]*?<\/noscript>\s*/g, '');
        // Also remove any orphaned preload links for main.css
        html = html.replace(/<link\s+rel=["']preload["'][^>]*href=["']css\/main\.css["'][^>]*>\s*/gi, '');
        html = html.replace(/<link\s+rel=["']stylesheet["'][^>]*href=["']css\/main\.css["'][^>]*>\s*/gi, '');
        console.log(`   🔧 Removed existing critical CSS from ${file}, will add updated version`);
      }

      // Find the </head> tag
      const headEndIndex = html.indexOf('</head>');
      if (headEndIndex === -1) {
        console.log(`   ⚠️  Skipping ${file} (no </head> tag found)`);
        skippedCount++;
        continue;
      }

      // Find where to insert (before </head>, after canonical URL or main CSS link)
      let insertIndex = headEndIndex;

      // Try to find a good insertion point (after canonical URL or before main CSS)
      const canonicalMatch = html.match(/<link\s+rel=["']canonical["'][^>]*>/i);
      if (canonicalMatch) {
        insertIndex = canonicalMatch.index + canonicalMatch[0].length;
      } else {
        // Fallback: find main CSS link and insert before it
        const mainCSSMatch = html.match(/<link\s+rel=["']stylesheet["']\s+href=["']css\/main\.css["'][^>]*>/i);
        if (mainCSSMatch) {
          insertIndex = mainCSSMatch.index;
        }
      }

      // Create critical CSS block
      // Always use async loading in production builds (dist/)
      // For manual runs on source files, use sync loading to avoid issues
      const useAsyncLoading = isDistBuild || process.env.NODE_ENV === 'production';

      const asyncCSSLoading = `
    <!-- Preload critical CSS for faster loading -->
    <link rel="preload" href="css/main.css" as="style" />

    <!-- Load remaining CSS asynchronously (non-blocking) -->
    <link rel="stylesheet" href="css/main.css" media="print" onload="this.media='all'; this.onload=null;" />
    <noscript><link rel="stylesheet" href="css/main.css" /></noscript>

    <!-- Fallback for browsers that don't support onload on link elements -->
    <script>
      (function() {
        var link = document.querySelector('link[href="css/main.css"][media="print"]');
        if (link) {
          var timeout = setTimeout(function() {
            link.media = 'all';
            link.onload = null;
          }, 100);
          link.onload = function() {
            clearTimeout(timeout);
            this.onload = null;
          };
        }
      })();
    </script>
`;

      const syncCSSLoading = `
    <!-- Load remaining CSS synchronously (development mode - avoids service worker issues) -->
    <link rel="stylesheet" href="css/main.css" />
`;

      const criticalCSSBlock = `
    <!-- Critical CSS - Above-the-fold styles (inlined for faster FCP) -->
    <style>${minifiedCSS}</style>
${useAsyncLoading ? asyncCSSLoading : syncCSSLoading}
`;

      // Remove old stylesheet link if it exists (we'll add it back with async loading)
      // Match with or without trailing slash, and with any attributes
      html = html.replace(/<link\s+rel=["']stylesheet["'][^>]*href=["']\.?\/?css\/main\.css["'][^>]*>/gi, '');

      // Remove old preload for main.css if it exists (we'll add it back)
      html = html.replace(
        /<link\s+rel=["']preload["']\s+href=["']css\/main\.css["'][^>]*>/gi,
        ''
      );

      // Insert critical CSS at the insertion point
      html = html.slice(0, insertIndex) + criticalCSSBlock + html.slice(insertIndex);

      // Write updated HTML
      fs.writeFileSync(file, html, 'utf-8');
      console.log(`   ✅ Updated: ${file}`);
      processedCount++;
    }

    console.log('\n✅ Critical CSS inlined successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   Processed: ${processedCount} files`);
    console.log(`   Skipped: ${skippedCount} files`);
    console.log(`   Critical CSS size: ${minifiedSize} KB (minified)`);
    console.log('\n📝 Next Steps:');
    console.log('   1. Test pages in browser');
    console.log('   2. Verify critical CSS loads correctly');
    console.log('   3. Check that remaining CSS loads asynchronously');
    console.log('   4. Run Lighthouse to measure FCP improvement');
    console.log('   5. Check Network tab to verify async CSS loading');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (
  import.meta.url === `file://${process.argv[1]}` ||
  import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))
) {
  // Get target directory from command line argument (dist/ for build, null for root)
  const targetDir = process.argv[2] ? path.resolve(process.argv[2]) : null;
  inlineCriticalCSS(targetDir);
}

export { inlineCriticalCSS };
