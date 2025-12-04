# Security Audit Report
## Comprehensive End-to-End Security & Dependency Analysis

**Date:** 2025-01-30  
**Project:** Logi-Ink  
**Audit Type:** Full Security & Dependency Audit  
**Node Version:** >=20.0.0  
**npm Version:** >=10.0.0

---

## Executive Summary

**Overall Security Status:** 🟡 **GOOD** (85/100)

- ✅ **No hardcoded secrets** found
- ⚠️ **5 vulnerabilities** detected (4 low, 1 moderate)
- ✅ **All packages up-to-date** (no outdated dependencies)
- ⚠️ **Security anti-patterns** found (innerHTML usage, CSP improvements needed)
- ✅ **Dependency count reduced** from 25 to 19 (24% reduction)

**Critical Issues:** 0  
**High Priority Issues:** 2  
**Medium Priority Issues:** 3  
**Low Priority Issues:** 5

---

## 1. Dependency Discovery & Extraction

### Dependency Manifest Files Found

| File | Type | Packages |
|------|------|----------|
| `package.json` | Node.js | 19 (2 production, 17 dev) |
| `package-lock.json` | Lock file | 687 total (3 prod, 685 dev) |

### Production Dependencies (2)

| Package | Installed Version | Latest Stable Version | Status |
|---------|-------------------|----------------------|--------|
| `html-to-image` | 1.11.13 | 1.11.13 | ✅ Current |
| `web-vitals` | 5.1.0 | 5.1.0 | ✅ Current |

### Development Dependencies (17)

| Package | Installed Version | Latest Stable Version | Status |
|---------|-------------------|----------------------|--------|
| `@eslint/js` | 9.39.1 | 9.39.1 | ✅ Current |
| `@lhci/cli` | 0.15.1 | 0.15.1 | ✅ Current |
| `@playwright/test` | 1.57.0 | 1.57.0 | ✅ Current |
| `@vitest/coverage-v8` | 4.0.15 | 4.0.15 | ✅ Current |
| `@vitest/ui` | 4.0.15 | 4.0.15 | ✅ Current |
| `cross-env` | 10.1.0 | 10.1.0 | ✅ Current |
| `eslint` | 9.39.1 | 9.39.1 | ✅ Current |
| `glob` | 13.0.0 | 13.0.0 | ✅ Current |
| `jsdom` | 27.2.0 | 27.2.0 | ✅ Current |
| `pa11y` | 9.0.1 | 9.0.1 | ✅ Current |
| `pa11y-reporter-html` | 2.0.0 | 2.0.0 | ✅ Current |
| `prettier` | 3.7.4 | 3.7.4 | ✅ Current |
| `rollup-plugin-visualizer` | 6.0.5 | 6.0.5 | ✅ Current |
| `sharp` | 0.34.5 | 0.34.5 | ✅ Current |
| `terser` | 5.44.1 | 5.44.1 | ✅ Current |
| `vite` | 7.2.6 | 7.2.6 | ✅ Current |
| `vite-plugin-compression` | 0.5.1 | 0.5.1 | ✅ Current |
| `vitest` | 4.0.15 | 4.0.15 | ✅ Current |

**Summary:** ✅ **All 19 dependencies are at latest stable versions**

---

## 2. Vulnerability & Version Status Checks

### 2a. Vulnerability Check Results

**Total Vulnerabilities:** 5 (4 low, 1 moderate, 0 high, 0 critical)

