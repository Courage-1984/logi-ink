/**
 * Vite Plugin for CSP Nonce Generation
 * Generates and injects CSP nonces into HTML files after build
 */

import { execSync } from 'child_process';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');

export default function cspNoncesPlugin() {
  let resolvedOutDir = null;
  let projectRoot = null;

  return {
    name: 'csp-nonces',
    apply: 'build', // Only run during build
    configResolved(config) {
      projectRoot = resolve(config.root);
      resolvedOutDir = resolve(projectRoot, config.build.outDir);
    },
    closeBundle() {
      try {
        console.log('\n🔐 Generating CSP nonces...');
        const scriptPath = resolve(projectRoot, 'scripts/generate-csp-nonces.js');
        // Pass dist directory to script
        execSync(`node "${scriptPath}" "${resolvedOutDir}"`, {
          stdio: 'inherit',
          cwd: projectRoot,
          env: { ...process.env, NODE_ENV: 'production' },
        });
        console.log('✅ CSP nonces generated successfully!\n');
      } catch (error) {
        console.error('❌ Error generating CSP nonces:', error.message);
        // Don't fail the build, but warn
        console.warn('⚠️  Build completed, but CSP nonce generation failed');
      }
    },
  };
}

