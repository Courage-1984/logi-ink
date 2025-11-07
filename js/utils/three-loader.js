/**
 * Three.js Loader Utility
 * Handles dynamic loading of Three.js library with error handling
 */

let threeJSPromise = null;

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

  // Create promise for loading Three.js
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
    script.crossOrigin = 'anonymous';

    // Add integrity check (Subresource Integrity)
    // Note: To add SRI, get the hash from https://www.srihash.org/
    // or generate it using: openssl dgst -sha384 -binary three.min.js | openssl base64 -A
    // Then uncomment and update:
    // script.integrity = 'sha384-<HASH_HERE>';
    // script.setAttribute('crossorigin', 'anonymous');

    script.onload = () => {
      if (window.THREE) {
        resolve(window.THREE);
      } else {
        reject(new Error('Three.js failed to initialize'));
      }
    };

    script.onerror = () => {
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

