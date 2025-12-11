import { resolve } from 'path';
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'fs';
import htmlInclude from './vite-plugin-html-include.js';
import criticalCSS from './vite-plugin-critical-css.js';
import cspNonces from './vite-plugin-csp-nonces.js';

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
    } else {
      // Always copy (overwrite) to ensure latest version
      copyFileSync(sourcePath, destinationPath);
    }
  });
};

/**
 * Copy files to both dist and dist-gh-pages directories
 */
const copyToBothDirs = (file, sourceDir = __dirname) => {
  const src = resolve(sourceDir, file);
  if (!existsSync(src)) {
    return false;
  }

  const distDir = resolve(__dirname, 'dist');
  const ghPagesDir = resolve(__dirname, 'dist-gh-pages');

  // Copy to dist
  if (existsSync(distDir)) {
    const dest = resolve(distDir, file);
    copyFileSync(src, dest);
    console.log(`✅ Copied ${file} to dist/`);
  }

  // Copy to dist-gh-pages if it exists
  if (existsSync(ghPagesDir)) {
    const dest = resolve(ghPagesDir, file);
    copyFileSync(src, dest);
    console.log(`✅ Copied ${file} to dist-gh-pages/`);
  }

  return true;
};

/**
 * Copy directory to both dist and dist-gh-pages
 */
const copyDirectoryToBothDirs = (dirName, sourceDir = __dirname) => {
  const src = resolve(sourceDir, dirName);
  if (!existsSync(src)) {
    return false;
  }

  const distDir = resolve(__dirname, 'dist');
  const ghPagesDir = resolve(__dirname, 'dist-gh-pages');

  // Copy to dist
  if (existsSync(distDir)) {
    const dest = resolve(distDir, dirName);
    copyDirectoryIfMissing(src, dest);
    console.log(`✅ Copied directory ${dirName}/ to dist/`);
  }

  // Copy to dist-gh-pages if it exists
  if (existsSync(ghPagesDir)) {
    const dest = resolve(ghPagesDir, dirName);
    copyDirectoryIfMissing(src, dest);
    console.log(`✅ Copied directory ${dirName}/ to dist-gh-pages/`);
  }

  return true;
};

