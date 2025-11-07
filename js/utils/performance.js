/**
 * Performance Monitoring Utilities
 * Tracks Web Vitals and performance metrics
 */

/**
 * Track Web Vitals (LCP, FID, CLS)
 * These are Core Web Vitals metrics that Google uses for search rankings
 */
export function trackWebVitals() {
  if (typeof window === 'undefined' || !window.PerformanceObserver) {
    return;
  }

  // Track Largest Contentful Paint (LCP)
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      const lcpValue = lastEntry.renderTime || lastEntry.loadTime;

      // Log LCP (you can send to analytics here)
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 LCP (Largest Contentful Paint):', lcpValue.toFixed(2), 'ms');
      }

      // Send to analytics (uncomment and configure)
      // if (window.gtag) {
      //   window.gtag('event', 'web_vitals', {
      //     event_category: 'Web Vitals',
      //     event_label: 'LCP',
      //     value: Math.round(lcpValue),
      //   });
      // }
    });

    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (error) {
    // PerformanceObserver not supported or error
    if (process.env.NODE_ENV === 'development') {
      console.warn('LCP tracking not available:', error);
    }
  }

  // Track Cumulative Layout Shift (CLS)
  try {
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Only count layout shifts that didn't happen due to user input
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }

      // Log CLS (you can send to analytics here)
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 CLS (Cumulative Layout Shift):', clsValue.toFixed(4));
      }

      // Send to analytics (uncomment and configure)
      // if (window.gtag) {
      //   window.gtag('event', 'web_vitals', {
      //     event_category: 'Web Vitals',
      //     event_label: 'CLS',
      //     value: Math.round(clsValue * 1000),
      //   });
      // }
    });

    clsObserver.observe({ entryTypes: ['layout-shift'] });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('CLS tracking not available:', error);
    }
  }

  // Track First Input Delay (FID)
  try {
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fid = entry.processingStart - entry.startTime;

        // Log FID (you can send to analytics here)
        if (process.env.NODE_ENV === 'development') {
          console.log('📊 FID (First Input Delay):', fid.toFixed(2), 'ms');
        }

        // Send to analytics (uncomment and configure)
        // if (window.gtag) {
        //   window.gtag('event', 'web_vitals', {
        //     event_category: 'Web Vitals',
        //     event_label: 'FID',
        //     value: Math.round(fid),
        //   });
        // }
      }
    });

    fidObserver.observe({ entryTypes: ['first-input'] });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('FID tracking not available:', error);
    }
  }
}

/**
 * Track page load performance
 */
export function trackPageLoad() {
  if (typeof window === 'undefined' || !window.performance) {
    return;
  }

  window.addEventListener('load', () => {
    // Wait a bit for all metrics to be available
    setTimeout(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        const metrics = {
          // DNS lookup time
          dns: navigation.domainLookupEnd - navigation.domainLookupStart,
          // TCP connection time
          tcp: navigation.connectEnd - navigation.connectStart,
          // Request time
          request: navigation.responseStart - navigation.requestStart,
          // Response time
          response: navigation.responseEnd - navigation.responseStart,
          // DOM processing time
          domProcessing: navigation.domComplete - navigation.domInteractive,
          // Total page load time
          loadTime: navigation.loadEventEnd - navigation.fetchStart,
        };

        if (process.env.NODE_ENV === 'development') {
          console.log('📊 Page Load Metrics:', metrics);
        }

        // Send to analytics (uncomment and configure)
        // if (window.gtag) {
        //   window.gtag('event', 'page_load', {
        //     event_category: 'Performance',
        //     event_label: window.location.pathname,
        //     value: Math.round(metrics.loadTime),
        //   });
        // }
      }
    }, 1000);
  });
}

/**
 * Initialize performance tracking
 */
export function initPerformanceTracking() {
  trackWebVitals();
  trackPageLoad();
}

