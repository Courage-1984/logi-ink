/**
 * Image Optimization Audit Script
 *
 * Scans HTML files to identify image usage and optimization status.
 * Checks for:
 * - Responsive srcset usage
 * - Lazy loading attributes
 * - LCP candidates (above-the-fold images)
 * - Missing optimization opportunities
 *
 * Usage:
 *   node scripts/audit-images.js
 */

import { readFile, readdir } from 'fs/promises';
import { join, extname } from 'path';
import { existsSync } from 'fs';

// HTML files to audit
const HTML_FILES = [
  'index.html',
  'about.html',
  'services.html',
  'projects.html',
  'contact.html',
  'pricing.html',
  'seo-services.html',
  'reports.html',
];

/**
 * Extract images from HTML content
 */
function extractImages(html, filePath) {
  const images = [];

  // Find all <picture> tags first (to exclude img tags inside them)
  const pictureRegex = /<picture[^>]*>[\s\S]*?<\/picture>/gi;
  const pictureMatches = html.matchAll(pictureRegex);
  const pictureRanges = [];

  for (const match of pictureMatches) {
    pictureRanges.push({ start: match.index, end: match.index + match[0].length });
  }

  // Find all <img> tags (excluding those inside picture elements)
  const imgRegex = /<img[^>]*>/gi;
  const imgMatches = html.matchAll(imgRegex);

  for (const match of imgMatches) {
    const imgIndex = match.index;
    // Skip if this img is inside a picture element
    const isInsidePicture = pictureRanges.some(range => imgIndex >= range.start && imgIndex < range.end);
    if (isInsidePicture) continue;

    const imgTag = match[0];
    const srcMatch = imgTag.match(/src=["']([^"']*)["']/i); // Changed + to * to allow empty strings
    const srcsetMatch = imgTag.match(/srcset=["']([^"']+)["']/i);
    const loadingMatch = imgTag.match(/loading=["']([^"']+)["']/i);
    const fetchpriorityMatch = imgTag.match(/fetchpriority=["']([^"']+)["']/i);
    const decodingMatch = imgTag.match(/decoding=["']([^"']+)["']/i);
    const idMatch = imgTag.match(/id=["']([^"']+)["']/i);
    const classMatch = imgTag.match(/class=["']([^"']+)["']/i);

    // Skip dynamically populated modal images (empty src with modal-related IDs/classes)
    const isEmptySrc = srcMatch && (!srcMatch[1] || srcMatch[1] === '');
    const idValue = idMatch ? idMatch[1] : '';
    const classValue = classMatch ? classMatch[1] : '';
    const isModalImage = (idValue && (idValue.toLowerCase().includes('modal'))) ||
                        (classValue && (classValue.toLowerCase().includes('modal')));

    // Also skip img tags with aria-hidden="true" and empty src (typically decorative/dynamic)
    const ariaHiddenMatch = imgTag.match(/aria-hidden=["']true["']/i);

    if (isEmptySrc && (isModalImage || ariaHiddenMatch)) {
      continue; // Skip dynamically populated modal images and decorative images
    }

    images.push({
      file: filePath,
      tag: imgTag,
      src: srcMatch ? srcMatch[1] : null,
      srcset: srcsetMatch ? srcsetMatch[1] : null,
      loading: loadingMatch ? loadingMatch[1] : null,
      fetchpriority: fetchpriorityMatch ? fetchpriorityMatch[1] : null,
      decoding: decodingMatch ? decodingMatch[1] : null,
      hasResponsive: !!srcsetMatch,
      isLazy: loadingMatch ? loadingMatch[1] === 'lazy' : false,
      isLCP: fetchpriorityMatch ? fetchpriorityMatch[1] === 'high' : false,
    });
  }

  // Process picture elements

  for (const match of pictureMatches) {
    const pictureTag = match[0];
    const sourceMatches = pictureTag.matchAll(/<source[^>]*>/gi);
    const imgMatch = pictureTag.match(/<img[^>]*>/i);

    const sources = [];
    for (const sourceMatch of sourceMatches) {
      const sourceTag = sourceMatch[0];
      const typeMatch = sourceTag.match(/type=["']([^"']+)["']/i);
      const srcsetMatch = sourceTag.match(/srcset=["']([^"']+)["']/i);
      const idMatch = sourceTag.match(/id=["']([^"']+)["']/i);

      sources.push({
        type: typeMatch ? typeMatch[1] : null,
        srcset: srcsetMatch ? srcsetMatch[1] : null,
        id: idMatch ? idMatch[1] : null,
      });
    }

    if (imgMatch) {
      const imgTag = imgMatch[0];
      const srcMatch = imgTag.match(/src=["']([^"']+)["']/i);
      const loadingMatch = imgTag.match(/loading=["']([^"']+)["']/i);
      const fetchpriorityMatch = imgTag.match(/fetchpriority=["']([^"']+)["']/i);
      const decodingMatch = imgTag.match(/decoding=["']([^"']+)["']/i);
      const idMatch = pictureTag.match(/id=["']([^"']+)["']/i);

      // Skip dynamically populated picture elements (e.g., modals with empty srcset that are populated via JS)
      const isEmptySrc = srcMatch && (!srcMatch[1] || srcMatch[1] === '');
      const hasEmptySrcset = !sources.some(s => s.srcset);
      const isDynamicModal = idMatch && idMatch[1] && idMatch[1].includes('modal');

      if (isEmptySrc && hasEmptySrcset && isDynamicModal) {
        continue; // Skip dynamically populated modal images
      }

      images.push({
        file: filePath,
        tag: pictureTag.substring(0, 100) + '...',
        src: srcMatch ? srcMatch[1] : null,
        srcset: sources.map(s => s.srcset).filter(Boolean).join(' | '),
        loading: loadingMatch ? loadingMatch[1] : null,
        fetchpriority: fetchpriorityMatch ? fetchpriorityMatch[1] : null,
        decoding: decodingMatch ? decodingMatch[1] : null,
        hasResponsive: sources.some(s => s.srcset),
        isLazy: loadingMatch ? loadingMatch[1] === 'lazy' : false,
        isLCP: fetchpriorityMatch ? fetchpriorityMatch[1] === 'high' : false,
        isPicture: true,
        formats: sources.map(s => s.type).filter(Boolean),
      });
    }
  }

  return images;
}

/**
 * Check if image file exists
 */
function checkImageExists(src) {
  if (!src) return false;

  // Remove leading ./
  const path = src.startsWith('./') ? src.substring(2) : src;

  return existsSync(path);
}

/**
 * Main audit function
 */
async function auditImages() {
  console.log('🔍 Starting image optimization audit...\n');

  const allImages = [];
  const issues = [];
  const recommendations = [];

  for (const htmlFile of HTML_FILES) {
    if (!existsSync(htmlFile)) {
      console.log(`⚠️  File not found: ${htmlFile}`);
      continue;
    }

    const content = await readFile(htmlFile, 'utf-8');
    const images = extractImages(content, htmlFile);

    if (images.length > 0) {
      console.log(`\n📄 ${htmlFile}: ${images.length} image(s) found\n`);

      for (const img of images) {
        allImages.push(img);

        // Check for issues
        if (!img.hasResponsive && !img.isPicture) {
          issues.push({
            file: htmlFile,
            src: img.src,
            issue: 'Missing responsive srcset',
            severity: 'medium',
          });
        }

        if (!img.loading && !img.isLCP) {
          issues.push({
            file: htmlFile,
            src: img.src,
            issue: 'Missing loading attribute (should be lazy for below-the-fold)',
            severity: 'low',
          });
        }

        if (img.isLCP && !img.fetchpriority) {
          issues.push({
            file: htmlFile,
            src: img.src,
            issue: 'LCP image missing fetchpriority="high"',
            severity: 'high',
          });
        }

        if (img.isLCP && img.isLazy) {
          issues.push({
            file: htmlFile,
            src: img.src,
            issue: 'LCP image should not be lazy loaded',
            severity: 'high',
          });
        }

        // Check if image file exists
        if (img.src && !checkImageExists(img.src)) {
          issues.push({
            file: htmlFile,
            src: img.src,
            issue: 'Image file not found',
            severity: 'high',
          });
        }
      }
    }
  }

  // Generate report
  console.log('\n' + '='.repeat(60));
  console.log('📊 AUDIT SUMMARY');
  console.log('='.repeat(60));
  console.log(`\nTotal images found: ${allImages.length}`);
  console.log(`Images with responsive srcset: ${allImages.filter(img => img.hasResponsive).length}`);
  console.log(`Lazy loaded images: ${allImages.filter(img => img.isLazy).length}`);
  console.log(`LCP candidates: ${allImages.filter(img => img.isLCP).length}`);
  console.log(`Picture elements: ${allImages.filter(img => img.isPicture).length}`);

  if (issues.length > 0) {
    console.log(`\n⚠️  Issues found: ${issues.length}`);
    console.log('\n' + '-'.repeat(60));

    const highIssues = issues.filter(i => i.severity === 'high');
    const mediumIssues = issues.filter(i => i.severity === 'medium');
    const lowIssues = issues.filter(i => i.severity === 'low');

    if (highIssues.length > 0) {
      console.log('\n🔴 HIGH PRIORITY:');
      highIssues.forEach(issue => {
        console.log(`   ${issue.file}: ${issue.issue}`);
        console.log(`   Image: ${issue.src}`);
      });
    }

    if (mediumIssues.length > 0) {
      console.log('\n🟡 MEDIUM PRIORITY:');
      mediumIssues.forEach(issue => {
        console.log(`   ${issue.file}: ${issue.issue}`);
        console.log(`   Image: ${issue.src}`);
      });
    }

    if (lowIssues.length > 0) {
      console.log('\n🟢 LOW PRIORITY:');
      lowIssues.forEach(issue => {
        console.log(`   ${issue.file}: ${issue.issue}`);
        console.log(`   Image: ${issue.src}`);
      });
    }
  } else {
    console.log('\n✅ No issues found! All images are properly optimized.');
  }

  // Recommendations
  console.log('\n' + '='.repeat(60));
  console.log('💡 RECOMMENDATIONS');
  console.log('='.repeat(60));

  const imagesWithoutResponsive = allImages.filter(img => !img.hasResponsive);
  if (imagesWithoutResponsive.length > 0) {
    console.log(`\n1. Add responsive srcset to ${imagesWithoutResponsive.length} image(s)`);
    console.log('   Run: npm run responsive-images');
  }

  const lcpImages = allImages.filter(img => img.isLCP);
  if (lcpImages.length > 0) {
    console.log(`\n2. Ensure LCP images have preload links in <head>`);
    console.log('   Add: <link rel="preload" as="image" href="..." fetchpriority="high">');
  }

  const belowFoldImages = allImages.filter(img => !img.isLCP && !img.isLazy);
  if (belowFoldImages.length > 0) {
    console.log(`\n3. Add lazy loading to ${belowFoldImages.length} below-the-fold image(s)`);
    console.log('   Add: loading="lazy" decoding="async"');
  }

  console.log('\n' + '='.repeat(60));
}

auditImages().catch(console.error);

