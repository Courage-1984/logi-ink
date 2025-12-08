# Top 20 Three.js Hero Background Options

Short reference guide for Three.js backgrounds suitable for hero sections.

**Last Updated:** 2025-01-30

---

## 1. Rotating Particles
**Description:** Thousands of particles rotating in 3D space. Simple, elegant, and performant. Perfect for tech/startup themes.

---

## 2. Particle Swarm (Boids/Flocking)
**Description:** Organic flocking behavior with particles that move like bird flocks. Reacts to mouse movement and forms natural clusters. Dynamic and interactive.

---

## 3. Floating Geometric Shapes
**Description:** Wireframe icosahedrons, octahedrons, or tetrahedrons floating and rotating in space. Clean, modern aesthetic.

---

## 4. Torus Grid with Parallax
**Description:** Grid of torus shapes arranged in a pattern. Scroll-based parallax creates depth. Great for portfolio/projects pages.

---

## 5. Particle Rain
**Description:** Particles falling from top to bottom with slight horizontal drift. Can include glow, trails, or fade effects. Good for tech/data themes.

---

## 6. Starfield
**Description:** Dense field of small particles creating a starry night effect. Can include twinkling animation. Classic space theme.

---

## 7. Wave Grid
**Description:** Grid of geometric shapes animated with sine waves. Creates flowing, organic movement patterns. Smooth and mesmerizing.

---

## 8. Nebula Clouds
**Description:** Large, glowing particles with color gradients creating nebula-like formations. Atmospheric and dreamy. Perfect for creative portfolios.

---

## 9. Connected Particles (Constellation)
**Description:** Particles connected by lines, forming constellation-like patterns. Interactive - lines appear/disappear based on distance. Network/data visualization feel.

---

## 10. Geometric Prisms
**Description:** Rotating triangular prisms or pyramids with glass-like materials. Refractive and reflective surfaces. Premium, sophisticated look.

---

## 11. Particle Explosion
**Description:** Particles radiating outward from center points. Can be continuous or triggered. Dynamic and energetic. Good for action/tech themes.

---

## 12. Liquid Morphing Blobs
**Description:** Smooth, organic blob shapes that morph and flow. Uses metaballs or marching squares algorithm. Fluid and modern aesthetic.

---

## 13. Wireframe Globe
**Description:** 3D wireframe sphere or globe rotating slowly. Can include latitude/longitude lines. Geographic or global themes.

---

## 14. Particle Vortex
**Description:** Particles spiraling inward or outward in a vortex pattern. Hypnotic, swirling motion. Great for abstract/creative sites.

---

## 15. Animated Grid Lines
**Description:** 3D grid lines that pulse, wave, or animate. Can respond to scroll or mouse. Tech/cyber aesthetic.

---

## 16. Particle Trails
**Description:** Particles leaving trails behind as they move. Creates flowing, ribbon-like effects. Dynamic and fluid motion.

---

## 17. Geometric Kaleidoscope
**Description:** Symmetrical geometric patterns that rotate and morph. Creates kaleidoscope-like visual effects. Artistic and mesmerizing.

---

## 18. Particle Fountain
**Description:** Particles rising from bottom like a fountain, then falling back down. Can include gravity and bounce effects. Playful and dynamic.

---

## 19. Shader-Based Noise
**Description:** Procedural noise shader creating organic, flowing patterns. GPU-accelerated, very performant. Abstract and modern.

---

## 20. Particle Orbits
**Description:** Particles orbiting around central points in elliptical paths. Can create solar system-like effects. Scientific or space themes.

---

## Implementation Notes

- All backgrounds should follow the existing pattern in `js/core/three-hero.js`
- Use `BufferGeometry` and `PointsMaterial` for particle systems (best performance)
- Implement pause/resume functionality for performance optimization
- Disable on mobile devices for better performance
- Use `requestAnimationFrame` for smooth animations
- Consider using spatial grids or instancing for large particle counts

---

**See Also:**
- `docs/HERO_BACKGROUND_OPTIONS.md` - Detailed implementation guides
- `docs/HERO_SECTIONS_DOCUMENTATION.md` - Current implementations

