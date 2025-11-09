/**
 * Image Optimization Script
 *
 * This script compresses WebP images using sharp.
 *
 * Usage:
 *   npm run optimize-images
 *
 * Requirements:
 *   npm install sharp
 */

import sharp from 'sharp';
import { readdir, stat, mkdir } from 'fs/promises';
import { join, dirname, extname, basename } from 'path';
import { existsSync } from 'fs';

const QUALITY = 80; // WebP quality (0-100, lower = smaller file)
const MAX_WIDTH = 1920; // Max width for responsive images
const MAX_HEIGHT = 1080; // Max height for responsive images

// Directories to optimize
const IMAGE_DIRS = [
  'assets/images/backgrounds',
  'assets/images/banners',
  'assets/images/logos',
  'assets/images/portfolio',
];

// Output directory for optimized images (optional)
const OPTIMIZED_DIR = 'assets/images/optimized';

/**
 * Get all image files recursively
 */
async function getImageFiles(dir, fileList = []) {
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
 * Optimize a single image
 */
async function optimizeImage(inputPath, outputPath) {
  try {
    const stats = await stat(inputPath);
    const originalSize = stats.size;

    // Create output directory if it doesn't exist
    const outputDir = dirname(outputPath);
    if (!existsSync(outputDir)) {
      await mkdir(outputDir, { recursive: true });
    }

    // Get image metadata
    const metadata = await sharp(inputPath).metadata();

    // Calculate new dimensions (maintain aspect ratio)
    let width = metadata.width;
    let height = metadata.height;

    if (width > MAX_WIDTH || height > MAX_HEIGHT) {
      const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    // Optimize image
    await sharp(inputPath)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({
        quality: QUALITY,
        effort: 6, // Compression effort (0-6, higher = slower but better compression)
      })
      .toFile(outputPath);

    const newStats = await stat(outputPath);
    const newSize = newStats.size;
    const savings = (((originalSize - newSize) / originalSize) * 100).toFixed(2);

    console.log(`✅ ${basename(inputPath)}`);
    console.log(`   Original: ${(originalSize / 1024).toFixed(2)} KB`);
    console.log(`   Optimized: ${(newSize / 1024).toFixed(2)} KB`);
    console.log(`   Savings: ${savings}%`);
    console.log(`   Dimensions: ${metadata.width}x${metadata.height} → ${width}x${height}`);

    return { originalSize, newSize, savings };
  } catch (error) {
    console.error(`❌ Error optimizing ${inputPath}:`, error.message);
    return null;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🖼️  Starting image optimization...\n');

  let totalOriginalSize = 0;
  let totalNewSize = 0;
  let optimizedCount = 0;

  for (const dir of IMAGE_DIRS) {
    if (!existsSync(dir)) {
      console.log(`⚠️  Directory not found: ${dir}`);
      continue;
    }

    console.log(`\n📁 Processing: ${dir}`);
    const images = await getImageFiles(dir);

    if (images.length === 0) {
      console.log('   No images found');
      continue;
    }

    for (const imagePath of images) {
      // Create output path (same directory with -optimized suffix, or in optimized dir)
      const ext = extname(imagePath);
      const name = basename(imagePath, ext);
      const dir = dirname(imagePath);

      // Option 1: Save in same directory with -optimized suffix
      const outputPath = join(dir, `${name}-optimized${ext}`);

      // Option 2: Save in optimized directory (uncomment to use)
      // const relativePath = imagePath.replace('assets/images/', '');
      // const outputPath = join(OPTIMIZED_DIR, relativePath);

      const result = await optimizeImage(imagePath, outputPath);

      if (result) {
        totalOriginalSize += result.originalSize;
        totalNewSize += result.newSize;
        optimizedCount++;
      }
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 Optimization Summary:');
  console.log(`   Images optimized: ${optimizedCount}`);
  console.log(`   Total original size: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Total optimized size: ${(totalNewSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(
    `   Total savings: ${(((totalOriginalSize - totalNewSize) / totalOriginalSize) * 100).toFixed(2)}%`
  );
  console.log(
    `   Space saved: ${((totalOriginalSize - totalNewSize) / 1024 / 1024).toFixed(2)} MB`
  );
  console.log('='.repeat(50));
  console.log('\n✅ Image optimization complete!');
  console.log('\n📝 Next steps:');
  console.log('   1. Review the optimized images');
  console.log('   2. Replace original images if quality is acceptable');
  console.log('   3. Update HTML to use optimized images');
}

// Run the script
main().catch(console.error);
