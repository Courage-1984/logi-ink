/**
 * Measure LCP and CLS using web-vitals library
 * This script can be run in Node.js with Playwright or in the browser
 */

import { onLCP, onCLS } from 'web-vitals';

// For browser usage
if (typeof window !== 'undefined') {
  const results = {
    lcp: null,
    cls: null,
  };

  onLCP((metric) => {
    results.lcp = {
      value: Math.round(metric.value),
      rating: metric.rating,
      element: metric.element?.tagName || 'unknown',
    };
    console.log('📊 LCP:', results.lcp);
    window.__webVitalsLCP = results.lcp;
  });

  onCLS((metric) => {
    results.cls = {
      value: parseFloat(metric.value.toFixed(4)),
      rating: metric.rating,
    };
    console.log('📊 CLS:', results.cls);
    window.__webVitalsCLS = results.cls;
  });

  // Wait for metrics to be collected
  setTimeout(() => {
    console.log('📊 Final Web Vitals Results:', results);
    window.__webVitalsResults = results;
  }, 10000);
} else {
  // For Node.js usage with Playwright
  console.log('This script is designed to run in the browser.');
  console.log('Use it by injecting it into a page or loading it as a module.');
}

