/**
 * Inline Cursor CSS and JS Script
 * Reads cursor.css and cursor.js and inlines them in HTML files
 * Also ensures cursor-dot and scroll-progress elements exist
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

/**
 * Minify JavaScript (basic minification - removes comments and extra whitespace)
 */
function minifyJS(js) {
  return js
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
    .replace(/\/\/.*$/gm, '') // Remove line comments
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\s*{\s*/g, '{') // Remove spaces around opening brace
    .replace(/\s*}\s*/g, '}') // Remove spaces around closing brace
    .replace(/\s*\(\s*/g, '(') // Remove spaces around opening paren
    .replace(/\s*\)\s*/g, ')') // Remove spaces around closing paren
    .replace(/\s*;\s*/g, ';') // Remove spaces around semicolons
    .replace(/\s*,\s*/g, ',') // Remove spaces around commas
    .replace(/\s*=\s*/g, '=') // Remove spaces around equals
    .replace(/\s*:\s*/g, ':') // Remove spaces around colons
    .trim();
}

/**
 * Remove existing cursor CSS and JS from HTML
 * Looks for cursor-related styles and scripts and removes them
 */
function removeExistingCursorCode(html) {
  // Remove existing cursor style block (if it has id="cursor-styles")
  html = html.replace(/<!-- Inlined Cursor CSS -->\s*<style[^>]*id=["']cursor-styles["'][^>]*>[\s\S]*?<\/style>\s*/gi, '');

  // Remove existing cursor script block (if it has id="cursor-script")
  html = html.replace(/<!-- Inlined Cursor JS -->\s*<script[^>]*id=["']cursor-script["'][^>]*>[\s\S]*?<\/script>\s*/gi, '');

  // Also remove cursor CSS from existing style blocks (simpler approach)
  // Look for style blocks that contain cursor-related selectors
  const cursorSelectors = ['.cursor-follow', '.cursor-dot', '.scroll-progress'];

  html = html.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (match, content) => {
    const hasCursorCSS = cursorSelectors.some(selector => {
      const regex = new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      return regex.test(content);
    });

    if (hasCursorCSS) {
      // Simple approach: remove entire style block if it's only cursor CSS
      // Otherwise, try to remove cursor-related rules
      const isOnlyCursorCSS = cursorSelectors.every(selector => {
        const regex = new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        return regex.test(content);
      });

      // If it's a dedicated cursor style block, remove it
      if (isOnlyCursorCSS && content.trim().length < 500) {
        return '';
      }
    }

    return match;
  });

  return html;
}

/**
 * Ensure cursor elements exist in body
 */
function ensureCursorElements(html) {
  // Check if cursor-dot exists
  const hasCursorDot = /<div[^>]*class="[^"]*cursor-dot[^"]*"[^>]*>/i.test(html);
  const hasScrollProgress = /<div[^>]*class="[^"]*scroll-progress[^"]*"[^>]*>/i.test(html);

  if (hasCursorDot && hasScrollProgress) {
    return html; // Elements already exist
  }

  // Find body tag and insert elements after opening body tag
  const bodyMatch = html.match(/<body[^>]*>/i);
  if (!bodyMatch) {
    console.warn('⚠️  No <body> tag found, skipping element insertion');
    return html;
  }

  const bodyTag = bodyMatch[0];
  const bodyIndex = html.indexOf(bodyTag) + bodyTag.length;

  let elementsToAdd = '';
  if (!hasScrollProgress) {
    elementsToAdd += '    <!-- Scroll Progress Indicator -->\n    <div class="scroll-progress"></div>\n';
  }
  if (!hasCursorDot) {
    elementsToAdd += '    <!-- Custom Cursor Dot -->\n    <div class="cursor-dot"></div>\n';
  }

  if (elementsToAdd) {
    // Insert after body tag, before any existing content
    html = html.slice(0, bodyIndex) + '\n' + elementsToAdd + html.slice(bodyIndex);
  }

  return html;
}

/**
 * Inline cursor CSS and JS in HTML file
 */
function inlineCursorInHTML(htmlPath, cursorCSS, cursorJS) {
  let html = fs.readFileSync(htmlPath, 'utf-8');

  // Remove existing cursor CSS and JS if present
  html = removeExistingCursorCode(html);

  // Ensure cursor elements exist
  html = ensureCursorElements(html);

  // Find the closing </head> tag
  const headCloseIndex = html.indexOf('</head>');
  if (headCloseIndex === -1) {
    throw new Error(`No </head> tag found in ${htmlPath}`);
  }

  // Create inline style and script tags
  const inlineStyle = `    <!-- Inlined Cursor CSS -->
    <style id="cursor-styles">${cursorCSS}</style>`;
  const inlineScript = `    <!-- Inlined Cursor JS -->
    <script id="cursor-script">
      ${cursorJS}
    </script>`;

  // Insert before </head>
  html =
    html.slice(0, headCloseIndex) +
    '\n' +
    inlineStyle +
    '\n' +
    inlineScript +
    '\n' +
    html.slice(headCloseIndex);

  // Write back to file
  fs.writeFileSync(htmlPath, html, 'utf-8');
  console.log(`✅ Inlined cursor CSS/JS in ${path.basename(htmlPath)}`);
}

/**
 * Main function
 */
async function inlineCursor(targetDir = null) {
  try {
    const projectRoot = path.resolve(__dirname, '..');
    const htmlDir = targetDir || projectRoot;
    const isDistBuild = htmlDir.includes('dist');

    // Read cursor CSS
    const cursorCSSPath = path.join(projectRoot, 'css/utils/cursor.css');
    if (!fs.existsSync(cursorCSSPath)) {
      throw new Error(`Cursor CSS file not found: ${cursorCSSPath}`);
    }
    let cursorCSS = fs.readFileSync(cursorCSSPath, 'utf-8');

    // Read cursor JS
    const cursorJSPath = path.join(projectRoot, 'js/core/cursor.js');
    if (!fs.existsSync(cursorJSPath)) {
      throw new Error(`Cursor JS file not found: ${cursorJSPath}`);
    }
    let cursorJS = fs.readFileSync(cursorJSPath, 'utf-8');

    // Convert ES6 module to inline script
    // Remove export statement
    cursorJS = cursorJS.replace(/export\s+function\s+initCursor\s*\(/g, 'function initCursor(');
    cursorJS = cursorJS.replace(/export\s+/g, '');

    // Wrap in IIFE that calls initCursor when DOM is ready
    // Only initialize if cursor dot exists and device supports hover
    cursorJS = `(function() {
  ${cursorJS}
  // Initialize cursor when DOM is ready
  function initCursorIfNeeded() {
    const cursorDot = document.querySelector('.cursor-dot');
    if (cursorDot && window.matchMedia('(hover: hover)').matches) {
      initCursor();
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCursorIfNeeded);
  } else {
    initCursorIfNeeded();
  }
})();`;

    // Fix asset paths if in dist build
    if (isDistBuild) {
      cursorCSS = cursorCSS.replace(/\.\.\/assets\//g, './assets/');
    }

    // Minify CSS and JS
    const minifiedCSS = minifyCSS(cursorCSS);
    const minifiedJS = minifyJS(cursorJS);

    // Find all HTML files in target directory
    const htmlPattern = path.join(htmlDir, '*.html');
    const htmlFiles = await glob(htmlPattern, {
      ignore: [
        '**/node_modules/**',
        '**/dist/**',
        '**/coverage/**',
        '**/test-results/**',
        '**/reports/**',
        '**/generate/**',
        '**/tests/**',
        '**/docs/**',
        '**/assets/**',
        '**/partials/**',
      ],
    });

    if (htmlFiles.length === 0) {
      console.warn('⚠️  No HTML files found to process');
      return;
    }

    console.log(`📝 Processing ${htmlFiles.length} HTML file(s)...\n`);

    // Process each HTML file
    for (const htmlFile of htmlFiles) {
      try {
        inlineCursorInHTML(htmlFile, minifiedCSS, minifiedJS);
      } catch (error) {
        console.error(`❌ Error processing ${htmlFile}:`, error.message);
      }
    }

    console.log(`\n✅ Successfully inlined cursor CSS/JS in ${htmlFiles.length} file(s)`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const targetDir = process.argv[2] || null;
  inlineCursor(targetDir);
}

export { inlineCursor };

