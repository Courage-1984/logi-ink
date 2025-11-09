/**
 * Responsive Image Generator
 *
 * This script generates multiple sizes of images for responsive srcset.
 *
 * Usage:
 *   node scripts/generate-responsive-images.js
 */

import sharp from 'sharp';
import { readdir, stat, mkdir, writeFile } from 'fs/promises';
import { join, dirname, extname, basename } from 'path';
import { existsSync } from 'fs';

// Image sizes for responsive srcset
const SIZES = [
  { width: 480, suffix: '480w' },
  { width: 768, suffix: '768w' },
  { width: 1024, suffix: '1024w' },
  { width: 1280, suffix: '1280w' },
  { width: 1920, suffix: '1920w' },
];

// Directories to process
const IMAGE_DIRS = ['assets/images/backgrounds', 'assets/images/banners', 'assets/images/portfolio'];

// Output directory
const OUTPUT_DIR = 'assets/images/responsive';

/**
 * Generate responsive images for a single image
 */
async function generateResponsiveImages(inputPath, outputDir) {
  try {
    const metadata = await sharp(inputPath).metadata();
    const ext = extname(inputPath);
    const name = basename(inputPath, ext);

    // Create output directory
    if (!existsSync(outputDir)) {
      await mkdir(outputDir, { recursive: true });
    }

    const srcset = [];
    const sizes = [];

    console.log(`\n📸 Processing: ${basename(inputPath)}`);
    console.log(`   Original: ${metadata.width}x${metadata.height}`);

    const avifSrcset = [];
    const webpSrcset = [];

    for (const size of SIZES) {
      // Only generate if original is larger than target size
      if (metadata.width >= size.width) {
        // Generate AVIF (best compression)
        const avifPath = join(outputDir, `${name}-${size.suffix}.avif`);
        await sharp(inputPath)
          .resize(size.width, null, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .avif({
            quality: 80,
            effort: 4,
          })
          .toFile(avifPath);

        const avifStats = await stat(avifPath);
        avifSrcset.push(`${basename(avifPath)} ${size.width}w`);
        console.log(
          `   ✅ Generated AVIF: ${size.suffix} (${(avifStats.size / 1024).toFixed(2)} KB)`
        );

        // Generate WebP (fallback)
        const webpPath = join(outputDir, `${name}-${size.suffix}.webp`);
        await sharp(inputPath)
          .resize(size.width, null, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({
            quality: 85,
            effort: 6,
          })
          .toFile(webpPath);

        const webpStats = await stat(webpPath);
        webpSrcset.push(`${basename(webpPath)} ${size.width}w`);
        sizes.push(`${size.width}px`);

        console.log(
          `   ✅ Generated WebP: ${size.suffix} (${(webpStats.size / 1024).toFixed(2)} KB)`
        );
      }
    }

    // Generate HTML srcset example with AVIF and WebP
    const htmlExample = `
<!-- Responsive image example for ${basename(inputPath)} -->
<picture>
  <!-- AVIF format (best compression, modern browsers) -->
  <source
    type="image/avif"
    srcset="${avifSrcset.join(',\n    ')}"
    sizes="(max-width: 480px) 480px, (max-width: 768px) 768px, (max-width: 1024px) 1024px, (max-width: 1280px) 1280px, 1920px"
  >
  <!-- WebP format (fallback for older browsers) -->
  <source
    type="image/webp"
    srcset="${webpSrcset.join(',\n    ')}"
    sizes="(max-width: 480px) 480px, (max-width: 768px) 768px, (max-width: 1024px) 1024px, (max-width: 1280px) 1280px, 1920px"
  >
  <!-- Original format (final fallback) -->
  <img
    src="${basename(inputPath)}"
    alt="Description"
    loading="lazy"
  >
</picture>
    `.trim();

    // Save HTML example
    const htmlPath = join(outputDir, `${name}-example.html`);
    await writeFile(htmlPath, htmlExample, 'utf-8');

    return { avifSrcset, webpSrcset, htmlExample };
  } catch (error) {
    console.error(`❌ Error processing ${inputPath}:`, error.message);
    return null;
  }
}

/**
 * Get all image files
 */
async function getImageFiles(dir, fileList = []) {
  if (!existsSync(dir)) return fileList;

  const files = await readdir(dir);

  for (const file of files) {
    const filePath = join(dir, file);
    const stats = await stat(filePath);

    if (stats.isDirectory()) {
      await getImageFiles(filePath, fileList);
    } else if (/\.(webp|png|jpg|jpeg)$/i.test(file)) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

/**
 * Main function
 */
async function main() {
  console.log('🖼️  Generating responsive images...\n');

  for (const dir of IMAGE_DIRS) {
    if (!existsSync(dir)) {
      console.log(`⚠️  Directory not found: ${dir}`);
      continue;
    }

    console.log(`\n📁 Processing directory: ${dir}`);
    const images = await getImageFiles(dir);

    if (images.length === 0) {
      console.log('   No images found');
      continue;
    }

    const outputDir = join(OUTPUT_DIR, dir.replace('assets/images/', ''));

    for (const imagePath of images) {
      await generateResponsiveImages(imagePath, outputDir);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ Responsive image generation complete!');
  console.log('\n📝 Next steps:');
  console.log('   1. Review generated images in assets/images/responsive/');
  console.log('   2. Check HTML examples for each image');
  console.log('   3. Update your HTML to use responsive images with srcset');
  console.log('='.repeat(50));
}

main().catch(console.error);
