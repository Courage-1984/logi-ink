# Google Maps & Business Profile URLs Guide

**Last Updated:** 2025-01-30

---

## 📍 Current URLs in Use

### Google Maps Embed URL (for iframe)
**Location:** `contact.html` (line 1476)

**Current URL:**
```
https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3591.9080572434223!2d28.276368375401937!3d-25.80660717732373!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4bd4c0614cda960f%3A0x9d43e09999af7fe5!2sLogi-Ink!5e0!3m2!1sen!2sza!4v1765489182675!5m2!1sen!2sza
```

**Used in:**
- Contact page map iframe (`contact.html`)

---

### Google Business Profile URL
**Location:** `partials/footer.html` (line 43)

**Current URL:**
```
https://business.google.com/n/2239660806201030393/profile?fid=11332148037707333605
```

**Used in:**
- Footer social links (all pages via `partials/footer.html`)

---

### Google Maps Short Link
**Location:** `partials/footer.html` (line 64) and `contact.html` (Get Directions button)

**Current URL:**
```
https://maps.app.goo.gl/8DWBKtV9eKXy8ko97
```

**Used in:**
- Footer address link (all pages via `partials/footer.html`)
- Contact page "Get Directions" button (`contact.html`)

---

## 🔍 How to Find/Update These URLs

### 1. Google Maps Embed URL (for iframe)

**Method 1: Using Google Maps Website (Recommended)**

1. Go to [Google Maps](https://www.google.com/maps)
2. Search for your business address: `533 Andries Strydom St, Constantia Park, Pretoria, 0181, South Africa`
3. Click on the location marker
4. Click the **"Share"** button
5. Click the **"Embed a map"** tab
6. Copy the iframe `src` URL from the embed code
7. The URL will look like:
   ```
   https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d...&output=embed
   ```
   OR
   ```
   https://maps.google.com/maps?q=YOUR+ADDRESS&output=embed
   ```

**Method 2: Manual URL Construction**

If you know your exact address, you can construct the URL:
```
https://maps.google.com/maps?q=YOUR+FULL+ADDRESS&t=&z=15&ie=UTF8&iwloc=&output=embed
```

Replace `YOUR+FULL+ADDRESS` with your address (use `+` for spaces, e.g., `533+Andries+Strydom+St`)

**Update Location:**
- File: `contact.html`
- Line: ~1476
- Element: `<iframe>` `src` attribute

---

### 2. Google Business Profile URL

**How to Find Your Google Business Profile URL:**

1. Go to [Google Business Profile Manager](https://business.google.com)
2. Sign in with the Google account that manages your business
3. Select your business (Logi-Ink)
4. The URL in your browser will be your Business Profile URL:
   ```
   https://business.google.com/n/YOUR-PROFILE-ID
   ```
   Example: `https://business.google.com/n/2239660806201030393`

**Alternative Method:**

1. Search for your business on [Google Maps](https://www.google.com/maps)
2. Click on your business listing
3. Look for the "Business profile" link or "Own this business?" link
4. The URL will contain your profile ID

**Update Location:**
- File: `partials/footer.html`
- Line: ~43
- Element: Footer social link `<a href="...">`

---

### 3. Google Maps Short Link (maps.app.goo.gl)

**How to Create/Update:**

1. Go to [Google Maps](https://www.google.com/maps)
2. Search for your business address
3. Click on the location marker
4. Click the **"Share"** button
5. In the "Send a link" tab, you'll see a short link like:
   ```
   https://maps.app.goo.gl/XXXXXXXXXXXX
   ```
6. Copy this link

**Note:** This is a short link that redirects to the full Google Maps URL. It's useful for sharing and linking.

**Update Location:**
- File: `partials/footer.html`
- Line: ~64
- Element: Footer address link `<a href="...">`

---

## ✅ Verification Steps

### Verify Google Maps Embed URL

1. Open `contact.html` in a browser
2. Navigate to the contact page
3. Check if the map displays correctly
4. Verify the location marker is at the correct address
5. Test map controls (zoom, pan) if enabled

### Verify Google Business Profile URL

1. Click the Google Business Profile link in the footer
2. Verify it opens your correct business profile
3. Check that all business information is correct
4. Verify reviews and photos are visible

### Verify Google Maps Short Link

1. Click the address link in the footer
2. Verify it opens Google Maps with the correct location
3. Check that the address is accurate

---

## 🔧 How to Update URLs

### Update Google Maps Embed URL

**File:** `contact.html`

**Find this code (around line 1474-1488):**
```html
<iframe
  class="map-iframe"
  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3591.9080572434223!2d28.276368375401937!3d-25.80660717732373!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4bd4c0614cda960f%3A0x9d43e09999af7fe5!2sLogi-Ink!5e0!3m2!1sen!2sza!4v1765489182675!5m2!1sen!2sza"
  ...
>
```

**Replace the `src` attribute** with your new embed URL.

---

### Update Google Business Profile URL

**File:** `partials/footer.html`

**Find this code (around line 43):**
```html
<a href="https://business.google.com/n/2239660806201030393/profile?fid=11332148037707333605" target="_blank" rel="noopener noreferrer" aria-label="Visit our Google Business Profile" class="footer-social-link">
```

**Replace the `href` attribute** with your new Business Profile URL.

---

### Update Google Maps Short Link

**File:** `partials/footer.html`

**Find this code (around line 64):**
```html
<a href="https://maps.app.goo.gl/8DWBKtV9eKXy8ko97" target="_blank" rel="noopener noreferrer" class="footer-contact-link" aria-label="Our address">
```

**Replace the `href` attribute** with your new short link.

---

## 📝 Important Notes

### Google Maps Embed URL

- **Must include `&output=embed`** at the end for iframe embedding
- The `q=` parameter contains your address (URL-encoded)
- The `z=` parameter is the zoom level (15 is a good default)
- You can customize the map style by adding parameters like `&t=m` (map) or `&t=k` (satellite)

### Google Business Profile URL

- The URL format is: `https://business.google.com/n/PROFILE-ID`
- The profile ID is unique to your business
- This URL is used for linking, not embedding
- Make sure you're signed in to the correct Google account when viewing

### Google Maps Short Link

- These links are permanent but can be regenerated
- If you need a new link, create it from Google Maps (Share button)
- The link redirects to the full Google Maps URL
- Useful for sharing and keeps URLs clean

---

## 🎯 Best Practices

1. **Test After Updates:**
   - Always test map embeds and links after updating URLs
   - Verify on both desktop and mobile
   - Check that the location is accurate

2. **Keep URLs Updated:**
   - If you move locations, update all three URLs
   - Update structured data (JSON-LD) if address changes
   - Update footer and contact page simultaneously

3. **Accessibility:**
   - Ensure map iframe has proper `title` and `aria-label` attributes
   - Provide alternative text or link for users who can't view maps
   - Test keyboard navigation

4. **Performance:**
   - Maps are lazy-loaded (`loading="lazy"`) for better performance
   - Consider using a static map image as fallback for very slow connections

---

## 🔗 Related Files

- `contact.html` - Map embed iframe
- `partials/footer.html` - Business Profile link and Maps short link
- `index.html` - Structured data with address (JSON-LD)
- `docs/GOOGLE_BUSINESS_PROFILE_OPTIMIZATION.md` - Complete Business Profile guide

---

## 📚 Additional Resources

- [Google Maps Embed API Documentation](https://developers.google.com/maps/documentation/embed)
- [Google Business Profile Help](https://support.google.com/business)
- [Google Maps Platform](https://developers.google.com/maps)

---

**Last Updated:** 2025-01-30

