import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  // Base path for GitHub Pages (repository name)
  base: '/logia-ink/',
  
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
    
    // Minification (using esbuild - faster and built into Vite)
    minify: 'esbuild',
    
    // Note: To use terser with more options, install terser: npm install -D terser
    // Then change minify to 'terser' and uncomment terserOptions below
    // terserOptions: {
    //   compress: {
    //     drop_console: true, // Remove console.log in production
    //     drop_debugger: true,
    //   },
    // },
    
    // CSS minification
    cssMinify: true,
    
    // Rollup options
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        services: resolve(__dirname, 'services.html'),
        projects: resolve(__dirname, 'projects.html'),
        contact: resolve(__dirname, 'contact.html'),
      },
      output: {
        // Manual chunking for better caching
        manualChunks: (id) => {
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
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
    
    // Chunk size warning limit (in kbs)
    chunkSizeWarningLimit: 1000,
  },
  
  // Server configuration for development
  server: {
    port: 3000,
    open: true, // Open browser automatically
  },
  
  // Preview server configuration
  preview: {
    port: 4173,
    open: true,
  },
  
  // CSS configuration
  css: {
    devSourcemap: true, // Source maps in development
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [], // Add any dependencies you want to pre-bundle
  },
  
  // Public directory (files copied as-is to dist)
  publicDir: 'public',
});

