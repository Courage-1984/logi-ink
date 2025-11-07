# Video Background Overlay Guide

This guide explains how to optimize and implement `ripples.mp4` as a background overlay that autoplays infinitely.

## 🎥 Video Optimization

### Prerequisites

**Install FFmpeg** (required for video optimization):

- **Windows**: Download from [https://www.gyan.dev/ffmpeg/builds/](https://www.gyan.dev/ffmpeg/builds/)
  - Extract and add to PATH, or place `ffmpeg.exe` in project root
- **macOS**: `brew install ffmpeg`
- **Linux**: `sudo apt-get install ffmpeg`

### Optimize the Video

Run the optimization script to create multiple optimized versions:

```bash
npm run optimize-video
```

This will create optimized versions in `assets/video/optimized/`:
- `ripples-hq.mp4` - High quality (1080p, 2 Mbps) for desktop
- `ripples-mq.mp4` - Medium quality (720p, 1.5 Mbps) for tablet
- `ripples-lq.mp4` - Low quality (480p, 800 kbps) for mobile
- `ripples-hq.webm` - WebM format (better compression, modern browsers)
- `ripples-poster.jpg` - Poster image (first frame) for faster initial load

### Optimization Settings Explained

The script optimizes videos for web background use with these considerations:

1. **Resolution**: Multiple sizes for responsive loading
   - Desktop: 1920x1080 (1080p)
   - Tablet: 1280x720 (720p)
   - Mobile: 854x480 (480p)

2. **Bitrate**: Lower bitrates for smaller file sizes
   - Desktop: 2 Mbps
   - Tablet: 1.5 Mbps
   - Mobile: 800 kbps

3. **Frame Rate**: 30 fps (desktop/tablet), 24 fps (mobile)
   - Background videos don't need 60 fps

4. **Codec**: H.264 (MP4) for compatibility, VP9 (WebM) for better compression

5. **Audio**: Removed (saves significant file size for background videos)

6. **Fast Start**: MP4 files are optimized for web streaming

## 🎬 Implementation

### HTML Structure

Add the video background to your hero section:

```html
<section class="hero">
  <!-- Video Background -->
  <div class="hero-video-background">
    <video
      autoplay
      muted
      loop
      playsinline
      preload="metadata"
      poster="./assets/video/optimized/ripples-poster.jpg"
      aria-label="Ripples background video"
    >
      <!-- WebM format (better compression, modern browsers) -->
      <source
        src="./assets/video/optimized/ripples-hq.webm"
        type="video/webm"
        media="(min-width: 1025px)"
      />
      <!-- High quality MP4 (desktop) -->
      <source
        src="./assets/video/optimized/ripples-hq.mp4"
        type="video/mp4"
        media="(min-width: 1025px)"
      />
      <!-- Medium quality MP4 (tablet) -->
      <source
        src="./assets/video/optimized/ripples-mq.mp4"
        type="video/mp4"
        media="(min-width: 769px)"
      />
      <!-- Low quality MP4 (mobile) -->
      <source
        src="./assets/video/optimized/ripples-lq.mp4"
        type="video/mp4"
      />
      <!-- Fallback text -->
      Your browser does not support the video tag.
    </video>
  </div>

  <!-- Video Overlay (for text readability) -->
  <div class="hero-video-overlay"></div>

  <!-- Existing hero background (optional - can be removed if using video) -->
  <div class="hero-background"></div>

  <!-- Hero Content -->
  <div class="hero-content">
    <!-- Your hero content here -->
  </div>
</section>
```

### Video Attributes Explained

- **`autoplay`**: Starts playing automatically
- **`muted`**: Required for autoplay (browser policy)
- **`loop`**: Repeats video infinitely
- **`playsinline`**: Prevents fullscreen on mobile iOS
- **`preload="metadata"`**: Loads only metadata initially (faster page load)
- **`poster`**: Shows image while video loads
- **`aria-label`**: Accessibility label for screen readers

### Responsive Video Loading

The `<source>` tags with `media` attributes ensure:
- Desktop users get high-quality video
- Tablet users get medium-quality video
- Mobile users get low-quality video (saves bandwidth)

Browsers automatically select the best source based on screen size and format support.

## 🎨 CSS Styling

The CSS is already added to `css/components/hero.css`:

```css
.hero-video-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -2; /* Behind overlay */
  overflow: hidden;
}

.hero-video-background video {
  position: absolute;
  top: 50%;
  left: 50%;
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  transform: translate(-50%, -50%);
  object-fit: cover; /* Ensures video covers entire area */
  object-position: center;
}

.hero-video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgba(10, 10, 10, 0.6) 0%,
    rgba(26, 26, 46, 0.5) 50%,
    rgba(22, 33, 62, 0.6) 100%
  );
  z-index: -1; /* Between video and content */
  pointer-events: none;
}
```

## ⚡ Performance Best Practices

### 1. File Size Optimization

- **Keep video short**: 3-10 seconds is ideal for looping backgrounds
- **Lower bitrate**: 1-2 Mbps is sufficient for background videos
- **Lower resolution**: 1080p max, often 720p is enough
- **Remove audio**: Saves significant file size

### 2. Loading Strategy

- **`preload="metadata"`**: Only loads metadata initially
- **Poster image**: Shows immediately while video loads
- **Lazy loading**: Consider loading video only when hero is visible

### 3. Mobile Considerations

- **Lower quality on mobile**: Use `media` queries to serve smaller files
- **Consider disabling on mobile**: Videos can drain battery/data
- **Test on real devices**: Ensure smooth playback

### 4. Browser Compatibility

- **MP4 (H.264)**: Universal support (IE9+)
- **WebM (VP9)**: Modern browsers (Chrome, Firefox, Edge)
- **Fallback**: Always include MP4 as fallback

## 🔧 Advanced: Conditional Loading

For better performance, you can conditionally load the video only on desktop:

```javascript
// In js/core/animations.js or create new module
export function initVideoBackground() {
  const videoContainer = document.querySelector('.hero-video-background');
  if (!videoContainer) return;

  // Only load video on desktop (saves mobile bandwidth)
  if (window.innerWidth >= 1025) {
    const video = videoContainer.querySelector('video');
    if (video) {
      video.load(); // Start loading video
    }
  }
}
```

Then call it in `js/main.js`:

```javascript
import { initVideoBackground } from './core/animations.js';
// ... other imports

// Initialize video background
initVideoBackground();
```

## 📱 Mobile Optimization

For mobile devices, consider:

1. **Disable video on mobile**: Use CSS to hide video on small screens
2. **Use static image**: Show poster image instead
3. **Lower quality**: Use `ripples-lq.mp4` with lower bitrate

Example CSS:

```css
@media (max-width: 768px) {
  .hero-video-background {
    display: none; /* Hide video on mobile */
  }
  
  .hero-background {
    background-image: url('./assets/video/optimized/ripples-poster.jpg');
    background-size: cover;
    background-position: center;
  }
}
```

## 🎯 Accessibility

- **`aria-label`**: Describes video for screen readers
- **Poster image**: Provides visual fallback
- **No audio**: Background videos should be silent
- **Keyboard navigation**: Ensure video doesn't interfere with keyboard users

## 🐛 Troubleshooting

### Video not autoplaying

- Ensure `muted` attribute is present (required by browsers)
- Check browser autoplay policies
- Verify video file paths are correct

### Video not looping

- Ensure `loop` attribute is present
- Check browser compatibility

### Video too large/slow loading

- Re-run optimization script with lower bitrates
- Use lower resolution versions
- Consider disabling on mobile

### Video not covering entire area

- Check `object-fit: cover` is applied
- Verify video dimensions are correct
- Ensure container has `overflow: hidden`

## 📊 File Size Guidelines

Target file sizes for background videos:

- **Desktop (1080p)**: 2-5 MB for 10-second loop
- **Tablet (720p)**: 1-3 MB for 10-second loop
- **Mobile (480p)**: 500 KB - 1.5 MB for 10-second loop

If files are larger, reduce:
- Bitrate (lower `-crf` value or lower bitrate)
- Resolution
- Frame rate
- Video duration

## 🚀 Next Steps

1. **Optimize video**: Run `npm run optimize-video`
2. **Add to HTML**: Add video element to hero section
3. **Test**: Check on different devices and browsers
4. **Monitor performance**: Use browser DevTools to check loading times
5. **Adjust as needed**: Fine-tune bitrates/resolutions based on results

## 📚 Additional Resources

- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [MDN: Video Element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video)
- [Web Video Codec Guide](https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Video_codecs)
- [Autoplay Policy](https://developer.mozilla.org/en-US/docs/Web/Media/Autoplay_guide)