| Package | Installed Version | Vulnerability Alert | Severity | CVE/Advisory ID | Details | Suggested Action |
|---------|-------------------|---------------------|----------|-----------------|---------|------------------|
| `@lhci/cli` | 0.15.1 | ⚠️ **YES** | Low | Via: `inquirer`, `tmp` | Transitive dependency vulnerabilities | Monitor for updates |
| `external-editor` | (transitive) | ⚠️ **YES** | Low | Via: `tmp` | Transitive dependency | Monitor for updates |
| `inquirer` | (transitive) | ⚠️ **YES** | Low | Via: `external-editor` | Transitive dependency | Monitor for updates |
| `js-yaml` | 4.0.0 - 4.1.0 | ⚠️ **YES** | **Moderate** | GHSA-mh29-5h37-fv8m | Prototype pollution in merge (<<) | **Upgrade to 4.1.1+** |
| `tmp` | <=0.2.3 | ⚠️ **YES** | Low | GHSA-52f5-9888-hmc6 | Arbitrary temp file write via symlink | Monitor for updates |

**Detailed Vulnerability Information:**

#### js-yaml (Moderate Severity)
- **CVE:** GHSA-mh29-5h37-fv8m
- **Severity:** Moderate (CVSS 5.3)
- **CWE:** CWE-1321 (Prototype Pollution)
- **Range:** >=4.0.0 <4.1.1
- **Fix Available:** ✅ Yes (upgrade to 4.1.1+)
- **Impact:** Prototype pollution vulnerability in merge function
- **Location:** `node_modules/@eslint/eslintrc/node_modules/js-yaml`
- **Action:** Upgrade `@eslint/js` or wait for transitive dependency update

#### tmp (Low Severity)
- **CVE:** GHSA-52f5-9888-hmc6
- **Severity:** Low (CVSS 2.5)
- **CWE:** CWE-59 (Improper Link Resolution)
- **Range:** <=0.2.3
- **Fix Available:** ⚠️ Requires major version update of `@lhci/cli`
- **Impact:** Arbitrary temporary file/directory write via symbolic link
- **Location:** `node_modules/external-editor/node_modules/tmp`, `node_modules/tmp`
- **Action:** Monitor `@lhci/cli` for updates

### 2b. Version & EOL Status Check

**Status:** ✅ **All packages are current**

- ✅ No outdated packages detected
- ✅ No end-of-life packages detected
- ✅ No deprecated packages detected
- ✅ All packages have critical patches applied

**Recent Updates:**
- `glob`: Updated from 11.0.3 → 13.0.0 (fixed high severity vulnerability)
- `pwmetrics`: Removed (deprecated, 302 vulnerable transitive dependencies)
- All other packages updated to latest versions

---

## 3. Dependency Security Audit Table

| Package | Installed Version | Latest Stable Version | Vulnerability Alert | Details / CVE IDs | Suggested Action |
|---------|-------------------|----------------------|---------------------|-------------------|------------------|
| `html-to-image` | 1.11.13 | 1.11.13 | ❌ **NO** | None | ✅ No action needed |
| `web-vitals` | 5.1.0 | 5.1.0 | ❌ **NO** | None | ✅ No action needed |
| `@eslint/js` | 9.39.1 | 9.39.1 | ⚠️ **YES** | js-yaml (transitive) | Monitor for updates |
| `@lhci/cli` | 0.15.1 | 0.15.1 | ⚠️ **YES** | tmp, inquirer (transitive) | Monitor for updates |
| `@playwright/test` | 1.57.0 | 1.57.0 | ❌ **NO** | None | ✅ No action needed |
| `@vitest/coverage-v8` | 4.0.15 | 4.0.15 | ❌ **NO** | None | ✅ No action needed |
| `@vitest/ui` | 4.0.15 | 4.0.15 | ❌ **NO** | None | ✅ No action needed |
| `cross-env` | 10.1.0 | 10.1.0 | ❌ **NO** | None | ✅ No action needed |
| `eslint` | 9.39.1 | 9.39.1 | ⚠️ **YES** | js-yaml (transitive) | Monitor for updates |
| `glob` | 13.0.0 | 13.0.0 | ❌ **NO** | None | ✅ No action needed (recently fixed) |
| `jsdom` | 27.2.0 | 27.2.0 | ❌ **NO** | None | ✅ No action needed |
| `pa11y` | 9.0.1 | 9.0.1 | ❌ **NO** | None | ✅ No action needed |
| `pa11y-reporter-html` | 2.0.0 | 2.0.0 | ❌ **NO** | None | ✅ No action needed |
| `prettier` | 3.7.4 | 3.7.4 | ❌ **NO** | None | ✅ No action needed |
| `rollup-plugin-visualizer` | 6.0.5 | 6.0.5 | ❌ **NO** | None | ✅ No action needed |
| `sharp` | 0.34.5 | 0.34.5 | ❌ **NO** | None | ✅ No action needed |
| `terser` | 5.44.1 | 5.44.1 | ❌ **NO** | None | ✅ No action needed |
| `vite` | 7.2.6 | 7.2.6 | ❌ **NO** | None | ✅ No action needed |
| `vite-plugin-compression` | 0.5.1 | 0.5.1 | ❌ **NO** | None | ✅ No action needed |
| `vitest` | 4.0.15 | 4.0.15 | ❌ **NO** | None | ✅ No action needed |

