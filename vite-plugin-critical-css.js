/**
 * Vite Plugin for Critical CSS Inlining
 * Runs inline-critical-css.js post-build to inline critical CSS in HTML files
 */

import { execSync } from 'child_process';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');

export default function criticalCSSPlugin() {
  let resolvedOutDir = null;
  let projectRoot = null;

  return {
    name: 'critical-css',
    apply: 'build', // Only run during build
    configResolved(config) {
      projectRoot = resolve(config.root);
      resolvedOutDir = resolve(projectRoot, config.build.outDir);
    },
    closeBundle() {
      try {
        console.log('\n📄 Inlining critical CSS...');
        const scriptPath = resolve(projectRoot, 'scripts/inline-critical-css.js');
        // Pass dist directory to script
        execSync(`node "${scriptPath}" "${resolvedOutDir}"`, {
          stdio: 'inherit',
          cwd: projectRoot,
          env: { ...process.env, NODE_ENV: 'production' },
        });
        console.log('✅ Critical CSS inlined successfully!\n');
      } catch (error) {
        console.error('❌ Error inlining critical CSS:', error.message);
        // Don't fail the build, but warn
        console.warn('⚠️  Build completed, but critical CSS inlining failed');
      }
    },
  };
}

