/**
 * Inline Critical CSS Script
 * Reads critical.css and inlines it in HTML files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function inlineCriticalCSS() {
  try {
    // Read critical CSS
    const criticalCSS = fs.readFileSync(path.join(__dirname, '../css/critical.css'), 'utf-8');

    // Find all HTML files
    const htmlFiles = await glob('./*.html', {
      ignore: ['node_modules/**', 'dist/**'],
    });

    console.log('📄 Inlining critical CSS in HTML files...\n');

    for (const file of htmlFiles) {
      let html = fs.readFileSync(file, 'utf-8');

      // Check if critical CSS is already inlined
      if (html.includes('<!-- Critical CSS -->')) {
        console.log(`   ⏭️  Skipping ${file} (already has critical CSS)`);
        continue;
      }

      // Find the </head> tag
      const headEndIndex = html.indexOf('</head>');
      if (headEndIndex === -1) {
        console.log(`   ⚠️  Skipping ${file} (no </head> tag found)`);
        continue;
      }

      // Insert critical CSS before </head>
      const criticalCSSBlock = `
    <!-- Critical CSS - Above-the-fold styles -->
    <style>${criticalCSS}</style>
    
    <!-- Load remaining CSS asynchronously -->
    <link rel="preload" href="css/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="css/main.css"></noscript>
`;

      // Remove old stylesheet link if it exists
      html = html.replace(/<link\s+rel=["']stylesheet["']\s+href=["']css\/main\.css["']\s*>/gi, '');

      // Remove old preload for main.css if it exists (we'll add it back)
      html = html.replace(
        /<link\s+rel=["']preload["']\s+href=["']css\/main\.css["']\s+as=["']style["']\s*>/gi,
        ''
      );

      // Insert critical CSS before </head>
      html = html.slice(0, headEndIndex) + criticalCSSBlock + html.slice(headEndIndex);

      // Write updated HTML
      fs.writeFileSync(file, html, 'utf-8');
      console.log(`   ✅ Updated: ${file}`);
    }

    console.log('\n✅ Critical CSS inlined successfully!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Test pages in browser');
    console.log('   2. Verify critical CSS loads correctly');
    console.log('   3. Check that remaining CSS loads asynchronously');
    console.log('   4. Run Lighthouse to measure FCP improvement');
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
  inlineCriticalCSS();
}

export { inlineCriticalCSS };
