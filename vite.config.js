import { resolve } from 'path';
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import htmlInclude from './vite-plugin-html-include.js';

let resolvedOutDir = resolve(process.cwd(), 'dist');
let reportsSourceDir = null;
let statsSourceFile = null;

const copyDirectoryIfMissing = (sourceDir, destinationDir) => {
  if (!existsSync(sourceDir)) {
    return;
  }

  if (!existsSync(destinationDir)) {
    mkdirSync(destinationDir, { recursive: true });
  }

  const entries = readdirSync(sourceDir, { withFileTypes: true });

  entries.forEach(entry => {
    const sourcePath = resolve(sourceDir, entry.name);
    const destinationPath = resolve(destinationDir, entry.name);

    if (entry.isDirectory()) {
      copyDirectoryIfMissing(sourcePath, destinationPath);
    } else if (!existsSync(destinationPath)) {
      copyFileSync(sourcePath, destinationPath);
    }
  });
};

export default defineConfig({
  // Base path for deployment
  // Can be overridden with VITE_BASE_PATH environment variable
  // For root deployment, set VITE_BASE_PATH=/ in .env
  base: process.env.VITE_BASE_PATH || '/',

  // Root directory (where index.html is located)
  root: '.',

  // Build configuration
  build: {
    // Output directory
    outDir: 'dist',

    // Empty output directory before build
    emptyOutDir: true,

    // Source maps for debugging (set to false for production)
    sourcemap: false,

    // Minification (using terser for console removal)
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.warn'],
      },
    },

    // CSS minification (kept enabled for production builds)
    cssMinify: false,

    // Rollup options
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        services: resolve(__dirname, 'services.html'),
        projects: resolve(__dirname, 'projects.html'),
        contact: resolve(__dirname, 'contact.html'),
        pricing: resolve(__dirname, 'pricing.html'),
        seoServices: resolve(__dirname, 'seo-services.html'),
        reports: resolve(__dirname, 'reports.html'),
        sw: resolve(__dirname, 'sw.js'), // Include service worker in build
        // Note: robots.txt and sitemap.xml are copied as static assets
      },
      output: {
        // Manual chunking for better caching
        manualChunks: id => {
          // Split vendor chunks (only if modules exist in node_modules)
          if (id.includes('node_modules')) {
            // Check for Three.js only if it's actually installed
            if (id.includes('three')) {
              return 'vendor-three';
            }
            return 'vendor';
          }
          // No manual chunking for application code
        },
        // Asset file naming
        assetFileNames: assetInfo => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          const name = info[0];

          // Root favicon files should be copied to root without hashing
          const rootFavicons = [
            'apple-touch-icon',
            'favicon-16x16',
            'favicon-32x32',
            'favicon',
            'android-chrome-192x192',
            'android-chrome-512x512',
          ];

          if (rootFavicons.includes(name)) {
            return `[name][extname]`;
          }

          if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp|avif/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          // Video files - keep original names (already optimized)
          if (/mp4|webm|ogg|mov|avi/i.test(ext)) {
            return `assets/video/optimized/[name][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: assetInfo => {
          // Service worker must be in root, not in assets/js
          if (assetInfo.name === 'sw') {
            return '[name].js';
          }
          return 'assets/js/[name]-[hash].js';
        },
      },
    },

    // Chunk size warning limit (in kbs) - reduced for better optimization
    chunkSizeWarningLimit: 500,

    // CSS code splitting per page (kept enabled; components are modularised)
    cssCodeSplit: false,
  },

  // Server configuration for development
  server: {
    port: 3000,
    open: true, // Open browser automatically
  },

  // Preview server configuration
  // Note: Base path is inherited from the main config above
  preview: {
    port: 4173,
    open: true,
  },

  // CSS configuration
  css: {
    devSourcemap: true, // Source maps in development
    postcss: './postcss.config.cjs', // Explicitly specify PostCSS config
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [], // Add any dependencies you want to pre-bundle
  },

  // Public directory (files copied as-is to dist)
  // Note: sw.js is in root and will be copied automatically
  publicDir: false, // Disable publicDir since we don't have a public folder

  // Ensure fonts are copied during build
  assetsInclude: ['**/*.woff2', '**/*.woff', '**/*.ttf', '**/*.otf'],

  // Plugins
  plugins: [
    // HTML include plugin (processes <!-- include --> comments)
    htmlInclude(),

    // Custom plugin to copy root favicon files to dist root
    {
      name: 'copy-favicons',
      apply: 'build',
      configResolved(config) {
        resolvedOutDir = resolve(config.root, config.build.outDir);
      },
      writeBundle() {
        const faviconFiles = [
          'apple-touch-icon.png',
          'favicon-16x16.png',
          'favicon-32x32.png',
          'favicon.ico',
          'android-chrome-192x192.png',
          'android-chrome-512x512.png',
          'site.webmanifest',
        ];

        faviconFiles.forEach(file => {
          const src = resolve(__dirname, file);
          const dest = resolve(resolvedOutDir, file);
          if (existsSync(src)) {
            copyFileSync(src, dest);
            console.log(`✅ Copied ${file} to ${resolvedOutDir}`);
          }
        });
      },
    },
    // Custom plugin to copy optimized video files
    {
      name: 'copy-videos',
      apply: 'build',
      configResolved(config) {
        resolvedOutDir = resolve(config.root, config.build.outDir);
      },
      writeBundle() {
        const videoDir = resolve(__dirname, 'assets/video/optimized');
        const distVideoDir = resolve(resolvedOutDir, 'assets/video/optimized');

        // Create dist video directory if it doesn't exist
        if (!existsSync(distVideoDir)) {
          mkdirSync(distVideoDir, { recursive: true });
        }

        // Copy all files from optimized video directory
        if (existsSync(videoDir)) {
          const files = readdirSync(videoDir);
          files.forEach(file => {
            const src = resolve(videoDir, file);
            const dest = resolve(distVideoDir, file);
            const stats = statSync(src);

            // Only copy files (not directories)
            if (stats.isFile()) {
              copyFileSync(src, dest);
              const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
              console.log(`✅ Copied ${file} to ${distVideoDir} (${sizeMB} MB)`);
            }
          });
        } else {
          console.warn('⚠️  Video directory not found: assets/video/optimized');
        }
      },
    },
    // Custom plugin to copy audio files
    {
      name: 'copy-audio',
      apply: 'build',
      configResolved(config) {
        resolvedOutDir = resolve(config.root, config.build.outDir);
      },
      writeBundle() {
        const audioDir = resolve(__dirname, 'assets/audio');
        const distAudioDir = resolve(resolvedOutDir, 'assets/audio');

        // Create dist audio directory if it doesn't exist
        if (!existsSync(distAudioDir)) {
          mkdirSync(distAudioDir, { recursive: true });
        }

        // Copy all files from audio directory
        if (existsSync(audioDir)) {
          const files = readdirSync(audioDir);
          files.forEach(file => {
            const src = resolve(audioDir, file);
            const dest = resolve(distAudioDir, file);
            const stats = statSync(src);

            // Only copy files (not directories)
            if (stats.isFile()) {
              copyFileSync(src, dest);
              const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
              console.log(`✅ Copied ${file} to ${distAudioDir} (${sizeMB} MB)`);
            }
          });
        } else {
          console.warn('⚠️  Audio directory not found: assets/audio');
        }
      },
    },
    {
      name: 'copy-static-reports',
      apply: 'build',
      configResolved(config) {
        resolvedOutDir = resolve(config.root, config.build.outDir);
        reportsSourceDir = resolve(config.root, 'reports');
      },
      writeBundle() {
        if (!reportsSourceDir) {
          return;
        }

        const destinationDir = resolve(resolvedOutDir, 'reports');
        copyDirectoryIfMissing(reportsSourceDir, destinationDir);
      },
    },

    // Compression plugin (Gzip)
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024, // Only compress files larger than 1KB
      deleteOriginFile: false, // Keep original files
      verbose: true, // Show compression info
    }),

    // Compression plugin (Brotli)
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024, // Only compress files larger than 1KB
      deleteOriginFile: false, // Keep original files
      verbose: true, // Show compression info
    }),

    // Bundle analyzer plugin (generates stats.html)
    visualizer({
      filename: resolve(__dirname, 'dist/stats.html'),
      open: false, // Don't open automatically
      gzipSize: true,
      brotliSize: true,
      template: 'treemap', // treemap, sunburst, network
    }),
    visualizer({
      filename: resolve(__dirname, 'dist/reports/bundle-report.html'),
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap',
    }),
    visualizer({
      filename: resolve(__dirname, 'dist/reports/bundle-stats.json'),
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: 'raw-data',
    }),
    {
      name: 'mirror-stats-report',
      apply: 'build',
      configResolved(config) {
        resolvedOutDir = resolve(config.root, config.build.outDir);
        statsSourceFile = resolve(resolvedOutDir, 'stats.html');
      },
      writeBundle() {
        if (!statsSourceFile || !existsSync(statsSourceFile)) {
          return;
        }

        const destinationDir = resolve(resolvedOutDir, 'reports');
        const destination = resolve(destinationDir, 'stats.html');

        if (!existsSync(destinationDir)) {
          mkdirSync(destinationDir, { recursive: true });
        }

        copyFileSync(statsSourceFile, destination);
      },
    },
  ],
});
