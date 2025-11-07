/**
 * Video Optimization Script
 *
 * This script optimizes videos for web background use using ffmpeg.
 * Creates optimized versions in multiple formats (MP4, WebM) with different qualities.
 *
 * Usage:
 *   npm run optimize-video
 *
 * Requirements:
 *   - ffmpeg must be installed and available in PATH
 *   - Install: https://ffmpeg.org/download.html
 *
 * For Windows:
 *   - Download from https://www.gyan.dev/ffmpeg/builds/
 *   - Add to PATH or place in project root
 *
 * For macOS:
 *   brew install ffmpeg
 *
 * For Linux:
 *   sudo apt-get install ffmpeg
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const INPUT_DIR = 'assets/video';
const OUTPUT_DIR = 'assets/video/optimized';
const VIDEO_FILE = 'ripples.mp4';

// Video optimization settings for background videos
const SETTINGS = {
  // High quality (desktop) - 1080p
  hq: {
    width: 1920,
    height: 1080,
    bitrate: '2M', // 2 Mbps - good quality for background
    crf: 23, // Constant Rate Factor (18-28, lower = better quality)
    fps: 30, // 30 fps is enough for background videos
    format: 'mp4',
    codec: 'libx264',
    preset: 'medium', // Encoding speed (ultrafast, fast, medium, slow)
    profile: 'baseline', // Compatibility profile
    level: '3.1', // H.264 level
  },
  // Medium quality (tablet) - 720p
  mq: {
    width: 1280,
    height: 720,
    bitrate: '1.5M',
    crf: 23,
    fps: 30,
    format: 'mp4',
    codec: 'libx264',
    preset: 'medium',
    profile: 'baseline',
    level: '3.1',
  },
  // Low quality (mobile) - 480p
  lq: {
    width: 854,
    height: 480,
    bitrate: '800k', // 800 kbps - smaller file for mobile
    crf: 25,
    fps: 24, // 24 fps for mobile to save bandwidth
    format: 'mp4',
    codec: 'libx264',
    preset: 'medium',
    profile: 'baseline',
    level: '3.0',
  },
  // WebM format (better compression, modern browsers)
  webm: {
    width: 1920,
    height: 1080,
    bitrate: '2M',
    crf: 30, // VP9 CRF (0-63, higher = smaller file)
    fps: 30,
    format: 'webm',
    codec: 'libvpx-vp9',
    preset: 'medium',
  },
};

/**
 * Check if ffmpeg is available
 */
async function checkFFmpeg() {
  try {
    await execAsync('ffmpeg -version');
    return true;
  } catch (error) {
    console.error('❌ ffmpeg is not installed or not in PATH');
    console.error('Please install ffmpeg: https://ffmpeg.org/download.html');
    return false;
  }
}

/**
 * Get video info
 */
async function getVideoInfo(inputPath) {
  try {
    const { stdout } = await execAsync(
      `ffprobe -v error -select_streams v:0 -show_entries stream=width,height,duration,r_frame_rate -of json "${inputPath}"`
    );
    return JSON.parse(stdout);
  } catch (error) {
    console.error(`Error getting video info: ${error.message}`);
    return null;
  }
}

/**
 * Optimize video with specific settings
 */
async function optimizeVideo(inputPath, outputPath, settings) {
  const {
    width,
    height,
    bitrate,
    crf,
    fps,
    format,
    codec,
    preset,
    profile,
    level,
  } = settings;

  // Build ffmpeg command
  let command = `ffmpeg -i "${inputPath}"`;

  // Video codec and settings
  if (codec === 'libx264') {
    // H.264 (MP4)
    command += ` -c:v ${codec}`;
    command += ` -preset ${preset}`;
    command += ` -crf ${crf}`;
    command += ` -maxrate ${bitrate}`;
    command += ` -bufsize ${parseInt(bitrate) * 2}M`; // Buffer size = 2x bitrate
    command += ` -profile:v ${profile}`;
    command += ` -level ${level}`;
    command += ` -pix_fmt yuv420p`; // Compatibility
  } else if (codec === 'libvpx-vp9') {
    // VP9 (WebM)
    command += ` -c:v ${codec}`;
    command += ` -crf ${crf}`;
    command += ` -b:v ${bitrate}`;
    command += ` -maxrate ${bitrate}`;
    command += ` -minrate ${parseInt(bitrate) * 0.5}M`;
  }

  // Video filters
  command += ` -vf "scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2"`;
  command += ` -r ${fps}`; // Frame rate
  command += ` -g ${fps * 2}`; // GOP size (2 seconds)

  // Audio (remove audio for background videos to save space)
  command += ` -an`; // No audio

  // Output settings
  command += ` -movflags +faststart`; // Web optimization (MP4)
  command += ` -f ${format}`;
  command += ` -y`; // Overwrite output file
  command += ` "${outputPath}"`;

  try {
    console.log(`\n🎬 Optimizing: ${basename(outputPath)}`);
    console.log(`   Settings: ${width}x${height}, ${bitrate}, ${fps}fps, ${codec}`);

    const { stdout, stderr } = await execAsync(command);
    console.log(`   ✅ Complete: ${outputPath}`);

    // Get file size
    const { stat } = await import('fs/promises');
    const stats = await stat(outputPath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`   📦 Size: ${sizeMB} MB`);

    return true;
  } catch (error) {
    console.error(`   ❌ Error optimizing ${basename(outputPath)}: ${error.message}`);
    if (error.stderr) {
      console.error(`   ${error.stderr}`);
    }
    return false;
  }
}

