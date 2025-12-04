# Server Optimization Guide for Logi-Ink

## Overview

This guide provides comprehensive optimization steps for your cPanel-hosted website at `logi-ink.co.za`. Based on your server information (Apache 2.4.65, cPanel 110.0), these optimizations will improve performance, SEO, and security.

---

## ✅ Already Implemented

1. **IP Redirect** - All IP/subdirectory access redirects to canonical domain
2. **Security Headers** - X-Frame-Options, CSP, etc.
3. **Compression** - Gzip enabled for text assets
4. **Caching** - Browser caching configured for static assets
5. **Clean URLs** - `.html` extension removal

---

## 🚀 New Optimizations Applied

### 1. Enhanced Compression

**What Changed:**
- Added Brotli compression support (if available via LiteSpeed/Cloudflare)
- Expanded compression to include more MIME types (fonts, SVG, XML)
- Better browser compatibility handling

**Benefits:**
- **15-25% better compression** than Gzip alone
- Faster page loads, especially on mobile
- Reduced bandwidth usage

### 2. Improved Caching Strategy

**What Changed:**
- HTML files: 5-minute cache with revalidation (fresh content, but cached)
- Static assets: 1-year immutable cache (images, fonts, CSS/JS with hashes)
- Manifest files: No cache (always fresh for PWA updates)

**Benefits:**
- Faster repeat visits
- Better cache hit rates
- Automatic updates when content changes

### 3. Enhanced Cache-Control Headers

**What Changed:**
- Specific cache policies per file type
- ETag removal (better CDN compatibility)
- Vary headers for compression negotiation

**Benefits:**
- Better CDN performance
- Reduced server load
- Improved mobile performance

---

## 📋 cPanel-Specific Optimizations

### Step 1: SSL/TLS Configuration

**Location:** `cPanel → SSL/TLS Status`

1. **Verify SSL Certificate:**
   - Ensure your certificate is valid and auto-renewing
   - Check certificate expiration date
   - Verify HTTPS is enforced (you have the padlock icon ✅)

2. **Enable HTTP/2:**
   - Check if HTTP/2 is enabled (most modern servers have this)
   - HTTP/2 provides multiplexing and better performance

3. **Enable HSTS (HTTP Strict Transport Security):**
   - This is already handled in your `.htaccess` via security headers
   - Verify it's working: Visit `https://securityheaders.com` and check your site

### Step 2: LiteSpeed Cache (If Available)

**Location:** `cPanel → LiteSpeed Web Cache Manager`

If your hosting provider uses LiteSpeed (check Server Information), enable:

1. **Enable LiteSpeed Cache:**
   - Navigate to LiteSpeed Web Cache Manager
   - Enable cache for your domain
   - Set cache TTL: 1 day for HTML, 1 year for static assets

2. **Configure Cache Rules:**
   - **HTML Pages:** Cache for 1 day
   - **Static Assets:** Cache for 1 year
   - **Exclude:** `/sw.js`, `/site.webmanifest` (always fresh)

3. **Enable ESI (Edge Side Includes):**
   - If available, enable for dynamic content sections

**Note:** If LiteSpeed is not available, your Apache `.htaccess` optimizations will still work.

### Step 3: Redis Cache (If Available)

**Location:** `cPanel → LiteSpeed Redis Cache Manager`

If Redis is available:

1. **Enable Redis:**
   - Navigate to LiteSpeed Redis Cache Manager
   - Enable Redis cache for your domain
   - Set default TTL: 3600 seconds (1 hour)

2. **Benefits:**
   - Faster database queries (if you add dynamic features later)
   - Reduced server load
   - Better performance for concurrent users

### Step 4: Optimize Website Tool

**Location:** `cPanel → Software → Optimize Website`

1. **Run Optimization:**
   - Click "Optimize Website"
   - This will compress static files and optimize delivery

2. **Enable Keep-Alive:**
   - If available, enable HTTP Keep-Alive
   - Reduces connection overhead

### Step 5: Site Quality Monitoring

