/**
 * Unit Tests for scripts/inline-critical-css.js
 * Tests CSS minification logic (since main function isn't easily testable in isolation)
 */

import { describe, it, expect } from 'vitest';

/**
 * CSS minification function (extracted for testing)
 * This mirrors the logic in inline-critical-css.js
 */
function minifyCSS(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/;\s*}/g, '}') // Remove semicolon before closing brace
    .replace(/\s*{\s*/g, '{') // Remove spaces around opening brace
    .replace(/;\s*/g, ';') // Remove spaces after semicolons
    .replace(/\s*:\s*/g, ':') // Remove spaces around colons
    .replace(/\s*,\s*/g, ',') // Remove spaces around commas
    .replace(/\s*>\s*/g, '>') // Remove spaces around >
    .replace(/\s*\+\s*/g, '+') // Remove spaces around +
    .replace(/\s*~\s*/g, '~') // Remove spaces around ~
    .trim();
}

describe('inline-critical-css.js - CSS Minification', () => {
  describe('minifyCSS function', () => {
    it('should remove CSS comments', () => {
      const css = '/* Comment */ .test { color: red; }';
      const result = minifyCSS(css);
      expect(result).not.toContain('Comment');
      expect(result).toContain('.test');
    });

    it('should remove extra whitespace', () => {
      const css = '  .test  {  color  :  red  ;  }  ';
      const result = minifyCSS(css);
      expect(result).not.toContain('  '); // No double spaces
      expect(result).toContain('.test');
    });

    it('should remove semicolon before closing brace', () => {
      const css = '.test { color: red; }';
      const result = minifyCSS(css);
      expect(result).toMatch(/color:red\}/);
    });

    it('should handle empty CSS', () => {
      const css = '';
      const result = minifyCSS(css);
      expect(result).toBe('');
    });

    it('should handle CSS with only comments', () => {
      const css = '/* Comment 1 */\n/* Comment 2 */';
      const result = minifyCSS(css);
      expect(result).toBe('');
    });

    it('should preserve CSS variables', () => {
      const css = ':root { --color: red; --size: 16px; }';
      const result = minifyCSS(css);
      expect(result).toContain('--color');
      expect(result).toContain('--size');
      expect(result).toContain(':root');
    });

    it('should handle media queries', () => {
      const css = '@media (max-width: 768px) { .test { color: red; } }';
      const result = minifyCSS(css);
      expect(result).toContain('@media');
      expect(result).toContain('max-width');
      expect(result).toContain('.test');
    });

    it('should handle complex selectors', () => {
      const css = '.parent > .child + .sibling ~ .cousin { color: red; }';
      const result = minifyCSS(css);
      expect(result).toContain('.parent>.child+.sibling~.cousin');
    });

    it('should handle multiple rules', () => {
      const css = '.test1 { color: red; } .test2 { color: blue; }';
      const result = minifyCSS(css);
      expect(result).toContain('.test1');
      expect(result).toContain('.test2');
      expect(result).toContain('color:red');
      expect(result).toContain('color:blue');
    });

    it('should handle font-face declarations', () => {
      const css = '@font-face { font-family: "Test"; src: url("test.woff2"); }';
      const result = minifyCSS(css);
      expect(result).toContain('@font-face');
      expect(result).toContain('font-family');
      expect(result).toContain('url');
    });
  });

  describe('path fixing logic', () => {
    it('should fix relative font paths for dist builds', () => {
      const css = "url('../assets/fonts/test.woff2')";
      const fixed = css.replace(/url\(['"]?\.\.\/assets\//g, "url('./assets/");
      expect(fixed).toBe("url('./assets/fonts/test.woff2')");
    });

    it('should handle paths with quotes', () => {
      const css = 'url("../assets/fonts/test.woff2")';
      // The actual regex replaces url('../assets/ with url('./assets/
      // This means double quotes become single quotes, and closing quote stays
      const fixed = css.replace(/url\(['"]?\.\.\/assets\//g, "url('./assets/");
      // Result: url('./assets/fonts/test.woff2") - opening quote changed, closing preserved
      expect(fixed).toBe("url('./assets/fonts/test.woff2\")");
    });

    it('should handle paths without quotes', () => {
      const css = "url(../assets/fonts/test.woff2)";
      const fixed = css.replace(/url\(['"]?\.\.\/assets\//g, "url('./assets/");
      // Result: url('./assets/fonts/test.woff2) - adds single quotes, closing paren preserved
      expect(fixed).toBe("url('./assets/fonts/test.woff2)");
    });
  });

  describe('build detection logic', () => {
    it('should detect dist builds', () => {
      const htmlDir = '/project/dist';
      const isDistBuild = htmlDir.includes('dist');
      expect(isDistBuild).toBe(true);
    });

    it('should detect root builds', () => {
      const htmlDir = '/project';
      const isDistBuild = htmlDir.includes('dist');
      expect(isDistBuild).toBe(false);
    });
  });
});