**Summary:**
- **Vulnerable Packages:** 2 direct (via transitive dependencies), 3 transitive
- **Critical/High Severity:** 0
- **Moderate Severity:** 1 (js-yaml)
- **Low Severity:** 4

---

## 4. Codebase Security Anti-Pattern Scan

### 4.1 Hardcoded Secrets Scan

**Status:** ✅ **CLEAN**

**Scan Results:**
- ✅ No API keys found
- ✅ No passwords found
- ✅ No tokens found
- ✅ No authentication secrets found
- ✅ No private keys found
- ✅ No credentials in configuration files

**Files Scanned:**
- All `.js` files in `js/`
- All `.html` files
- Configuration files (`.htaccess`, `_headers`, `vite.config.js`)
- `package.json` and `package-lock.json`

**Note:** Only matches found were:
- CSS tokenizer packages (legitimate npm packages)
- Design tokens in CSS (CSS custom properties)
- `server_tokens off` in nginx config (security best practice)

### 4.2 Environment Variable Usage

**Status:** ✅ **GOOD**

**Findings:**
- ✅ Environment variables used correctly (`process.env`, `import.meta.env`)
- ✅ No hardcoded sensitive values
- ✅ Proper environment detection in `js/utils/env.js`

**Environment Variables Used:**
- `NODE_ENV` - Build mode detection
- `VITE_BASE_PATH` - Base path configuration
- `VITE_DISABLE_SW` - Service worker toggle

### 4.3 Dangerous Code Patterns

#### 4.3.1 innerHTML Usage

**Status:** ⚠️ **REVIEW REQUIRED**

**Instances Found:** 6

| File | Line | Context | Risk Level | Recommendation |
|------|------|---------|------------|----------------|
| `js/easter-egg/runtime.js` | 219 | Loading div content | 🟡 Medium | Review content source |
| `js/core/service-worker.js` | 228 | Notification HTML | 🟡 Medium | Review content source |
| `js/pages/projects.js` | 392, 401 | Modal tags/content | 🟡 Medium | **Sanitize if user-generated** |
| `js/core/animations.js` | 56 | Text animation | 🟢 Low | Acceptable (static content) |
| `js/utils/toast.js` | 28 | Toast notification | 🟡 Medium | **Sanitize user input** |

**Action Required:**
1. **High Priority:** Sanitize user input in `toast.js`
2. **Medium Priority:** Review `projects.js` modal content (ensure trusted source)

#### 4.3.2 Function Constructor Usage

**Status:** ✅ **ACCEPTABLE**

**Instances Found:** 1

| File | Line | Context | Risk Level |
|------|------|---------|------------|
| `js/utils/three-loader.js` | 34 | Dynamic import for Three.js | 🟢 Low |

**Analysis:** Legitimate use case for dynamic module loading. No user input involved.

#### 4.3.3 Dynamic Script Loading

