# TODO - Outstanding Tasks

## Analytics Setup

- Visit `https://plausible.io/login` and sign in (or create a free account)
- Add `logi-ink.co.za` as a site (script tag already embedded across all pages)
- After traffic flows, Web Vitals appear in Plausible dashboard as `Web Vital - LCP`, `Web Vital - INP`, etc.
- For testing: Use DevTools Console → `window.plausible?.('Web Vital - LCP',{props:{value:'1800',rating:'good'}});`

## Documentation Follow-ups

- Review config documentation (`vite.config.js`, PostCSS safelist commentary, manifest fields) to ensure comments match latest build pipeline
- Re-audit SEO/Security guidance after next sitemap or analytics iteration
- Reconcile research artefacts with any new service offerings before next public release

