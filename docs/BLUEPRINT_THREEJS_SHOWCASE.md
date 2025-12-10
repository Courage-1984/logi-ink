# Feature Blueprint: Three.js Backgrounds Showcase Page

**Created:** 2025-01-30  
**Status:** Planning → Implementation

---

## 1. Feature Scope

### Inputs
- List of 20 Three.js backgrounds from `docs/TOP_20_THREEJS_BACKGROUNDS.md`
- Existing Three.js implementation patterns from `js/core/three-hero.js`
- Project HTML/CSS/JS architecture

### Outputs
- New showcase page: `showcase.html`
- New JavaScript module: `js/pages/showcase.js` (or extend `js/core/three-hero.js`)
- New CSS module: `css/pages/showcase.css`
- 20 viewport-sized sections, each with a unique Three.js background
- Hover tooltips showing name and description

### Expected User Flows
1. **Page Load:** User navigates to `/showcase`
2. **Scroll Navigation:** User scrolls through 20 full-viewport sections
3. **Hover Interaction:** User hovers over background name to see description
4. **Performance:** Only active section's Three.js instance runs (others paused)
5. **Mobile:** Graceful degradation (show static placeholders or disable Three.js)

---

## 2. Component Hierarchy

### HTML Structure
```
showcase.html
├── <head> (standard meta, security headers, SEO)
├── <body>
    ├── <!-- include partials/navbar.html -->
    ├── <main id="main-content">
    │   ├── <section class="showcase-section" data-bg="1">
    │   │   ├── <canvas id="threejs-showcase-1" class="threejs-canvas"></canvas>
    │   │   └── <div class="showcase-overlay">
    │   │       ├── <h2 class="showcase-title">Rotating Particles</h2>
    │   │       └── <p class="showcase-description">Description text...</p>
    │   │   </div>
    │   ├── <section class="showcase-section" data-bg="2">...</section>
    │   └── ... (20 sections total)
    └── <!-- include partials/footer.html -->
```

### CSS Modules
```
css/
├── pages/
│   └── showcase.css (new)
│       ├── .showcase-section (viewport height, position relative)
│       ├── .threejs-canvas (full viewport, z-index: 0)
│       ├── .showcase-overlay (centered, z-index: 1)
│       ├── .showcase-title (subtle styling, hover trigger)
│       └── .showcase-description (hidden by default, shown on hover)
```

### JavaScript Modules
```
js/
├── core/
│   └── three-hero.js (extend with showcase functions)
│       ├── initThreeJSShowcase1() - Rotating Particles
│       ├── initThreeJSShowcase2() - Particle Swarm
│       ├── ... (20 functions total)
│       └── initThreeJSShowcase() - Router function
└── pages/
    └── showcase.js (new)
        ├── initShowcase() - Main initialization
        ├── handleScroll() - Intersection Observer for pause/resume
        └── handleHover() - Description tooltip logic
```

---

## 3. State Design

### Global State
- `activeShowcaseIndex: number | null` - Currently visible section (0-19)
- `showcaseScenes: Array<Object>` - Array of { scene, renderer, camera, animateFn } for each section
- `isShowcasePaused: boolean` - Global pause state

### Per-Section State
- `isInitialized: boolean` - Whether Three.js scene is initialized
- `isPaused: boolean` - Whether this section's animation is paused
- `animationId: number | null` - requestAnimationFrame ID

### Data Flow
1. **Page Load:** Initialize all sections (lazy load Three.js)
2. **Scroll:** Intersection Observer detects visible section
3. **Visibility Change:** Pause non-visible sections, resume visible section
4. **Hover:** Show/hide description tooltip (CSS-only or JS-enhanced)

---

## 4. API Integration

**None required** - All client-side Three.js rendering.

**External Dependencies:**
- Three.js r128 (via CDN, loaded via `js/utils/three-loader.js`)
- No external APIs needed

---

## 5. Risks & Tradeoffs

### Performance Risks
1. **Memory Usage:** 20 Three.js instances could consume significant memory
   - **Mitigation:** Only initialize visible section, lazy-load others
   - **Mitigation:** Cleanup unused scenes when scrolling away

