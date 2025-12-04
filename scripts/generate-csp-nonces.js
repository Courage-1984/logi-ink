/**
 * Generate CSP Nonces for HTML Files (Fixed Version)
 *
 * This script generates cryptographically secure nonces for Content Security Policy
 * and injects them into HTML files at build time.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate a cryptographically secure random nonce
 * @returns {string} Base64-encoded nonce
 */
function generateNonce() {
  return crypto.randomBytes(16).toString('base64');
}

/**
 * Update HTML file with CSP nonces
 * @param {string} filePath - Path to HTML file
 * @param {string} scriptNonce - Nonce for scripts
 * @param {string} styleNonce - Nonce for styles
 */
function updateHTMLWithNonces(filePath, scriptNonce, styleNonce) {
  let html = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  // Update CSP meta tag to use nonces instead of unsafe-inline
  // Match the full meta tag including multiline content attribute
  // Use a more flexible pattern that handles multiline tags
  const cspStartPattern = /<meta\s+http-equiv=["']Content-Security-Policy["']/i;
  const cspStartMatch = html.match(cspStartPattern);

  if (cspStartMatch) {
    const startIndex = cspStartMatch.index;
    // Find the end of the meta tag (next > after the start)
    let tagEnd = html.indexOf('>', startIndex);
    if (tagEnd === -1) {
      return false;
    }
    tagEnd++; // Include the >

    const fullTag = html.substring(startIndex, tagEnd);

    // Extract content attribute value - try multiple methods
    let cspContent = null;

    // Method 1: Normal quote matching
    const normalMatch = fullTag.match(/content=["']([\s\S]*?)["']/i);
    if (normalMatch && normalMatch[1].includes('script-src')) {
      cspContent = normalMatch[1];
    } else {
      // Method 2: Extract from content= to > (handles broken quotes)
      const contentStart = fullTag.indexOf('content=');
      if (contentStart !== -1) {
        let valueStart = contentStart + 8; // "content="
        // Skip opening quote
        if (fullTag[valueStart] === '"' || fullTag[valueStart] === "'") {
          valueStart++;
        }
        // Get everything until the closing >
        cspContent = fullTag.substring(valueStart, fullTag.length - 1);
        // Remove trailing quote if present
        cspContent = cspContent.replace(/["']\s*$/, '').trim();
      }
    }

    if (!cspContent || cspContent.length < 10) {
      return false; // Invalid or too short
    }

    // Normalize whitespace
    cspContent = cspContent.replace(/[\s\n\r\t]+/g, ' ').trim();

    // Fix broken quotes in content
    cspContent = cspContent.replace(/"self'/gi, "'self'");
    cspContent = cspContent.replace(/'self"/gi, "'self'");
    cspContent = cspContent.replace(/["']self["']/gi, "'self'");
    cspContent = cspContent.replace(/^["']/, ''); // Remove leading quote

    // Replace script-src to use nonce instead of unsafe-inline
    if (cspContent.includes('script-src')) {
      cspContent = cspContent.replace(
        /script-src\s+[^;]*/gi,
        `script-src 'self' 'nonce-${scriptNonce}' https://cdnjs.cloudflare.com https://plausible.io https://www.googletagmanager.com`
      );
    }

    // Replace style-src to use nonce instead of unsafe-inline
    if (cspContent.includes('style-src')) {
      cspContent = cspContent.replace(
        /style-src\s+[^;]*/gi,
        `style-src 'self' 'nonce-${styleNonce}'`
      );
    }

    // Remove unsafe-eval if present
    cspContent = cspContent.replace(/\s*'unsafe-eval'\s*/gi, ' ');
    cspContent = cspContent.replace(/\s+/g, ' ').trim();

    // Reconstruct the meta tag
    const contentStart = fullTag.indexOf('content=');
    if (contentStart !== -1) {
      const beforeContent = fullTag.substring(0, contentStart + 8); // "content="
      const afterContent = fullTag.substring(fullTag.length - 1); // ">"
      const newTag = beforeContent + `"${cspContent}"` + afterContent;
      html = html.substring(0, startIndex) + newTag + html.substring(tagEnd);
      modified = true;
    }
  }

  // Add nonce to inline scripts
  const inlineScriptPattern = /<script(?![^>]*\ssrc=)(?![^>]*\snonce=)([^>]*)>/gi;
  html = html.replace(inlineScriptPattern, (match, attrs) => {
    // Skip if it's a module script or already has nonce
    if (attrs.includes('type="module"') || attrs.includes('nonce=')) {
      return match;
    }
    modified = true;
    return `<script nonce="${scriptNonce}"${attrs}>`;
  });

  // Add nonce to inline styles (in <style> tags)
  const inlineStylePattern = /<style(?![^>]*\snonce=)([^>]*)>/gi;
  html = html.replace(inlineStylePattern, (match, attrs) => {
    modified = true;
    return `<style nonce="${styleNonce}"${attrs}>`;
  });

  if (modified) {
    fs.writeFileSync(filePath, html, 'utf-8');
    return true;
  }
  return false;
}

/**
 * Main function to generate and inject nonces
 * @param {string} targetDir - Target directory (root or dist)
 */
async function generateCSPNonces(targetDir = null) {
  try {
    const projectRoot = path.resolve(__dirname, '..');
    const htmlDir = targetDir || projectRoot;
    const isDistBuild = htmlDir.includes('dist');

    console.log('🔐 Generating CSP nonces...\n');
    console.log(`   Target directory: ${htmlDir}\n`);

    // Generate nonces (same for all files in a build)
    const scriptNonce = generateNonce();
    const styleNonce = generateNonce();

    console.log(`   Script nonce: ${scriptNonce.substring(0, 20)}...`);
    console.log(`   Style nonce: ${styleNonce.substring(0, 20)}...\n`);

    // Find all HTML files
    const htmlFiles = await glob('*.html', {
      cwd: htmlDir,
      ignore: ['node_modules/**', 'dist/**', 'build/**', '.old/**'],
    });

    console.log(`Found ${htmlFiles.length} HTML files to process\n`);

    let processedCount = 0;
    let skippedCount = 0;

    for (const file of htmlFiles) {
      const filePath = path.join(htmlDir, file);
      const updated = updateHTMLWithNonces(filePath, scriptNonce, styleNonce);

      if (updated) {
        console.log(`   ✅ Updated: ${filePath}`);
        processedCount++;
      } else {
        console.log(`   ⚠️  Skipped: ${filePath} (no CSP or inline scripts/styles found)`);
        skippedCount++;
      }
    }

    console.log('\n✅ CSP nonces generated successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   Processed: ${processedCount} files`);
    console.log(`   Skipped: ${skippedCount} files`);
    console.log(`   Script nonce: ${scriptNonce}`);
    console.log(`   Style nonce: ${styleNonce}`);
    console.log('\n📝 Next Steps:');
    console.log('   1. Test pages in browser');
    console.log('   2. Verify CSP nonces work correctly');
    console.log('   3. Check browser console for CSP violations');
    console.log('   4. Update server headers (.htaccess, _headers) to match');
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
  generateCSPNonces(process.argv[2]); // Pass target directory from CLI
}

export { generateCSPNonces };