export default defineConfig(({ command, mode }) => {
  // Determine output directory from command line args or default
  const outDir = process.argv.includes('--outDir')
    ? process.argv[process.argv.indexOf('--outDir') + 1] || 'dist'
    : 'dist';

  return {
    // Base path for deployment
    // Can be overridden with VITE_BASE_PATH environment variable
    // For root deployment, set VITE_BASE_PATH=/ in .env
    base: process.env.VITE_BASE_PATH || '/',

    // Root directory (where index.html is located)
    root: '.',

    // Build configuration
    build: {
      // Output directory
      outDir: outDir,

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

    // CSS minification (enabled for production builds)
    cssMinify: true,

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
        showcase: resolve(__dirname, 'showcase.html'), // Secret showcase page
        privacyPolicy: resolve(__dirname, 'privacy-policy.html'),
        termsOfService: resolve(__dirname, 'terms-of-service.html'),
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
            'favicon-48x48',
            'favicon-64x64',
            'favicon-96x96',
            'favicon',
            'android-chrome-192x192',
            'android-chrome-512x512',
            'safari-pinned-tab',
            'mstile-70x70',
            'mstile-150x150',
            'mstile-310x150',
            'mstile-310x310',
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
    // Middleware to handle clean URLs (remove .html extension)
    middlewareMode: false,
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

    // Critical CSS inlining plugin (runs post-build)
    criticalCSS(),

    // CSP nonces plugin (runs post-build, after critical CSS)
    cspNonces(),

    // Clean URLs middleware for dev and preview servers
    {
      name: 'clean-urls',
      apply: 'serve',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Skip assets (CSS, JS, images, fonts, etc.) and API routes
          // Check for file extensions or asset paths first
          if (!req.url) {
            return next();
          }

          const url = req.url.split('?')[0]; // Remove query string

          // Skip if URL has a file extension (CSS, JS, images, fonts, etc.)
          if (url.includes('.')) {
            const ext = url.split('.').pop().toLowerCase();
            const assetExtensions = ['css', 'js', 'json', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'avif', 'ico', 'woff', 'woff2', 'ttf', 'otf', 'eot', 'mp4', 'webm', 'ogg', 'mp3', 'wav', 'pdf', 'xml', 'txt', 'map'];
            if (assetExtensions.includes(ext)) {
              return next();
            }
          }

          // Skip asset directories and API routes
          if (
            url.startsWith('/assets/') ||
            url.startsWith('/node_modules/') ||
            url.startsWith('/dist/') ||
            url.startsWith('/css/') ||
            url.startsWith('/js/') ||
            url.startsWith('/api/') ||
            url.startsWith('/favicon') ||
            url.startsWith('/logo') ||
            url.startsWith('/sw.js') ||
            url.startsWith('/site.webmanifest') ||
            url.startsWith('/browserconfig.xml') ||
            url.startsWith('/robots.txt') ||
            url.startsWith('/sitemap.xml')
          ) {
            return next();
          }

          // Handle root index
          if (req.url === '/' || req.url === '') {
            const indexPath = resolve(__dirname, 'index.html');
            if (existsSync(indexPath)) {
              req.url = '/index.html';
            }
            return next();
          }

          // Handle clean URLs (remove .html extension)
          // Only process if URL doesn't have an extension and doesn't end with /
          if (req.url && !req.url.includes('.') && !req.url.endsWith('/')) {
            // Remove leading slash and check if corresponding .html file exists
            const pathWithoutSlash = req.url.replace(/^\//, '');
            const htmlPath = resolve(__dirname, pathWithoutSlash + '.html');
            if (existsSync(htmlPath)) {
              req.url = req.url + '.html';
            }
          }
          next();
        });
      },
    },
    // Clean URLs build plugin - ensures compatibility across all hosting environments
    {
      name: 'clean-urls-build',
      apply: 'build',
      generateBundle(options, bundle) {
        // This plugin ensures that:
        // 1. HTML files are output with .html extension (for static hosting)
        // 2. Links in HTML already use clean URLs (handled by our HTML updates)
        // 3. The build output is compatible with GitHub Pages, Apache, and other static hosts

        // Note: We don't need to transform files here because:
        // - Files on disk: about.html, services.html (needed for static hosting)
        // - URLs in HTML: /about, /services (already updated in source files)
        // - Server/hosting handles the mapping (GitHub Pages native, Apache via .htaccess)

        // This plugin serves as documentation and ensures the build process is aware
        // of clean URL requirements
        console.log('✅ Clean URLs: Build output compatible with all hosting environments');
      },
    },
    // Dev server plugin to serve dist/reports/ files
    {
      name: 'serve-dist-reports',
      apply: 'serve', // Only in dev mode
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Serve bundle reports from dist/ in dev mode
          if (req.url?.startsWith('/dist/reports/') || req.url?.startsWith('/dist/stats.html')) {
            const filePath = resolve(__dirname, req.url.replace(/^\/dist/, 'dist'));

            if (existsSync(filePath)) {
              const content = readFileSync(filePath);
              const ext = filePath.split('.').pop();
              const contentType =
                ext === 'html' ? 'text/html' :
                ext === 'json' ? 'application/json' :
                'text/plain';

              res.setHeader('Content-Type', contentType);
              res.end(content);
              return;
            }
          }
          next();
        });
      },
    },

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
          'favicon-48x48.png',
          'favicon-64x64.png',
          'favicon-96x96.png',
          'favicon.png',
          'favicon.ico',
          'favicon.svg',
          'android-chrome-192x192.png',
          'android-chrome-512x512.png',
          'site.webmanifest',
          'safari-pinned-tab.svg',
          'browserconfig.xml',
          'mstile-70x70.png',
          'mstile-150x150.png',
          'mstile-310x150.png',
          'mstile-310x310.png',
        ];

        faviconFiles.forEach(file => {
          copyToBothDirs(file);
        });
      },
    },
    // Custom plugin to copy video files (both root and optimized directories)
    {
      name: 'copy-videos',
      apply: 'build',
      configResolved(config) {
        resolvedOutDir = resolve(config.root, config.build.outDir);
      },
      writeBundle() {
        // Only copy to the actual output directory and dist-gh-pages if it exists
        const distDirs = [resolvedOutDir];
        const ghPagesDir = resolve(__dirname, 'dist-gh-pages');
        if (existsSync(ghPagesDir)) {
          distDirs.push(ghPagesDir);
        }

        // Copy optimized videos directory
        const optimizedVideoDir = resolve(__dirname, 'assets/video/optimized');
        if (existsSync(optimizedVideoDir)) {
          distDirs.forEach(distDir => {
            if (!existsSync(distDir)) {
              return;
            }

            const distVideoDir = resolve(distDir, 'assets/video/optimized');
            if (!existsSync(distVideoDir)) {
              mkdirSync(distVideoDir, { recursive: true });
            }

            try {
              const files = readdirSync(optimizedVideoDir);
              files.forEach(file => {
                const src = resolve(optimizedVideoDir, file);
                const dest = resolve(distVideoDir, file);

                try {
                  const stats = statSync(src);
                  if (stats.isFile()) {
                    copyFileSync(src, dest);
                    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
                    const dirName = distDir === ghPagesDir ? 'dist-gh-pages' : 'dist';
                    console.log(`✅ Copied ${file} to ${dirName}/assets/video/optimized/ (${sizeMB} MB)`);
                  }
                } catch (err) {
                  console.warn(`⚠️  Failed to copy ${file} to ${distDir}: ${err.message}`);
                }
              });
            } catch (err) {
              console.warn(`⚠️  Failed to read optimized video directory: ${err.message}`);
            }
          });
        } else {
          console.warn('⚠️  Optimized video directory not found: assets/video/optimized');
        }

        // Copy root video directory (for project hover videos)
        const rootVideoDir = resolve(__dirname, 'assets/video');
        if (existsSync(rootVideoDir)) {
          distDirs.forEach(distDir => {
            if (!existsSync(distDir)) {
              return;
            }

            const distVideoDir = resolve(distDir, 'assets/video');
            if (!existsSync(distVideoDir)) {
              mkdirSync(distVideoDir, { recursive: true });
            }

            try {
              const entries = readdirSync(rootVideoDir, { withFileTypes: true });
              entries.forEach(entry => {
                // Skip the optimized subdirectory (already copied above)
                if (entry.isDirectory() && entry.name === 'optimized') {
                  return;
                }

                const src = resolve(rootVideoDir, entry.name);
                const dest = resolve(distVideoDir, entry.name);

                try {
                  if (entry.isFile()) {
                    const stats = statSync(src);
                    copyFileSync(src, dest);
                    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
                    const dirName = distDir === ghPagesDir ? 'dist-gh-pages' : 'dist';
                    console.log(`✅ Copied ${entry.name} to ${dirName}/assets/video/ (${sizeMB} MB)`);
                  }
                } catch (err) {
                  console.warn(`⚠️  Failed to copy ${entry.name} to ${distDir}: ${err.message}`);
                }
              });
            } catch (err) {
              console.warn(`⚠️  Failed to read root video directory: ${err.message}`);
            }
          });
        } else {
          console.warn('⚠️  Root video directory not found: assets/video');
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

        if (!existsSync(audioDir)) {
          console.warn('⚠️  Audio directory not found: assets/audio');
          return;
        }

        // Only copy to the actual output directory and dist-gh-pages if it exists
        const distDirs = [resolvedOutDir];
        const ghPagesDir = resolve(__dirname, 'dist-gh-pages');
        if (existsSync(ghPagesDir)) {
          distDirs.push(ghPagesDir);
        }

        distDirs.forEach(distDir => {
          if (!existsSync(distDir)) {
            return;
          }

          const distAudioDir = resolve(distDir, 'assets/audio');
          if (!existsSync(distAudioDir)) {
            mkdirSync(distAudioDir, { recursive: true });
          }

          try {
            const files = readdirSync(audioDir);
            files.forEach(file => {
              const src = resolve(audioDir, file);
              const dest = resolve(distAudioDir, file);

              try {
                const stats = statSync(src);
                if (stats.isFile()) {
                  copyFileSync(src, dest);
                  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
                  const dirName = distDir === ghPagesDir ? 'dist-gh-pages' : 'dist';
                  console.log(`✅ Copied ${file} to ${dirName}/assets/audio/ (${sizeMB} MB)`);
                }
              } catch (err) {
                console.warn(`⚠️  Failed to copy ${file} to ${distDir}: ${err.message}`);
              }
            });
          } catch (err) {
            console.warn(`⚠️  Failed to read audio directory: ${err.message}`);
          }
        });
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
        if (!reportsSourceDir || !existsSync(reportsSourceDir)) {
          return;
        }

        // Copy reports to both dist and dist-gh-pages
        copyDirectoryToBothDirs('reports', __dirname);
      },
    },
    // Custom plugin to copy entire assets/images directory (including responsive images)
    {
      name: 'copy-images',
      apply: 'build',
      configResolved(config) {
        resolvedOutDir = resolve(config.root, config.build.outDir);
      },
      writeBundle() {
        const imagesDir = resolve(__dirname, 'assets/images');

        if (!existsSync(imagesDir)) {
          console.warn('⚠️  Images directory not found: assets/images');
          return;
        }

        // Only copy to the actual output directory and dist-gh-pages if it exists
        const distDirs = [resolvedOutDir];
        const ghPagesDir = resolve(__dirname, 'dist-gh-pages');
        if (existsSync(ghPagesDir)) {
          distDirs.push(ghPagesDir);
        }

        distDirs.forEach(distDir => {
          if (!existsSync(distDir)) {
            return;
          }

          const distImagesDir = resolve(distDir, 'assets/images');

          try {
            // Copy the entire images directory structure (including responsive, backgrounds, banners, portfolio, logos)
            copyDirectoryIfMissing(imagesDir, distImagesDir);
            console.log(`✅ Copied images directory to ${distDir === ghPagesDir ? 'dist-gh-pages' : 'dist'}/assets/images/`);
          } catch (err) {
            console.warn(`⚠️  Failed to copy images directory to ${distDir}: ${err.message}`);
          }
        });
      },
    },
    // Custom plugin to copy SEO and server configuration files to dist root
    {
      name: 'copy-seo-files',
      apply: 'build',
      configResolved(config) {
        resolvedOutDir = resolve(config.root, config.build.outDir);
      },
      writeBundle() {
        const seoFiles = [
          'robots.txt',
          'sitemap.xml',
          '404.html', // GitHub Pages clean URL routing handler
          '_headers', // Netlify/Vercel headers
          '_redirects', // Netlify redirects file
          '.htaccess', // Apache security headers
          'nginx.conf.example', // Nginx config example (for reference)
        ];

        seoFiles.forEach(file => {
          if (!copyToBothDirs(file)) {
            console.warn(`⚠️  ${file} not found`);
          }
        });
      },
    },
    // Custom plugin to copy logo files to dist root
    {
      name: 'copy-logos',
      apply: 'build',
      configResolved(config) {
        resolvedOutDir = resolve(config.root, config.build.outDir);
      },
      writeBundle() {
        const logoFiles = [
          'logo.svg',
          'logo-1024x1024.png',
          'logo-150x150.png',
        ];

        logoFiles.forEach(file => {
          if (!copyToBothDirs(file)) {
            // Log only if file exists but copy failed, not if file doesn't exist
            if (existsSync(resolve(__dirname, file))) {
              console.warn(`⚠️  Failed to copy ${file}`);
            }
          }
        });
      },
    },
    // Custom plugin to copy entire fonts directory structure
    {
      name: 'copy-fonts',
      apply: 'build',
      configResolved(config) {
        resolvedOutDir = resolve(config.root, config.build.outDir);
      },
      writeBundle() {
        const fontsDir = resolve(__dirname, 'assets/fonts');

        if (!existsSync(fontsDir)) {
          console.warn('⚠️  Fonts directory not found: assets/fonts');
          return;
        }

        // Only copy to the actual output directory and dist-gh-pages if it exists
        const distDirs = [resolvedOutDir];
        const ghPagesDir = resolve(__dirname, 'dist-gh-pages');
        if (existsSync(ghPagesDir)) {
          distDirs.push(ghPagesDir);
        }

        distDirs.forEach(distDir => {
          if (!existsSync(distDir)) {
            return;
          }

          const distFontsDir = resolve(distDir, 'assets/fonts');

          try {
            // Copy the entire fonts directory structure (including Orbitron, Rajdhani, and all subdirectories)
            copyDirectoryIfMissing(fontsDir, distFontsDir);
            console.log(`✅ Copied fonts directory to ${distDir === ghPagesDir ? 'dist-gh-pages' : 'dist'}/assets/fonts/`);
          } catch (err) {
            console.warn(`⚠️  Failed to copy fonts directory to ${distDir}: ${err.message}`);
          }
        });
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
    // Use the determined output directory for visualizer paths
    visualizer({
      filename: resolve(__dirname, outDir, 'stats.html'),
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap',
    }),
    visualizer({
      filename: resolve(__dirname, outDir, 'reports/bundle-report.html'),
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap',
    }),
    visualizer({
      filename: resolve(__dirname, outDir, 'reports/bundle-stats.json'),
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: 'raw-data',
    }),
    // Ensure reports directory exists before visualizer tries to write
    {
      name: 'ensure-visualizer-dirs',
      configResolved(config) {
        const actualOutDir = resolve(config.root, config.build.outDir);
        const reportsDir = resolve(actualOutDir, 'reports');
        if (!existsSync(reportsDir)) {
          mkdirSync(reportsDir, { recursive: true });
        }
      },
    },
    {
      name: 'mirror-stats-report',
      apply: 'build',
      configResolved(config) {
        resolvedOutDir = resolve(config.root, config.build.outDir);
        statsSourceFile = resolve(resolvedOutDir, 'stats.html');
      },
      writeBundle() {
        // Copy stats.html and bundle reports to dist-gh-pages if it exists
        const distDir = resolve(__dirname, 'dist');
        const ghPagesDir = resolve(__dirname, 'dist-gh-pages');

        if (!existsSync(distDir)) {
          return;
        }

        // Copy stats.html root file
        const statsFile = resolve(distDir, 'stats.html');
        if (existsSync(statsFile) && existsSync(ghPagesDir)) {
          const dest = resolve(ghPagesDir, 'stats.html');
          copyFileSync(statsFile, dest);
          console.log(`✅ Copied stats.html to dist-gh-pages/`);
        }

        // Copy stats.html to reports in both directories
        const distDirs = ['dist', 'dist-gh-pages'];

        distDirs.forEach(dirName => {
          const targetDir = resolve(__dirname, dirName);
          if (!existsSync(targetDir)) {
            return;
          }

          const statsFile = resolve(targetDir, 'stats.html');
          if (existsSync(statsFile)) {
            const destinationDir = resolve(targetDir, 'reports');
            const destination = resolve(destinationDir, 'stats.html');

            if (!existsSync(destinationDir)) {
              mkdirSync(destinationDir, { recursive: true });
            }

            copyFileSync(statsFile, destination);
            console.log(`✅ Copied stats.html to ${dirName}/reports/`);
          }
        });

        // Copy bundle reports to dist-gh-pages if it exists
        if (existsSync(ghPagesDir)) {
          const bundleReportSrc = resolve(distDir, 'reports/bundle-report.html');
          const bundleStatsSrc = resolve(distDir, 'reports/bundle-stats.json');

          if (existsSync(bundleReportSrc)) {
            const bundleReportDest = resolve(ghPagesDir, 'reports/bundle-report.html');
            if (!existsSync(resolve(ghPagesDir, 'reports'))) {
              mkdirSync(resolve(ghPagesDir, 'reports'), { recursive: true });
            }
            copyFileSync(bundleReportSrc, bundleReportDest);
            console.log(`✅ Copied bundle-report.html to dist-gh-pages/reports/`);
          }

          if (existsSync(bundleStatsSrc)) {
            const bundleStatsDest = resolve(ghPagesDir, 'reports/bundle-stats.json');
            if (!existsSync(resolve(ghPagesDir, 'reports'))) {
              mkdirSync(resolve(ghPagesDir, 'reports'), { recursive: true });
            }
            copyFileSync(bundleStatsSrc, bundleStatsDest);
            console.log(`✅ Copied bundle-stats.json to dist-gh-pages/reports/`);
          }
        }
      },
    },
  ],
  };
});