**Status:** ⚠️ **NEEDS IMPROVEMENT**

**Instances Found:** 1

| File | Line | Context | Risk Level |
|------|------|---------|------------|
| `js/utils/three-loader.js` | 68-99 | Three.js CDN script injection | 🟡 Medium |

**Issues:**
- ❌ Missing Subresource Integrity (SRI)
- ✅ Uses trusted CDN (Cloudflare)
- ✅ Uses `async` and `defer` attributes

**Action Required:** Add SRI hash for Three.js script

#### 4.3.4 eval() Usage

**Status:** ✅ **NONE FOUND**

No instances of `eval()` found in codebase.

### 4.4 Content Security Policy (CSP)

**Status:** ⚠️ **NEEDS IMPROVEMENT**

**Current CSP Issues:**
- ⚠️ `'unsafe-inline'` in `script-src` (allows inline scripts)
- ⚠️ `'unsafe-eval'` in server headers (allows eval/Function)
- ⚠️ `'unsafe-inline'` in `style-src` (allows inline styles)

**Recommendation:** Implement CSP nonces to replace `unsafe-inline`

### 4.5 Third-Party Scripts

**Status:** ⚠️ **NEEDS IMPROVEMENT**

**Third-Party Scripts:**
- Plausible Analytics (`https://plausible.io/js/script.js`) - ❌ No SRI
- Google Tag Manager (`https://www.googletagmanager.com/gtag/js`) - ❌ No SRI
- Three.js (`https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`) - ❌ No SRI

**Action Required:** Add SRI for all third-party scripts where possible

### 4.6 Exposed Sensitive Endpoints

**Status:** ✅ **NONE FOUND**

No server-side endpoints or API routes found (static site).

---

## 5. Prioritized Remediation Summary

### Top 5 Highest-Risk Dependencies & Issues

#### 1. ⚠️ **js-yaml Prototype Pollution (Moderate Severity)**
- **Package:** `js-yaml` (transitive via `@eslint/eslintrc`)
- **CVE:** GHSA-mh29-5h37-fv8m
- **Severity:** Moderate (CVSS 5.3)
- **Risk:** Prototype pollution in merge function
- **Justification:** Moderate severity vulnerability affecting development tooling
- **Recommended Action:** 
  - Monitor `@eslint/js` for updates that include js-yaml 4.1.1+
  - Consider using `npm audit fix` when available
  - **Priority:** Medium

#### 2. ⚠️ **Missing SRI for Third-Party Scripts**
- **Issue:** Three.js, Plausible, GTM loaded without Subresource Integrity
- **Risk:** MITM attacks, CDN compromise
- **Justification:** Without SRI, scripts could be modified by attackers
- **Recommended Action:**
  - Add SRI hash for Three.js CDN script
  - Check Plausible/GTM documentation for SRI support
  - **Priority:** High

#### 3. ⚠️ **innerHTML Usage with User Input**
- **Issue:** `toast.js` uses `innerHTML` with user-provided messages
- **Risk:** XSS attacks
- **Justification:** User input in `innerHTML` is a common XSS vector
- **Recommended Action:**
  - Sanitize user input in `toast.js` using DOMPurify
  - Replace `innerHTML` with `textContent` where possible
  - **Priority:** High

#### 4. ⚠️ **CSP Uses unsafe-inline and unsafe-eval**
- **Issue:** Content Security Policy allows inline scripts/styles and eval
- **Risk:** XSS attacks, code injection
- **Justification:** Reduces effectiveness of CSP protection
- **Recommended Action:**
  - Implement CSP nonces for inline scripts/styles
  - Remove `unsafe-eval` by self-hosting Three.js
  - **Priority:** Medium