**Location:** `cPanel → Site Quality Monitoring`

1. **Start Monitoring:**
   - Click "Start Monitoring"
   - Set up alerts for:
     - Uptime monitoring
     - Performance metrics
     - SSL certificate expiration

2. **Benefits:**
   - Proactive issue detection
   - Performance tracking
   - SEO monitoring

---

## 🔧 Additional Server Optimizations

### 1. PHP Version (If Using PHP)

**Location:** `cPanel → Software → Select PHP Version`

- Use **PHP 8.2 or 8.3** (latest stable)
- Enable OPcache for better performance
- Disable unused PHP extensions

**Note:** Since you're using a static site (Vite build), PHP version is less critical, but good to optimize if you have any PHP scripts.

### 2. MultiPHP Manager

**Location:** `cPanel → Software → MultiPHP Manager`

- Ensure your domain uses the latest PHP version
- Enable OPcache if available

### 3. File Manager Optimization

**Location:** `cPanel → Files → File Manager`

1. **Verify File Permissions:**
   - HTML files: `644`
   - Directories: `755`
   - `.htaccess`: `644`

2. **Check File Sizes:**
   - Your site is only **274.67 MB** (excellent!)
   - Keep monitoring disk usage
   - Clean up old backups if needed

### 4. Backup Configuration

**Location:** `cPanel → Files → Backup`

**Important:** Your backup disk is at **94% capacity** (yellow warning)!

1. **Immediate Action Required:**
   - Review old backups
   - Delete unnecessary backups
   - Set up automatic backup cleanup
   - Consider off-site backups (cloud storage)

2. **Backup Strategy:**
   - Keep last 3-7 days of backups
   - Weekly backups for older versions
   - Monthly archives for long-term storage

---

## 📊 Performance Monitoring

### 1. Google Search Console

1. **Verify Domain:**
   - Add `https://logi-ink.co.za/` to Google Search Console
   - Set preferred domain (with or without www)
   - Submit sitemap: `https://logi-ink.co.za/sitemap.xml`

2. **Monitor:**
   - Core Web Vitals (LCP, CLS, INP)
   - Mobile usability
   - Indexing status

### 2. Google PageSpeed Insights

1. **Test Your Site:**
   - Visit: https://pagespeed.web.dev/
   - Enter: `https://logi-ink.co.za/`
   - Review recommendations

2. **Target Scores:**
   - **Mobile:** 90+ (Good)
   - **Desktop:** 95+ (Excellent)

### 3. GTmetrix

1. **Test Performance:**
   - Visit: https://gtmetrix.com/
   - Test your site
   - Review waterfall chart

2. **Key Metrics:**
   - **PageSpeed Score:** 90+
   - **YSlow Score:** 90+
   - **Fully Loaded Time:** < 2 seconds

---

## 🔒 Security Optimizations

### 1. IP Blocker

**Location:** `cPanel → Security → IP Blocker`

1. **Block Malicious IPs:**
   - Review access logs for suspicious activity
   - Block IPs with repeated failed login attempts
   - Block known bot IPs (if not needed)

### 2. SSL/TLS Status

**Location:** `cPanel → Security → SSL/TLS Status`

1. **Verify Configuration:**
   - Ensure SSL is active for all domains
   - Check certificate chain is complete
   - Verify auto-renewal is enabled

### 3. Two-Factor Authentication

**Location:** `cPanel → Preferences → Password & Security → Two-Factor Authentication`

1. **Enable 2FA:**
   - Protect your cPanel account
   - Use authenticator app (Google Authenticator, Authy)

---

## 📈 SEO Optimizations

### 1. Robots.txt Verification

**Current:** Your `robots.txt` is properly configured ✅

**Verify:**
- Visit: `https://logi-ink.co.za/robots.txt`
- Ensure it allows search engines
- Check sitemap location

### 2. Sitemap Submission

1. **Google Search Console:**
   - Submit: `https://logi-ink.co.za/sitemap.xml`

2. **Bing Webmaster Tools:**
   - Submit sitemap there as well

