const purgecss =
  require('@fullhuman/postcss-purgecss').default || require('@fullhuman/postcss-purgecss');
const enablePurge = process.env.ENABLE_PURGECSS === 'false';

module.exports = {
  plugins: [
    // PurgeCSS is opt-in: set ENABLE_PURGECSS=true for production builds when the safelist is up to date
    ...(enablePurge && process.env.NODE_ENV === 'production'
      ? [
          purgecss({
            content: [
              './**/*.html',
              './js/**/*.js',
              './dist/**/*.html', // Include dist files if they exist
            ],
            // Improved extractor to preserve more CSS
            defaultExtractor: content => {
              // Extract all words, classes, IDs, and element selectors
              const broadMatches = content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [];
              const innerMatches = content.match(/[^<>"'`\s.()]*[^<>"'`\s.():]/g) || [];
              // Extract element selectors from HTML tags
              const elementMatches = content.match(/<([a-z][a-z0-9]*)/gi) || [];
              const elements = elementMatches.map(m => m.replace(/</gi, '').toLowerCase());
              // Extract class names
              const classMatches = content.match(/class=["']([^"']+)["']/gi) || [];
              const classes = classMatches.flatMap(
                m => m.match(/class=["']([^"']+)["']/i)?.[1]?.split(/\s+/) || []
              );
              // Extract IDs
              const idMatches = content.match(/id=["']([^"']+)["']/gi) || [];
              const ids = idMatches.map(m => m.match(/id=["']([^"']+)["']/i)?.[1] || '');
              return [...broadMatches, ...innerMatches, ...elements, ...classes, ...ids];
            },
            safelist: {
              // Keep all element selectors and dynamic classes
              standard: [
                'html',
                'body',
                'h1',
                'h2',
                'h3',
                'h4',
                'h5',
                'h6',
                'p',
                'a',
                'div',
                'span',
                'section',
                'article',
                'header',
                'footer',
                'nav',
                'main',
                'ul',
                'ol',
                'li',
                'img',
                'button',
                'input',
                'textarea',
                'select',
                'label',
                'form',
                'table',
                'tr',
                'td',
                'th',
                'thead',
                'tbody',
                'tfoot',
                'visible',
                'active',
                'scrolled',
                'counted',
                'typed',
                'typing',
                'error',
                'success',
                'show',
                'easter-egg-ready',
                'easter-egg-active',
                'milky-way-ready',
                'milky-way-loading',
                'milky-way-scene',
                'milky-way-menu',
                'milky-way-menu-toggle',
                'milky-way-loading-spinner',
                'milky-way-loading-text',
                'easter-egg-vortex',
                'footer-easter-egg-trigger',
                'scrollbar-expanded',
                'page-transition-in',
                'page-transition-out',
                'ripple',
                'ripple-magenta',
                'ripple-green',
                'ripple-container',
                'sr-only',
                'toast',
                'toast-header',
                'toast-body',
                'toast-close',
                'skip-link',
                'aria-live-region',
                'main-content',
                'cursor-dot',
                'cursor-follow',
                'scroll-progress',
                'magenta-scrollbar',
                'variant-magenta-scrollbar',
              ],
              // Keep all pseudo-elements and pseudo-classes
              deep: [
                /::?before/,
                /::?after/,
                /:hover/,
                /:focus/,
                /:active/,
                /:visited/,
                /:first-child/,
                /:last-child/,
                /:nth-child/,
              ],
              // Keep all attribute selectors and dynamic class patterns
              greedy: [
                /\[.*?\]/,
                /^fade-in/,
                /^delay-/,
                /^scroll-reveal/,
                /^mouse-tilt/,
                /^card-3d/,
                /^impact-card-/,
                /^milky-way/,
                /^easter-egg/,
                /^text-reveal/,
                /^cursor-/,
              ],
            },
            // Keep CSS variables
            variables: true,
            // Keep keyframes
            keyframes: true,
            // Keep font-face
            fontFace: true,
          }),
        ]
      : []),
  ],
};