/**
 * Create poster image (first frame) for video
 */
async function createPoster(inputPath, outputPath) {
  try {
    const command = `ffmpeg -i "${inputPath}" -ss 00:00:00 -vframes 1 -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" -y "${outputPath}"`;

    console.log(`\n🖼️  Creating poster image...`);
    await execAsync(command);
    console.log(`   ✅ Poster: ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`   ❌ Error creating poster: ${error.message}`);
    return false;
  }
}

/**
 * Main optimization function
 */
async function main() {
  console.log('🎥 Video Optimization Script');
  console.log('============================\n');

  // Check ffmpeg
  const ffmpegAvailable = await checkFFmpeg();
  if (!ffmpegAvailable) {
    process.exit(1);
  }

  // Input file
  const inputPath = join(__dirname, '..', INPUT_DIR, VIDEO_FILE);

  if (!existsSync(inputPath)) {
    console.error(`❌ Video file not found: ${inputPath}`);
    process.exit(1);
  }

  console.log(`📹 Input: ${inputPath}`);

  // Get video info
  const videoInfo = await getVideoInfo(inputPath);
  if (videoInfo) {
    const stream = videoInfo.streams[0];
    console.log(`   Original: ${stream.width}x${stream.height}`);
    if (stream.duration) {
      console.log(`   Duration: ${parseFloat(stream.duration).toFixed(2)}s`);
    }
  }

  // Create output directory
  if (!existsSync(join(__dirname, '..', OUTPUT_DIR))) {
    mkdirSync(join(__dirname, '..', OUTPUT_DIR), { recursive: true });
  }

  const baseName = basename(VIDEO_FILE, extname(VIDEO_FILE));

  // Optimize videos
  const results = [];

  // MP4 versions (different qualities)
  results.push(
    await optimizeVideo(
      inputPath,
      join(__dirname, '..', OUTPUT_DIR, `${baseName}-hq.mp4`),
      SETTINGS.hq
    )
  );
  results.push(
    await optimizeVideo(
      inputPath,
      join(__dirname, '..', OUTPUT_DIR, `${baseName}-mq.mp4`),
      SETTINGS.mq
    )
  );
  results.push(
    await optimizeVideo(
      inputPath,
      join(__dirname, '..', OUTPUT_DIR, `${baseName}-lq.mp4`),
      SETTINGS.lq
    )
  );

  // WebM version (better compression)
  results.push(
    await optimizeVideo(
      inputPath,
      join(__dirname, '..', OUTPUT_DIR, `${baseName}-hq.webm`),
      SETTINGS.webm
    )
  );

  // Create poster image
  results.push(
    await createPoster(
      inputPath,
      join(__dirname, '..', OUTPUT_DIR, `${baseName}-poster.jpg`)
    )
  );

  // Summary
  const successCount = results.filter((r) => r).length;
  const totalCount = results.length;

  console.log('\n📊 Summary');
  console.log('===========');
  console.log(`✅ Successful: ${successCount}/${totalCount}`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);

  if (successCount === totalCount) {
    console.log('\n🎉 All videos optimized successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Use the optimized videos in your HTML');
    console.log('   2. Use <source> tags for format/quality selection');
    console.log('   3. Add poster image for faster initial load');
  } else {
    console.log('\n⚠️  Some optimizations failed. Check errors above.');
    process.exit(1);
  }
}

// Run script
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