### 3. Canonical URLs

**Status:** ✅ Already implemented in HTML

**Verify:**
- All pages have canonical tags
- Canonical points to HTTPS version
- No duplicate content issues

---

## 🎯 Performance Targets

### Current Status (Based on cPanel Stats)

- **Disk Usage:** 274.67 MB / 10 GB (2.68%) ✅ Excellent
- **Bandwidth:** 1.05 GB / 1 TB (0.1%) ✅ Excellent
- **CPU Usage:** 0% ✅ Excellent
- **Memory Usage:** 0% ✅ Excellent

### Target Metrics

- **Page Load Time:** < 2 seconds
- **Time to First Byte (TTFB):** < 200ms
- **Largest Contentful Paint (LCP):** < 2.5 seconds
- **Cumulative Layout Shift (CLS):** < 0.1
- **First Input Delay (FID):** < 100ms
- **Interaction to Next Paint (INP):** < 200ms

---

## 🚨 Critical Actions Required

### 1. Backup Disk Space (URGENT)

**Status:** 94% full (yellow warning)

**Action:**
1. Log into cPanel
2. Go to `Files → Backup`
3. Delete old backups (keep last 7 days)
4. Set up automatic cleanup
5. Consider off-site backup solution

### 2. Test IP Redirect

**Action:**
1. Visit: `http://169.239.217.50/~logiinkco/`
2. Verify it redirects to `https://logi-ink.co.za/`
3. Check browser console for errors

### 3. Verify Compression

**Action:**
1. Visit: https://tools.pingdom.com/
2. Test your site
3. Verify Gzip/Brotli compression is working
4. Check compression ratio (should be 70%+ for text files)

---

## 📝 Maintenance Checklist

### Weekly
- [ ] Check site uptime
- [ ] Review access logs for errors
- [ ] Monitor disk usage
- [ ] Test page speed

### Monthly
- [ ] Review backup disk space
- [ ] Update dependencies (if any)
- [ ] Check SSL certificate expiration
- [ ] Review Google Search Console reports
- [ ] Test all forms and functionality

### Quarterly
- [ ] Full site performance audit
- [ ] Security scan
- [ ] Review and optimize images
- [ ] Update content and SEO

---

## 🛠️ Troubleshooting

### Issue: Compression Not Working

**Solution:**
1. Check if `mod_deflate` is enabled (contact hosting provider)
2. Verify `.htaccess` is in root directory
3. Test with: https://tools.pingdom.com/

### Issue: Caching Not Working

**Solution:**
1. Check if `mod_expires` and `mod_headers` are enabled
2. Clear browser cache
3. Test with: https://www.webpagetest.org/

### Issue: SSL Certificate Issues

**Solution:**
1. Check SSL/TLS Status in cPanel
2. Verify certificate is valid
3. Contact hosting provider if auto-renewal fails

---

## 📚 Additional Resources

- **Google PageSpeed Insights:** https://pagespeed.web.dev/
- **GTmetrix:** https://gtmetrix.com/
- **WebPageTest:** https://www.webpagetest.org/
- **Security Headers:** https://securityheaders.com/
- **SSL Labs:** https://www.ssllabs.com/ssltest/

---

## ✅ Summary

Your site is already well-optimized! The enhancements made to `.htaccess` will provide:

1. **Better Compression** - Brotli support, expanded MIME types
2. **Smarter Caching** - Optimized cache policies per file type
3. **Improved Performance** - Better cache headers, ETag removal
4. **SEO Protection** - IP redirect, canonical URLs

**Next Steps:**
1. ✅ Upload updated `.htaccess` to server
2. ⚠️ **URGENT:** Clean up backup disk (94% full)
3. 🔧 Configure LiteSpeed Cache (if available)
4. 📊 Set up Site Quality Monitoring
5. 🧪 Test performance with PageSpeed Insights

---

**Last Updated:** 2025-01-30
**Server:** Apache 2.4.65, cPanel 110.0
**Domain:** logi-ink.co.za

