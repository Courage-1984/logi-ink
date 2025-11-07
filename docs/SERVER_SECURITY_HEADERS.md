# Server-Level Security Headers Configuration

This document provides configuration examples for setting up security headers at the server level for different web server platforms.

## 🔒 Security Headers

The following security headers should be configured on your web server:

- **X-Content-Type-Options: nosniff** - Prevents MIME type sniffing
- **X-Frame-Options: DENY** - Prevents clickjacking attacks
- **X-XSS-Protection: 1; mode=block** - XSS protection
- **Referrer-Policy: strict-origin-when-cross-origin** - Controls referrer information
- **Permissions-Policy** - Restricts browser features
- **Content-Security-Policy** - Controls resource loading (adjust based on your needs)

## 📋 Configuration Files

### Apache (.htaccess)

**File:** `.htaccess` (in root directory)

The `.htaccess` file has been created in the project root. This file will work for Apache servers.

**Note:** Some hosting providers may require you to enable `mod_headers` module.

### Nginx (nginx.conf)

**File:** `nginx.conf.example` (example configuration)

Copy the configuration from `nginx.conf.example` to your Nginx server block configuration.

**Location:** Usually in `/etc/nginx/sites-available/your-site` or in your main `nginx.conf`

### Netlify/Vercel (_headers)

**File:** `_headers` (in root directory)

The `_headers` file has been created for Netlify and Vercel deployments. This file is automatically used by these platforms.

## 🧪 Testing Security Headers

After configuring your server, test your security headers using:

1. **[Security Headers](https://securityheaders.com/)** - Comprehensive security header testing
2. **[Mozilla Observatory](https://observatory.mozilla.org/)** - Security analysis tool
3. Browser DevTools - Check Network tab → Headers section

## 📝 Content Security Policy (CSP)

**Important:** The CSP in the configuration files is a basic example. You may need to adjust it based on your specific needs:

- If you use external CDNs, add them to `script-src` and `style-src`
- If you use external APIs, add them to `connect-src`
- If you embed external content, adjust `frame-src` and `frame-ancestors`

**Example CSP for external resources:**
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.example.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://api.example.com; frame-ancestors 'none';
```

## 🔧 Platform-Specific Instructions

### Apache

1. Ensure `mod_headers` is enabled:
   ```bash
   sudo a2enmod headers
   sudo systemctl restart apache2
   ```

2. The `.htaccess` file will be automatically used if `.htaccess` files are enabled

3. Test configuration:
   ```bash
   apache2ctl configtest
   ```

### Nginx

1. Add the configuration to your server block

2. Test configuration:
   ```bash
   sudo nginx -t
   ```

3. Reload Nginx:
   ```bash
   sudo systemctl reload nginx
   ```

### Netlify

1. The `_headers` file is automatically used
2. No additional configuration needed
3. Test after deployment

### Vercel

1. The `_headers` file is automatically used
2. No additional configuration needed
3. Test after deployment

### GitHub Pages

GitHub Pages doesn't support custom headers. You'll need to:
- Use a custom domain with a proxy/CDN (Cloudflare, etc.)
- Or use meta tags (already implemented in HTML files)

## ⚠️ Important Notes

1. **CSP Adjustments:** The Content Security Policy may need adjustments based on your specific needs. Test thoroughly after implementation.

2. **Meta Tags vs Headers:** Meta tags provide basic protection, but server-level headers are more secure and cannot be bypassed.

3. **Testing:** Always test your site after implementing security headers to ensure nothing breaks.

4. **Gradual Implementation:** Consider implementing CSP gradually:
   - Start with `Content-Security-Policy-Report-Only` to test
   - Monitor reports before enforcing

## 🔗 Resources

- [Security Headers](https://securityheaders.com/)
- [Mozilla Observatory](https://observatory.mozilla.org/)
- [Content Security Policy (CSP) Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP Security Headers](https://owasp.org/www-project-secure-headers/)

---

**Last Updated:** 2024-12-19
**Status:** Configuration files created, ready for deployment

