/**
 * Vite plugin to process HTML includes
 * Replaces <!-- include path/to/file.html --> with file contents
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const INCLUDE_REGEX = /<!--\s*include\s+(.+?)\s*-->/g;

/**
 * Recursively processes includes in HTML content
 */
function processIncludes(html, projectRoot, processedFiles = new Set()) {
  return html.replace(INCLUDE_REGEX, (match, includePath) => {
    // Resolve path relative to project root
    const resolvedPath = includePath.startsWith('/')
      ? resolve(projectRoot, includePath.slice(1))
      : resolve(projectRoot, includePath);

    if (processedFiles.has(resolvedPath)) {
      console.warn(`⚠️  Circular include detected: ${includePath}`);
      return match;
    }

    if (!existsSync(resolvedPath)) {
      console.error(`❌ Include file not found: ${includePath} (resolved to: ${resolvedPath})`);
      return match;
    }

    try {
      processedFiles.add(resolvedPath);
      let includedContent = readFileSync(resolvedPath, 'utf-8');
      // Recursively process includes in the included file
      includedContent = processIncludes(includedContent, projectRoot, processedFiles);
      return includedContent;
    } catch (error) {
      console.error(`❌ Error reading include file ${includePath}:`, error.message);
      return match;
    }
  });
}

/**
 * Vite plugin for HTML includes
 */
export default function htmlInclude() {
  let projectRoot = process.cwd();

  return {
    name: 'html-include',
    enforce: 'pre', // Process before other plugins
    configResolved(config) {
      projectRoot = resolve(config.root);
    },
    transformIndexHtml(html, context) {
      return processIncludes(html, projectRoot);
    },
  };
}

