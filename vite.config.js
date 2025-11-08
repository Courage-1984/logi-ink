import { resolve } from 'path';
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import viteImagemin from 'vite-plugin-imagemin';
import viteCompression from 'vite-plugin-compression';
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';

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
    cssMinify: true,

    // Rollup options
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        services: resolve(__dirname, 'services.html'),
        projects: resolve(__dirname, 'projects.html'),
        contact: resolve(__dirname, 'contact.html'),
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
    cssCodeSplit: true,
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
    // Custom plugin to copy root favicon files to dist root
    {
      name: 'copy-favicons',
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
          const dest = resolve(__dirname, 'dist', file);
          if (existsSync(src)) {
            copyFileSync(src, dest);
            console.log(`✅ Copied ${file} to dist/`);
          }
        });
      },
    },
    // Custom plugin to copy optimized video files
    {
      name: 'copy-videos',
      writeBundle() {
        const videoDir = resolve(__dirname, 'assets/video/optimized');
        const distVideoDir = resolve(__dirname, 'dist/assets/video/optimized');

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
              console.log(`✅ Copied ${file} to dist/assets/video/optimized/ (${sizeMB} MB)`);
            }
          });
        } else {
          console.warn('⚠️  Video directory not found: assets/video/optimized');
        }
      },
    },
    // Image optimization plugin
    viteImagemin({
      gifsicle: {
        optimizationLevel: 7,
        interlaced: false,
      },
      optipng: {
        optimizationLevel: 7,
      },
      mozjpeg: {
        quality: 80,
      },
      pngquant: {
        quality: [0.8, 0.9],
        speed: 4,
      },
      svgo: {
        plugins: [
          {
            name: 'removeViewBox',
            active: false,
          },
          {
            name: 'removeEmptyAttrs',
            active: false,
          },
        ],
      },
      // Only optimize images during production build
      disable: process.env.NODE_ENV !== 'production',
    }),

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
  ],
});
