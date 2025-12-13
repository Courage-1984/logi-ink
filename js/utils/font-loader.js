/**
 * Font Loader Utility
 * Hides navbar and hero text until fonts are loaded to prevent FOUT
 */

/**
 * Check if specific fonts are loaded
 * @param {string[]} fontFamilies - Array of font family names to check
 * @returns {Promise<boolean>} - True if all fonts are loaded
 */
function checkFontsLoaded(fontFamilies) {
  return new Promise((resolve) => {
    // Use FontFace API to check if fonts are loaded
    if (!document.fonts || !document.fonts.check) {
      // Fallback: assume fonts are loaded if FontFace API not available
      resolve(true);
      return;
    }

    // Check all required fonts
    const allLoaded = fontFamilies.every((family) => {
      // Check multiple weights/styles for each font family
      return (
        document.fonts.check(`1em "${family}"`) ||
        document.fonts.check(`400 1em "${family}"`) ||
        document.fonts.check(`700 1em "${family}"`) ||
        document.fonts.check(`900 1em "${family}"`)
      );
    });

    if (allLoaded) {
      resolve(true);
      return;
    }

    // Wait for fonts to load
    document.fonts.ready.then(() => {
      // Double-check after ready event
      const stillLoaded = fontFamilies.every((family) => {
        return (
          document.fonts.check(`1em "${family}"`) ||
          document.fonts.check(`400 1em "${family}"`) ||
          document.fonts.check(`700 1em "${family}"`) ||
          document.fonts.check(`900 1em "${family}"`)
        );
      });
      resolve(stillLoaded);
    });
  });
}

/**
 * Initialize font loading with timeout
 */
export function initFontLoader() {
  // Critical fonts that must load before showing text
  const criticalFonts = ['Orbitron', 'Rajdhani'];

  // Maximum wait time (3 seconds) before showing text anyway
  const MAX_WAIT_TIME = 3000;
  const startTime = Date.now();

  // Create a promise that resolves when fonts are loaded OR timeout is reached
  const fontLoadPromise = checkFontsLoaded(criticalFonts);
  const timeoutPromise = new Promise((resolve) => {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, MAX_WAIT_TIME - elapsed);
    setTimeout(() => resolve(false), remaining);
  });

  // Race: show text when fonts load OR after timeout
  Promise.race([fontLoadPromise, timeoutPromise]).then((fontsLoaded) => {
    // Add class to show text
    document.documentElement.classList.add('fonts-loaded');

    // Remove loading class
    document.documentElement.classList.remove('fonts-loading');

    console.log(
      `[FONT LOADER] Fonts ${fontsLoaded ? 'loaded' : 'timeout reached'} - showing text`
    );
  });

  // Also listen to font loading events for immediate response
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready
      .then(() => {
        // If fonts are ready before timeout, show immediately
        if (!document.documentElement.classList.contains('fonts-loaded')) {
          document.documentElement.classList.add('fonts-loaded');
          document.documentElement.classList.remove('fonts-loading');
          console.log('[FONT LOADER] Fonts ready - showing text immediately');
        }
      })
      .catch((error) => {
        console.warn('[FONT LOADER] Error waiting for fonts:', error);
        // Fallback: show text anyway after a short delay
        setTimeout(() => {
          document.documentElement.classList.add('fonts-loaded');
          document.documentElement.classList.remove('fonts-loading');
        }, 500);
      });
  } else {
    // Fallback: show text after a short delay if FontFace API not available
    setTimeout(() => {
      document.documentElement.classList.add('fonts-loaded');
      document.documentElement.classList.remove('fonts-loading');
    }, 500);
  }
}