2. **GPU Load:** Multiple WebGL contexts may strain GPU
   - **Mitigation:** Only one active scene at a time
   - **Mitigation:** Pause/resume based on visibility

3. **Initial Load Time:** Loading 20 different Three.js scenes
   - **Mitigation:** Lazy initialization (only when section enters viewport)
   - **Mitigation:** Reuse common Three.js patterns where possible

### Edge Cases
1. **Mobile Devices:** Three.js may be too heavy
   - **Solution:** Disable Three.js on mobile, show static placeholders or CSS alternatives

2. **Browser Compatibility:** WebGL support varies
   - **Solution:** Feature detection, graceful fallback

3. **Scroll Performance:** Intersection Observer may fire too frequently
   - **Solution:** Throttle/debounce scroll events, use passive listeners

4. **Memory Leaks:** Forgetting to cleanup Three.js resources
   - **Solution:** Proper cleanup in `cleanupThreeHero()` pattern

### Tradeoffs
1. **Lazy vs Eager Loading:**
   - **Chosen:** Lazy loading (better initial performance)
   - **Tradeoff:** Slight delay when scrolling to new section

2. **One vs Multiple Renderers:**
   - **Chosen:** One renderer per section (simpler, isolated)
   - **Tradeoff:** More memory, but better isolation

3. **CSS vs JS Tooltips:**
   - **Chosen:** CSS hover (simpler, no JS needed)
   - **Tradeoff:** Less flexible, but more performant

---

## 6. Implementation Plan

### Phase 1: HTML Structure
- Create `showcase.html` with 20 sections
- Add canvas elements with unique IDs
- Add overlay divs with titles and descriptions
- Include navbar and footer partials

### Phase 2: CSS Styling
- Create `css/pages/showcase.css`
- Viewport-sized sections (100vh)
- Overlay positioning and styling
- Hover tooltip styles

### Phase 3: JavaScript - Background Functions
- Extend `js/core/three-hero.js` with 20 showcase functions
- Implement each background type (1-20)
- Follow existing patterns (pause/resume, mobile detection)

### Phase 4: JavaScript - Showcase Controller
- Create `js/pages/showcase.js`
- Intersection Observer for visibility detection
- Lazy initialization of Three.js scenes
- Pause/resume logic

### Phase 5: Integration
- Update `js/main.js` to load showcase.js on showcase page
- Update `css/main.css` to import showcase.css
- Test all 20 backgrounds

### Phase 6: Testing & Optimization
- Performance testing (memory, GPU usage)
- Mobile testing (graceful degradation)
- Cross-browser testing
- Accessibility testing (keyboard navigation, screen readers)

---

## 7. Documentation

### Files to Update/Create
1. **`showcase.html`** - New showcase page
2. **`css/pages/showcase.css`** - New CSS module
3. **`js/core/three-hero.js`** - Extended with 20 showcase functions
4. **`js/pages/showcase.js`** - New showcase controller
5. **`js/main.js`** - Add showcase.js initialization
6. **`css/main.css`** - Import showcase.css
7. **`docs/HERO_SECTIONS_DOCUMENTATION.md`** - Add showcase page entry
8. **`.cursor/rules/cursorrules.mdc`** - Update project structure

### Documentation Requirements
- JSDoc comments for all new functions
- Inline comments for complex logic
- README section explaining showcase page
- Performance notes and optimization tips

---

## 8. Success Criteria

✅ All 20 backgrounds render correctly  
✅ Each section fits viewport (100vh)  
✅ Hover tooltips show name and description  
✅ Only visible section's animation runs  
✅ Mobile devices show graceful fallback  
✅ Page loads in < 3 seconds (initial)  
✅ Smooth scrolling between sections  
✅ No memory leaks (proper cleanup)  
✅ Accessibility: keyboard navigation works  
✅ SEO: proper meta tags and structured data  

---

**Next Steps:** Proceed with Phase 1 (HTML Structure) → Phase 2 (CSS) → Phase 3 (JS Backgrounds) → Phase 4 (JS Controller) → Phase 5 (Integration) → Phase 6 (Testing)

