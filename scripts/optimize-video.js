/**
 * Video Optimization Script for Web Background
 *
 * Optimizes videos for infinite background playback on the web:
 * - Multiple resolutions/qualities (HQ, MQ, LQ)
 * - MP4 (H.264) + WebM (VP9)
 * - Network optimization for streaming
 * - Generates poster image
 * - Generates poster image
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Config
const INPUT_DIR = 'assets/video';
const OUTPUT_DIR = 'assets/video/optimized';
const VIDEO_FILE = 'ripples.mp4';
const FADE_DURATION = 1; // seconds for fade in/out

const SETTINGS = {
  hq: {
    width: 1920,
    height: 1080,
    bitrate: '2M',
    crf: 23,
    fps: 30,
    format: 'mp4',
    codec: 'libx264',
    preset: 'medium',
    profile: 'baseline',
    level: '3.1',
  },
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
  lq: {
    width: 854,
    height: 480,
    bitrate: '800k',
    crf: 25,
    fps: 24,
    format: 'mp4',
    codec: 'libx264',
    preset: 'medium',
    profile: 'baseline',
    level: '3.0',
  },
  webm: {
    width: 1920,
    height: 1080,
    bitrate: '2M',
    crf: 30,
    fps: 30,
    format: 'webm',
    codec: 'libvpx-vp9',
    preset: 'medium',
  },
};

// Helpers
function parseBitrate(bitrate) {
  if (bitrate.toLowerCase().endsWith('k')) return parseInt(bitrate) * 1000;
  if (bitrate.toLowerCase().endsWith('m')) return parseInt(bitrate) * 1000000;
  return parseInt(bitrate);
}

async function checkFFmpeg() {
  try {
    await execAsync('ffmpeg -version');
    return true;
  } catch {
    console.error('❌ ffmpeg not found in PATH.');
    return false;
  }
}

// Optimize video
async function optimizeVideo(inputPath, outputPath, settings) {
  const { width, height, bitrate, crf, fps, format, codec, preset, profile, level } = settings;

  let command = `ffmpeg -i "${inputPath}"`;

  if (codec === 'libx264') {
    command += ` -c:v ${codec} -preset ${preset} -crf ${crf} -maxrate ${bitrate} -bufsize ${parseBitrate(bitrate) * 2} -profile:v ${profile} -level ${level} -pix_fmt yuv420p`;
  } else if (codec === 'libvpx-vp9') {
    command += ` -c:v ${codec} -crf ${crf} -b:v ${bitrate} -maxrate ${bitrate} -minrate ${parseBitrate(bitrate) * 0.5} -pix_fmt yuv420p`;
  }

  command += ` -vf "scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,fade=t=in:st=0:d=${FADE_DURATION},fade=t=out:st=${fps * 20 - FADE_DURATION}:d=${FADE_DURATION}"`;
  command += ` -r ${fps} -g ${fps * 2}`;
  command += ` -an -movflags +faststart -f ${format} -y "${outputPath}"`;

  console.log(
    `\n🎬 Optimizing: ${basename(outputPath)} (${width}x${height}, ${bitrate}, ${fps}fps, ${codec})`
  );
  await execAsync(command);

  const { stat } = await import('fs/promises');
  const stats = await stat(outputPath);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`✅ Complete: ${outputPath} (${sizeMB} MB)`);
}

// Create poster
async function createPoster(inputPath, outputPath) {
  const command = `ffmpeg -i "${inputPath}" -ss 00:00:00 -vframes 1 -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" -y "${outputPath}"`;
  console.log(`\n🖼️ Creating poster image...`);
  await execAsync(command);
  console.log(`✅ Poster: ${outputPath}`);
}

// Main
async function main() {
  console.log('🎥 Video Optimization Script\n============================\n');

  if (!(await checkFFmpeg())) process.exit(1);

  const inputPath = join(__dirname, '..', INPUT_DIR, VIDEO_FILE);
  if (!existsSync(inputPath)) {
    console.error(`❌ Input file not found: ${inputPath}`);
    process.exit(1);
  }
  if (!existsSync(join(__dirname, '..', OUTPUT_DIR)))
    mkdirSync(join(__dirname, '..', OUTPUT_DIR), { recursive: true });

  const baseName = basename(VIDEO_FILE, extname(VIDEO_FILE));

  for (const key of Object.keys(SETTINGS)) {
    const outputPath = join(
      __dirname,
      '..',
      OUTPUT_DIR,
      `${baseName}-${key}.${SETTINGS[key].format}`
    );
    await optimizeVideo(inputPath, outputPath, SETTINGS[key]);
  }

  await createPoster(inputPath, join(__dirname, '..', OUTPUT_DIR, `${baseName}-poster.jpg`));

  generateAdaptiveLazyJS(baseName);

  console.log('\n🎉 All done! Optimized videos and poster ready for infinite background playback.');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