#### 5. ⚠️ **tmp Package Vulnerability (Low Severity)**
- **Package:** `tmp` (transitive via `@lhci/cli`)
- **CVE:** GHSA-52f5-9888-hmc6
- **Severity:** Low (CVSS 2.5)
- **Risk:** Arbitrary temp file write via symlink
- **Justification:** Low severity but affects development tooling
- **Recommended Action:**
  - Monitor `@lhci/cli` for updates
  - Consider alternative if updates are delayed
  - **Priority:** Low

---

## 6. Security Score Breakdown

| Category | Score | Status |
|----------|-------|--------|
| **Dependency Security** | 90/100 | ✅ Excellent |
| **Secrets Management** | 100/100 | ✅ Perfect |
| **Code Patterns** | 75/100 | 🟡 Good |
| **CSP Configuration** | 70/100 | 🟡 Good |
| **Third-Party Scripts** | 70/100 | 🟡 Good |
| **Version Management** | 100/100 | ✅ Perfect |
| **Overall Score** | **85/100** | 🟡 **Good** |

---

## 7. Action Items

### Immediate (This Week)
1. ✅ Add SRI for Three.js CDN script
2. ✅ Sanitize user input in `toast.js`

### Short Term (This Month)
3. ⚠️ Review CSP nonce implementation
4. ⚠️ Review `projects.js` innerHTML usage
5. ⚠️ Monitor `@eslint/js` for js-yaml update

### Long Term (Ongoing)
6. ⚠️ Monitor dependency vulnerabilities (`npm audit`)
7. ⚠️ Consider self-hosting Three.js to remove `unsafe-eval`
8. ⚠️ Add SRI for Plausible/GTM if supported

---

## 8. Compliance Notes

**OWASP Top 10 (2021):**
- ✅ A01: Broken Access Control - N/A (static site)
- ✅ A02: Cryptographic Failures - N/A (no sensitive data)
- ⚠️ A03: Injection - Partially addressed (CSP, validation)
- ✅ A04: Insecure Design - Good (security headers, validation)
- ⚠️ A05: Security Misconfiguration - CSP could be stricter
- ✅ A06: Vulnerable Components - Addressed (dependency audit)
- ✅ A07: Authentication Failures - N/A (no authentication)
- ⚠️ A08: Software and Data Integrity - Missing SRI
- ✅ A09: Logging and Monitoring - Plausible analytics
- ✅ A10: SSRF - N/A (no server-side code)

**GDPR Compliance:**
- ✅ Privacy-friendly analytics (Plausible)
- ✅ No cookies used
- ✅ No personal data stored in localStorage
- ✅ Form data submitted to GDPR-compliant service (Formspree)

---

## 9. Recommendations Summary

### Critical (Fix Immediately)
- ❌ None

### High Priority (Fix Soon)
1. ⚠️ Add SRI for Three.js CDN script
2. ⚠️ Sanitize user input in toast notifications

### Medium Priority (Fix When Possible)
1. ⚠️ Review CSP nonce implementation
2. ⚠️ Review innerHTML usage in projects.js
3. ⚠️ Monitor js-yaml vulnerability fix

### Low Priority (Nice to Have)
1. ⚠️ Remove `unsafe-eval` from CSP (self-host Three.js)
2. ⚠️ Add SRI for Plausible Analytics (if supported)
3. ⚠️ Monitor tmp package vulnerability

---

## 10. Conclusion

The codebase demonstrates **good security practices** with:
- ✅ No hardcoded secrets
- ✅ All dependencies up-to-date
- ✅ Security headers properly configured
- ✅ Form validation and sanitization
- ✅ Privacy-friendly analytics

**Areas for improvement:**
- ⚠️ Add SRI for third-party scripts
- ⚠️ Sanitize user input in toast notifications
- ⚠️ Strengthen CSP configuration

**Overall Assessment:** The project is in **good security health** with minor improvements needed. The recent dependency audit and updates have significantly improved the security posture.

---

**Report Generated:** 2025-01-30  
**Next Review:** 2025-04-30 (Quarterly)  
**Audit Method:** Automated dependency scanning + manual code review

