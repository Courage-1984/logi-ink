# Social Media Image Generators

This guide explains how to use the HTML generator to create Open Graph and Twitter Card images for your website.

## Files

- **`generate/generate.html`** - Consolidated generator for both OG Image and Twitter Card images
- **`generate/css/`** - Modular CSS files (base, layout, controls, color-picker, canvas)
- **`generate/js/`** - Modular JavaScript files (config, color-picker, preview, export, main)

## How to Use

1. **Open `generate/generate.html`** in your web browser (double-click the HTML file)
2. **Select image type** at the top (OG Image or Twitter Card)
3. **Customize the image:**
   - Select a preset style (Hero, Service Card, Minimal, Gradient, Particles, Cyberpunk, Neon Grid, Geometric, Wave, or Matrix)
   - Enter your title, subtitle, and optional slogan
   - Adjust colors using the color palette pickers
   - Enable glow effects for text elements
   - Adjust text and logo sizes with sliders
   - Choose logo position (9 positions available)
   - Add dividers above/below text sections with customizable colors and widths
4. **Use the Randomize button** to generate random variations
5. **Preview** your changes in real-time
6. **Click "Export as PNG"** to download the image

## Where to Save Generated Images

Based on research and best practices, save your generated images to:

### Recommended Directory Structure

```
assets/
└── images/
    ├── og-image.png          # Open Graph image (1200x630)
    └── twitter-card.png      # Twitter Card image (1200x675)
```

Or alternatively, in the root directory:

```
/
├── og-image.png
└── twitter-card.png
```

## Image Specifications

### Open Graph Image (`og-image.png`)
- **Dimensions:** 1200 x 630 pixels
- **Aspect Ratio:** 1.91:1
- **File Format:** PNG (recommended) or JPEG
- **File Size:** Keep under 5MB
- **Usage:** Facebook, LinkedIn, and other platforms using Open Graph protocol

### Twitter Card Image (`twitter-card.png`)
- **Dimensions:** 1200 x 675 pixels
- **Aspect Ratio:** 16:9
- **File Format:** PNG (recommended), JPEG, or WebP
- **File Size:** Keep under 5MB
- **Usage:** Twitter/X platform

## Updating Meta Tags

After generating and saving your images, update the meta tags in your HTML files:

### Open Graph Meta Tags

```html
<!-- Open Graph -->
<meta property="og:image" content="https://logi-ink.co.za/assets/images/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:type" content="image/png" />
```

### Twitter Card Meta Tags

```html
<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="https://logi-ink.co.za/assets/images/twitter-card.png" />
```

## Preset Styles

### Hero Style
- Dark gradient background with liquid blob effects
- Large, glowing title text
- Perfect for homepage and main landing pages

### Service Card Style
- Card-like appearance with border
- Clean, professional look
- Great for service pages

### Minimal Style
- Simple dark background
- Focus on typography
- Clean and modern

### Gradient Style
- Multi-stop gradient background
- Dynamic and eye-catching
- Versatile for various content types

### Particles Style
- Dark background with particle effects
- Tech-forward aesthetic
- Great for innovation and technology content

### Cyberpunk Style
- Combined effects: blobs, particles, and grid overlay
- Maximum visual impact
- Perfect for tech and innovation content

### Neon Grid Style
- Grid overlay on dark background
- Clean, structured aesthetic
- Great for professional content

### Geometric Style
- Patterned background with geometric shapes
- Modern, abstract look
- Versatile for various content types

### Wave Style
- Horizontal wave effects
- Dynamic, flowing aesthetic
- Great for creative and artistic content

### Matrix Style
- Animated falling matrix-style lines
- Cyberpunk aesthetic
- Perfect for tech and innovation content

## Design Tips

1. **Text Readability:** Keep titles to 5-7 words maximum. Use minimum 30px font size for readability on mobile devices.

2. **High Contrast:** Ensure text has sufficient contrast against the background. The generators use your brand colors with glow effects for visibility.

3. **Whitespace:** Leave at least 10% padding on edges to avoid text being cut off on different platforms.

4. **Brand Consistency:** Use your brand colors (Cyan #00ffff, Magenta #ff00ff, etc.) to maintain consistency.

5. **Logo Placement:** Consider placing the logo in a corner (top-left or top-right) for brand recognition without interfering with text.

## Testing Your Images

After uploading your images, test them using these tools:

- **Facebook Sharing Debugger:** https://developers.facebook.com/tools/debug/
- **Twitter Card Validator:** https://cards-dev.twitter.com/validator
- **LinkedIn Post Inspector:** https://www.linkedin.com/post-inspector/

## Troubleshooting

### Logo Not Appearing
- Ensure `logo.svg` is in the root directory (one level up from `generate/` folder)
- The generator looks for the logo at `../logo.svg` relative to the HTML file
- Check browser console for CORS errors
- Try using `logo-1024x1024.png` instead if SVG doesn't work

### Export Not Working
- Ensure html2canvas library is loading (check browser console)
- Try a different browser if issues persist
- Make sure pop-up blockers aren't preventing the download

### Fonts Not Loading
- The generators use Google Fonts for preview
- Generated images will use the fonts correctly when exported
- If fonts look different, wait a moment for them to load

## Architecture

The generator uses a modular architecture for maintainability:

- **CSS Modules**: Separated into base, layout, controls, color-picker, and canvas styles
- **JavaScript Modules**: Separated into config, color-picker, preview, export, and main logic
- **Single HTML File**: Consolidated generator that handles both OG Image and Twitter Card modes
- **Dynamic Mode Switching**: UI and canvas dimensions automatically adjust when switching between image types

## Notes

- The generator uses your project's color palette and fonts (Orbitron for headings, Rajdhani for body)
- All presets are based on design patterns from your website
- Images are exported at 2x scale for high quality
- The generator works entirely in the browser - no server required
- All color selections are limited to your project's color palette for brand consistency
- Glow effects can be toggled on/off for each text element
- Dividers can be added above/below title and subtitle with customizable colors and stroke widths

