/**
 * Three.js Loader Utility
 * Handles dynamic loading of Three.js library with error handling
 * Supports both CDN and self-hosted modes
 */

let threeJSPromise = null;

// Configuration: Set to 'cdn' or 'self-hosted'
// To use self-hosted: npm install three@0.128.0
// Then change USE_SELF_HOSTED to true
const USE_SELF_HOSTED = false; // Set to true to use bundled Three.js instead of CDN

/**
 * Load Three.js dynamically with error handling
 * @returns {Promise<Object>} THREE object or null if loading fails
 */
export async function loadThreeJS() {
  // Return cached promise if already loading/loaded
  if (threeJSPromise) {
    return threeJSPromise;
  }

  // Check if Three.js is already loaded
  if (typeof window !== 'undefined' && window.THREE) {
    return Promise.resolve(window.THREE);
  }

  // Self-hosted mode: Try to import from node_modules
  // Note: Using string-based dynamic import to prevent Vite from analyzing it when USE_SELF_HOSTED is false
  if (USE_SELF_HOSTED) {
    try {
      // Use Function constructor to create a truly dynamic import that Vite won't statically analyze
      const importThree = new Function('return import("three")');
      const THREE = await importThree();
      // Three.js exports as default in newer versions, or as named export
      const threeLib = THREE.default || THREE;
      if (threeLib) {
        window.THREE = threeLib;
        return Promise.resolve(threeLib);
      }
    } catch (error) {
      console.warn('Self-hosted Three.js not available, falling back to CDN:', error);
      // Fall through to CDN loading
    }
  }

  // CDN mode: Load from Cloudflare CDN
  threeJSPromise = new Promise((resolve, reject) => {
    // Check if script already exists
    const existingScript = document.querySelector('script[src*="three.js"]');
    if (existingScript) {
      // Wait for script to load
      existingScript.addEventListener('load', () => {
        if (window.THREE) {
          resolve(window.THREE);
        } else {
          reject(new Error('Three.js failed to load'));
        }
      });
      existingScript.addEventListener('error', () => {
        reject(new Error('Three.js script failed to load'));
      });
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.async = true;
    script.defer = true; // Defer loading until HTML parsing is complete
    script.crossOrigin = 'anonymous';

    // Add loading attribute for better control
    script.setAttribute('loading', 'lazy');

    // Add Subresource Integrity (SRI) for security
    // Hash generated: openssl dgst -sha384 -binary three.min.js | openssl base64 -A
    script.integrity = 'sha384-CI3ELBVUz9XQO+97x6nwMDPosPR5XvsxW2ua7N1Xeygeh1IxtgqtCkGfQY9WWdHu';
    script.setAttribute('crossorigin', 'anonymous');

    script.onload = () => {
      if (window.THREE) {
        resolve(window.THREE);
      } else {
        threeJSPromise = null; // Reset promise on failure
        reject(new Error('Three.js failed to initialize'));
      }
    };

    script.onerror = () => {
      threeJSPromise = null; // Reset promise on failure
      reject(new Error('Failed to load Three.js from CDN'));
    };

    // Append to document
    document.head.appendChild(script);
  });

  return threeJSPromise;
}

/**
 * Check if Three.js is available
 * @returns {boolean}
 */
export function isThreeJSAvailable() {
  return typeof window !== 'undefined' && typeof window.THREE !== 'undefined';
}

