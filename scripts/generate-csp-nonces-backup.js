/**
 * Generate CSP Nonces for HTML Files
 * 
 * This script generates cryptographically secure nonces for Content Security Policy
 * and injects them into HTML files at build time. For static sites, nonces are
 * generated once per build (same for all users, but still provides security).
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
  const cspPattern = /<meta\s+http-equiv=["']Content-Security-Policy["'][\s\S]*?>/i;
  const cspMatch = html.match(cspPattern);
  
  if (cspMatch) {
    const fullTag = cspMatch[0];
    
    // Extract content attribute value (handles both single and double quotes, multiline)
    // Match content="..." or content='...' (handles broken quotes too)
    const contentMatch = fullTag.match(/content=["']([\s\S]*?)["']/i);
    if (!contentMatch) {
      // Try to find content even with broken quotes (e.g., content="default-src"self'...)
      // Match from content= to the end of the tag
      const contentStartIdx = fullTag.indexOf('content=');
      if (contentStartIdx !== -1) {
        // Find the value start (after = and quote)
        let valueStart = contentStartIdx + 8; // "content="
        // Skip opening quote if present
        if (fullTag[valueStart] === '"' || fullTag[valueStart] === "'") {
          valueStart++;
        }
        
        // Find the end of the tag
        const tagEnd = fullTag.indexOf('>');
        if (tagEnd === -1) {
          return false;
        }
        
        // Extract content (everything from valueStart to tagEnd)
        let cspContent = fullTag.substring(valueStart, tagEnd);
        
        // Remove any trailing quote, semicolon, or whitespace before >
        cspContent = cspContent.replace(/["']\s*;?\s*$/, '').trim();
        
        // Fix the broken quote at the start if present (e.g., "default-src"self' -> default-src 'self')
        cspContent = cspContent.replace(/^["']/, ''); // Remove leading quote if any
        
        // Normalize whitespace
        cspContent = cspContent.replace(/[\s\n\r\t]+/g, ' ').trim();
        
        // Fix broken quotes in content (e.g., "self' -> 'self')
        cspContent = cspContent.replace(/"self'/gi, "'self'");
        cspContent = cspContent.replace(/'self"/gi, "'self'");
        cspContent = cspContent.replace(/["']self["']/gi, "'self'");
        
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
            `style-src 'self' 'nonce-${styleNonce}`
          );
        }
        
        // Remove unsafe-eval if present
        cspContent = cspContent.replace(/\s*'unsafe-eval'\s*/gi, ' ');
        cspContent = cspContent.replace(/\s+/g, ' ').trim();
        
        // Reconstruct the meta tag
        const beforeContent = fullTag.substring(0, contentStartIdx + 8); // "content="
        const afterContent = fullTag.substring(tagEnd);
        const newTag = beforeContent + `"${cspContent}"` + afterContent;
        html = html.replace(fullTag, newTag);
        modified = true;
      }
      return modified;
    }
    
    let cspContent = contentMatch[1];
    
    // Normalize whitespace (handle newlines, tabs, etc.)
    cspContent = cspContent.replace(/[\s\n\r\t]+/g, ' ').trim();
    
    // Fix any broken quotes in content
    cspContent = cspContent.replace(/["']self["']/gi, "'self'");
    
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
        `style-src 'self' 'nonce-${styleNonce}`
      );
    }
    
    // Remove unsafe-eval if present
    cspContent = cspContent.replace(/\s*'unsafe-eval'\s*/gi, ' ');
    cspContent = cspContent.replace(/\s+/g, ' ').trim();
    
    // Reconstruct the meta tag with updated content
    const quoteChar = contentMatch[0].includes('"') ? '"' : "'";
    const newTag = fullTag.replace(/content=["'][\s\S]*?["']/i, `content=${quoteChar}${cspContent}${quoteChar}`);
    
    html = html.replace(fullTag, newTag);
    modified = true;
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

